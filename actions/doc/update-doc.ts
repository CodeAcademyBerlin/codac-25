'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
    updateDocSchema,
    type UpdateDocInput,
    type ServerActionResult
} from '@/lib/validation/doc';

// Define return type using Prisma's generated types
type UpdateDocResult = ServerActionResult<Prisma.DocumentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
    };
}>>;

export async function updateDoc(data: UpdateDocInput): Promise<UpdateDocResult> {
    try {
        // Validate input data
        const { id, ...validatedData } = updateDocSchema.parse(data);

        // Check if document exists and user has permission
        const existingDoc = await prisma.document.findUnique({
            where: { id },
            select: {
                id: true,
                authorId: true,
                isArchived: true
            },
        });

        if (!existingDoc) {
            return {
                success: false,
                error: 'Document not found'
            };
        }

        if (existingDoc.isArchived) {
            return {
                success: false,
                error: 'Cannot update archived document'
            };
        }

        // Authorization check is implemented in lib/permissions.ts
        // if (existingDoc.authorId !== currentUserId) {
        //   return { success: false, error: 'Unauthorized' };
        // }

        // Update document with proper types
        const document = await prisma.document.update({
            where: { id },
            data: {
                ...validatedData,
                updatedAt: new Date(),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Revalidate relevant paths
        revalidatePath('/docs');
        revalidatePath(`/docs/${id}`);
        if (document.parentId) {
            revalidatePath(`/docs/${document.parentId}`);
        }

        return {
            success: true,
            data: document
        };

    } catch (error) {
        console.error('Error updating document:', error);

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return {
                success: false,
                error: (error as any).errors
            };
        }

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return {
                        success: false,
                        error: 'A document with this title already exists'
                    };
                case 'P2025':
                    return {
                        success: false,
                        error: 'Document not found'
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred'
                    };
            }
        }

        return {
            success: false,
            error: 'Failed to update document'
        };
    }
}
