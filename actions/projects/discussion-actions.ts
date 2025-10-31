'use server';

import { revalidatePath } from 'next/cache';
import { Value } from 'platejs';

import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ServerActionResult } from '@/types/server-action';

export interface CreateDiscussionInput {
    documentId: string;
    documentContent?: string;
}

export interface CreateCommentInput {
    discussionId: string;
    contentRich: Value;
    parentId?: string;
}

export interface UpdateCommentInput {
    commentId: string;
    contentRich: Value;
}

export interface ResolveDiscussionInput {
    discussionId: string;
    isResolved: boolean;
}

/**
 * Create a new discussion for a document
 */
export async function createDiscussion(
    input: CreateDiscussionInput
): Promise<ServerActionResult<{ discussionId: string }>> {
    try {
        const session = await getSession();

        if (!session?.session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        const discussion = await prisma.documentDiscussion.create({
            data: {
                documentId: input.documentId,
                userId: session.session.user.id,
                documentContent: input.documentContent,
                isResolved: false,
            },
        });

        logger.info('Discussion created successfully', {
            action: 'create_discussion',
            metadata: {
                discussionId: discussion.id,
                documentId: input.documentId,
                userId: session.session.user.id,
            },
        });

        revalidatePath(`/projects/${input.documentId}`);

        return {
            success: true,
            data: { discussionId: discussion.id },
        };
    } catch (error) {
        logger.error('Failed to create discussion', error instanceof Error ? error : undefined, {
            action: 'create_discussion',
            metadata: {
                documentId: input.documentId,
            },
        });

        return {
            success: false,
            error: 'Failed to create discussion',
        };
    }
}

/**
 * Add a comment to a discussion
 */
export async function createComment(
    input: CreateCommentInput
): Promise<ServerActionResult<{ commentId: string }>> {
    try {
        const session = await getSession();

        if (!session?.session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Verify the discussion exists and get the document ID
        const discussion = await prisma.documentDiscussion.findUnique({
            where: { id: input.discussionId },
            select: { documentId: true },
        });

        if (!discussion) {
            return {
                success: false,
                error: 'Discussion not found',
            };
        }

        const comment = await prisma.documentComment.create({
            data: {
                discussionId: input.discussionId,
                userId: session.session.user.id,
                contentRich: input.contentRich as any,
                parentId: input.parentId,
                isEdited: false,
            },
        });

        logger.info('Comment created successfully', {
            action: 'create_comment',
            metadata: {
                commentId: comment.id,
                discussionId: input.discussionId,
                userId: session.session.user.id,
            },
        });

        revalidatePath(`/projects/${discussion.documentId}`);

        return {
            success: true,
            data: { commentId: comment.id },
        };
    } catch (error) {
        logger.error('Failed to create comment', error instanceof Error ? error : undefined, {
            action: 'create_comment',
            metadata: {
                discussionId: input.discussionId,
            },
        });

        return {
            success: false,
            error: 'Failed to create comment',
        };
    }
}

/**
 * Update an existing comment
 */
export async function updateComment(
    input: UpdateCommentInput
): Promise<ServerActionResult<{ commentId: string }>> {
    try {
        const session = await getSession();

        if (!session?.session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Verify the comment exists and belongs to the user
        const existingComment = await prisma.documentComment.findUnique({
            where: { id: input.commentId },
            select: {
                userId: true,
                discussion: {
                    select: { documentId: true },
                },
            },
        });

        if (!existingComment) {
            return {
                success: false,
                error: 'Comment not found',
            };
        }

        if (existingComment.userId !== session.session.user.id) {
            return {
                success: false,
                error: 'Unauthorized to edit this comment',
            };
        }

        const comment = await prisma.documentComment.update({
            where: { id: input.commentId },
            data: {
                contentRich: input.contentRich as any,
                isEdited: true,
            },
        });

        logger.info('Comment updated successfully', {
            action: 'update_comment',
            metadata: {
                commentId: comment.id,
                userId: session.session.user.id,
            },
        });

        revalidatePath(`/projects/${existingComment.discussion.documentId}`);

        return {
            success: true,
            data: { commentId: comment.id },
        };
    } catch (error) {
        logger.error('Failed to update comment', error instanceof Error ? error : undefined, {
            action: 'update_comment',
            metadata: {
                commentId: input.commentId,
            },
        });

        return {
            success: false,
            error: 'Failed to update comment',
        };
    }
}

/**
 * Resolve or unresolve a discussion
 */
export async function resolveDiscussion(
    input: ResolveDiscussionInput
): Promise<ServerActionResult<{ discussionId: string }>> {
    try {
        const session = await getSession();

        if (!session?.session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Verify the discussion exists and get the document ID
        const existingDiscussion = await prisma.documentDiscussion.findUnique({
            where: { id: input.discussionId },
            select: {
                documentId: true,
                userId: true,
            },
        });

        if (!existingDiscussion) {
            return {
                success: false,
                error: 'Discussion not found',
            };
        }

        // Only the discussion creator or admin can resolve it
        if (existingDiscussion.userId !== session.session.user.id) {
            // TODO: Add admin role check here if needed
            return {
                success: false,
                error: 'Unauthorized to resolve this discussion',
            };
        }

        const discussion = await prisma.documentDiscussion.update({
            where: { id: input.discussionId },
            data: {
                isResolved: input.isResolved,
            },
        });

        logger.info('Discussion resolution updated', {
            action: 'resolve_discussion',
            metadata: {
                discussionId: discussion.id,
                isResolved: input.isResolved,
                userId: session.session.user.id,
            },
        });

        revalidatePath(`/projects/${existingDiscussion.documentId}`);

        return {
            success: true,
            data: { discussionId: discussion.id },
        };
    } catch (error) {
        logger.error('Failed to resolve discussion', error instanceof Error ? error : undefined, {
            action: 'resolve_discussion',
            metadata: {
                discussionId: input.discussionId,
            },
        });

        return {
            success: false,
            error: 'Failed to resolve discussion',
        };
    }
}
