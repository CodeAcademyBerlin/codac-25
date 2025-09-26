'use server';

import { revalidatePath } from 'next/cache';

import { Prisma } from '@prisma/client';
// import { type Value } from 'platejs';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    handlePrismaError,
    type ServerActionResult,
} from '@/lib/utils/server-action-utils';

const createDocumentSchema = z.object({
    content: z.any(), // Plate.js Value type
    title: z.string().optional(),
    description: z.string().optional(),
    documentType: z.enum(['project_summary', 'community_post', 'lesson_content', 'blog_post']),
    projectId: z.string().optional(), // If this document belongs to a project
    isPublished: z.boolean().default(false),
});

type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export async function createDocument(
    input: CreateDocumentInput
): Promise<ServerActionResult<{ id: string }>> {
    try {
        // Validate input
        const validatedInput = createDocumentSchema.parse(input);

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // If projectId is provided, verify the project exists and user has access
        if (validatedInput.projectId) {
            const project = await prisma.project.findFirst({
                where: {
                    id: validatedInput.projectId,
                    projectProfile: {
                        userId: user.id,
                    },
                },
            });

            if (!project) {
                return {
                    success: false,
                    error: 'Project not found or access denied',
                };
            }
        }

        // Create the document
        const document = await prisma.document.create({
            data: {
                content: validatedInput.content as Prisma.InputJsonValue,
                title: validatedInput.title,
                description: validatedInput.description,
                documentType: validatedInput.documentType,
                projectId: validatedInput.projectId,
                authorId: user.id,
                isPublished: validatedInput.isPublished,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        // Note: Project model doesn't have a summaryDocumentId field
        // The relationship is handled through the Document model's projectId field

        // Revalidate relevant pages
        if (validatedInput.projectId) {
            revalidatePath(`/projects/${validatedInput.projectId}`);
        }
        revalidatePath('/projects');

        logger.info('Document created successfully', {
            action: 'create_document',
            resource: 'document',
            resourceId: document.id,
            metadata: {
                userId: user.id,
                documentType: validatedInput.documentType,
                projectId: validatedInput.projectId,
            },
        });

        return {
            success: true,
            data: { id: document.id },
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Invalid input data',
            };
        }

        return {
            success: false,
            error: error instanceof Prisma.PrismaClientKnownRequestError 
                ? handlePrismaError(error)
                : 'An unexpected error occurred',
        };
    }
}
