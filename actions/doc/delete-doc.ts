'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
    deleteDocSchema,
    type DeleteDocInput,
    type ServerActionResult
} from '@/lib/validation/doc';

// Define return type for delete operation
type DeleteDocResult = ServerActionResult<{ id: string; title: string }>;

export async function deleteDoc(data: DeleteDocInput): Promise<DeleteDocResult> {
    try {
        // Validate input data
        const { id } = deleteDocSchema.parse(data);

        // Check if document exists and user has permission
        const existingDoc = await prisma.document.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                authorId: true,
                isArchived: true,
                parentId: true,
                _count: {
                    select: {
                        children: true,
                    },
                },
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
                error: 'Document is already archived'
            };
        }

        // Check if document has children
        if (existingDoc._count.children > 0) {
            return {
                success: false,
                error: 'Cannot delete document with sub-documents. Please delete or move sub-documents first.'
            };
        }

        // TODO: Add proper authorization check
        // if (existingDoc.authorId !== currentUserId) {
        //   return { success: false, error: 'Unauthorized' };
        // }

        // Soft delete by archiving (recommended approach)
        await prisma.document.update({
            where: { id },
            data: {
                isArchived: true,
                updatedAt: new Date(),
            },
        });

        // Alternative: Hard delete (uncomment if needed)
        // await prisma.document.delete({
        //   where: { id },
        // });

        // Revalidate relevant paths
        revalidatePath('/docs');
        if (existingDoc.parentId) {
            revalidatePath(`/docs/${existingDoc.parentId}`);
        }

        return {
            success: true,
            data: {
                id: existingDoc.id,
                title: existingDoc.title
            }
        };

    } catch (error) {
        console.error('Error deleting document:', error);

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
                case 'P2025':
                    return {
                        success: false,
                        error: 'Document not found'
                    };
                case 'P2003':
                    return {
                        success: false,
                        error: 'Cannot delete document due to related records'
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
            error: 'Failed to delete document'
        };
    }
} 