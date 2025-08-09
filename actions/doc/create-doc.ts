'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createDocSchema, type CreateDocInput } from '@/lib/validation/doc';
import { authOptions } from '@/lib/auth/auth';

export type CreateDocResult = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function createDoc(data: CreateDocInput): Promise<CreateDocResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('create', 'document', {
            metadata: { title: data.title, parentId: data.parentId }
        });

        // Validate input data
        const validatedData = createDocSchema.parse(data);

        // Get authenticated user
        const session = await getServerSession(authOptions);
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
        logger.logError('create', 'document', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create document'
        };
    }
}