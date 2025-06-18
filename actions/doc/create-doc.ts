'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    createDocSchema,
    type CreateDocInput,
    type ServerActionResult
} from '@/lib/validation/doc';

// Define return type using Prisma's generated types
type CreateDocResult = ServerActionResult<Prisma.DocumentGetPayload<{
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

export async function createDoc(data: CreateDocInput): Promise<CreateDocResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('create', 'document', {
            metadata: { title: data.title, parentId: data.parentId }
        });

        // Validate input data
        const validatedData = createDocSchema.parse(data);

        // TODO: Replace with actual user ID from auth context
        const TEMP_USER_ID = 'demo-user';

        // Ensure demo user exists (temporary solution)
        await prisma.user.upsert({
            where: { id: TEMP_USER_ID },
            update: {},
            create: {
                id: TEMP_USER_ID,
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'STUDENT',
                status: 'ACTIVE',
            },
        });

        // Create document with proper types
        const document = await prisma.document.create({
            data: {
                title: validatedData.title,
                content: validatedData.content || (validatedData.isFolder ? [] : [{ type: 'p', children: [{ text: '' }] }]),
                parentId: validatedData.parentId,
                isFolder: validatedData.isFolder || false,
                type: validatedData.type || 'GENERAL',
                authorId: TEMP_USER_ID,
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

        logger.info('Document created successfully', {
            action: 'create',
            resource: 'document',
            resourceId: document.id,
            metadata: {
                duration: Date.now() - startTime,
                title: document.title,
                authorId: document.author.id
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
                title: data.title
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
            switch (error.code) {
                case 'P2002':
                    return {
                        success: false,
                        error: 'A document with this title already exists'
                    };
                case 'P2003':
                    return {
                        success: false,
                        error: 'Invalid parent document reference'
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
            error: 'Failed to create document'
        };
    }
}