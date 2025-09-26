'use server';

import { revalidatePath } from 'next/cache';

import { Prisma } from '@prisma/client';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    handlePrismaError,
    type ServerActionResult,
} from '@/lib/utils/server-action-utils';

const createDocumentCommentSchema = z.object({
    content: z.any(), // Plate.js Value type
    discussionId: z.string(),
    documentId: z.string(), // Now references the Document model
    parentId: z.string().optional(),
    documentContent: z.string().optional(),
});

type CreateDocumentCommentInput = z.infer<typeof createDocumentCommentSchema>;

export async function createDocumentComment(
    input: CreateDocumentCommentInput
): Promise<ServerActionResult<{ id: string }>> {
    try {
        // Validate input
        const validatedInput = createDocumentCommentSchema.parse(input);

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Verify the document exists and user has access
        const document = await prisma.document.findFirst({
            where: {
                id: validatedInput.documentId,
                OR: [
                    { isPublished: true },
                    { authorId: user.id },
                    {
                        project: {
                            OR: [
                                { isPublic: true },
                                { projectProfile: { userId: user.id } },
                            ],
                        },
                    },
                ],
            },
            include: {
                project: {
                    select: {
                        id: true,
                        isPublic: true,
                        projectProfile: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!document) {
            return {
                success: false,
                error: 'Document not found or access denied',
            };
        }

        // Create the document comment
        const comment = await prisma.documentComment.create({
            data: {
                contentRich: validatedInput.content as Prisma.InputJsonValue,
                discussionId: validatedInput.discussionId,
                userId: user.id,
                parentId: validatedInput.parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        // Revalidate relevant pages
        if (document.projectId) {
            revalidatePath(`/projects/${document.projectId}`);
        }
        revalidatePath('/projects');

        logger.info('Document comment created successfully', {
            action: 'create_document_comment',
            resource: 'document_comment',
            resourceId: comment.id,
            metadata: {
                userId: user.id,
                documentType: document.documentType,
                documentId: validatedInput.documentId,
                discussionId: validatedInput.discussionId,
                projectId: document.projectId,
            },
        });

        return {
            success: true,
            data: { id: comment.id },
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
