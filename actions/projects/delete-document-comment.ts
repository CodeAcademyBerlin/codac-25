'use server';

import { revalidatePath } from 'next/cache';

import { z } from 'zod';
import { Prisma } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    handlePrismaError,
    type ServerActionResult,
} from '@/lib/utils/server-action-utils';

const deleteDocumentCommentSchema = z.object({
    id: z.string().cuid(),
});

type DeleteDocumentCommentInput = z.infer<typeof deleteDocumentCommentSchema>;

export async function deleteDocumentComment(
    input: DeleteDocumentCommentInput
): Promise<ServerActionResult<{ success: boolean }>> {
    try {
        // Validate input
        const validatedInput = deleteDocumentCommentSchema.parse(input);

        // Get current user
        const user = await getCurrentUser();
        if (!user) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Verify the comment exists and user owns it
        const existingComment = await prisma.documentComment.findFirst({
            where: {
                id: validatedInput.id,
                userId: user.id,
            },
        });

        if (!existingComment) {
            return {
                success: false,
                error: 'Comment not found or access denied',
            };
        }

        // Delete the comment and all its replies
        await prisma.documentComment.deleteMany({
            where: {
                OR: [
                    { id: validatedInput.id },
                    { parentId: validatedInput.id },
                ],
            },
        });

        // Revalidate relevant pages
        // Note: DocumentComment doesn't have direct documentId, revalidate general pages
        revalidatePath('/projects');

        logger.info('Document comment deleted successfully', {
            action: 'delete_document_comment',
            resource: 'document_comment',
            resourceId: validatedInput.id,
            metadata: {
                userId: user.id,
                commentId: validatedInput.id,
                discussionId: existingComment.discussionId,
            },
        });

        return {
            success: true,
            data: { success: true },
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
