'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { 
    createDocSchema, 
    type CreateDocInput 
} from '@/lib/validation/doc';
import { type ServerActionResult } from '@/lib/server-action-utils';
import { auth } from '@/lib/auth/auth';
import { handlePrismaError } from '@/lib/server-action-utils';

// Define proper return type with Prisma's generated types
type DocumentWithAuthor = Prisma.DocumentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
    };
}>;

type CreateDocResult = ServerActionResult<DocumentWithAuthor>;

export async function createDoc(data: CreateDocInput): Promise<CreateDocResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('create', 'document', {
            metadata: { title: data.title, parentId: data.parentId }
        });

        // Validate input data
        const validatedData = createDocSchema.parse(data);

        // Get authenticated user
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Create document with proper types
        const document = await prisma.document.create({
            data: {
                title: validatedData.title,
                content: validatedData.content || (validatedData.isFolder ? [] : [{ type: 'p', children: [{ text: '' }] }]),
                parentId: validatedData.parentId,
                isFolder: validatedData.isFolder || false,
                type: validatedData.type || 'GENERAL',
                authorId: session.user.id,
                isPublished: false,
                isArchived: false,
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

        logger.logDatabaseOperation('create', 'document', document.id, {
            metadata: { title: document.title, authorId: document.author.id }
        });

        // Revalidate relevant paths
        revalidatePath('/docs');
        if (document.parentId) {
            revalidatePath(`/docs/${document.parentId}`);
        }

        const endTime = Date.now();
        logger.logServerAction('create', 'document', {
            metadata: {
                documentId: document.id,
                duration: endTime - startTime
            }
        });

        return {
            success: true,
            data: document
        };

    } catch (error) {
        logger.logServerActionError('create', 'document', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                duration: Date.now() - startTime,
                title: data.title,
                parentId: data.parentId
            }
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            logger.logValidationError('document', (error as any).errors);
            return {
                success: false,
                error: (error as any).errors
            };
        }

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            const errorMessage = handlePrismaError(error);
            return {
                success: false,
                error: errorMessage
            };
        }

        return {
            success: false,
            error: 'Failed to create document'
        };
    }
}