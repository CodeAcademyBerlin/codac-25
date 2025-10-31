'use server';

import { Value } from 'platejs';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface TDiscussion {
    id: string;
    comments: TComment[];
    createdAt: Date;
    isResolved: boolean;
    userId: string;
    documentContent?: string;
}

export interface TComment {
    id: string;
    contentRich: Value;
    createdAt: Date;
    discussionId: string;
    isEdited: boolean;
    userId: string;
}

export interface UserData {
    id: string;
    name: string;
    avatarUrl: string;
    hue?: number;
}

/**
 * Get all discussions for a specific document
 */
export async function getDocumentDiscussions(
    documentId: string
): Promise<TDiscussion[]> {
    try {
        const discussions = await prisma.documentDiscussion.findMany({
            where: {
                documentId,
            },
            include: {
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Transform to Plate.js format
        return discussions.map((discussion) => ({
            id: discussion.id,
            comments: discussion.comments.map((comment) => ({
                id: comment.id,
                contentRich: comment.contentRich as Value,
                createdAt: comment.createdAt,
                discussionId: comment.discussionId,
                isEdited: comment.isEdited,
                userId: comment.userId,
            })),
            createdAt: discussion.createdAt,
            isResolved: discussion.isResolved,
            userId: discussion.userId,
            documentContent: discussion.documentContent || undefined,
        }));
    } catch (error) {
        logger.error('Failed to fetch document discussions', error instanceof Error ? error : undefined, {
            action: 'get_document_discussions',
            metadata: {
                documentId,
            },
        });
        return [];
    }
}

/**
 * Get all users that have participated in discussions for a document
 */
export async function getDiscussionUsers(documentId: string): Promise<Record<string, UserData>> {
    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        documentDiscussions: {
                            some: {
                                documentId,
                            },
                        },
                    },
                    {
                        documentComments: {
                            some: {
                                discussion: {
                                    documentId,
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                avatar: true,
            },
        });

        // Transform to Plate.js format
        const usersMap: Record<string, UserData> = {};
        users.forEach((user) => {
            usersMap[user.id] = {
                id: user.id,
                name: user.name ?? 'Anonymous',
                avatarUrl: user.avatar ?? `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
            };
        });

        return usersMap;
    } catch (error) {
        logger.error('Failed to fetch discussion users', error instanceof Error ? error : undefined, {
            action: 'get_discussion_users',
            metadata: {
                documentId,
            },
        });
        return {};
    }
}

/**
 * Get current user data for the discussion plugin
 */
export async function getCurrentUserForDiscussion(): Promise<UserData | null> {
    try {
        const { getServerSession } = await import('@/lib/auth/server');
        const session = await getServerSession();

        if (!session?.session?.user?.id) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.session.user.id,
            },
            select: {
                id: true,
                name: true,
                avatar: true,
            },
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            name: user.name ?? 'Anonymous',
            avatarUrl: user.avatar ?? `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
        };
    } catch (error) {
        logger.error('Failed to fetch current user for discussion', error instanceof Error ? error : undefined, {
            action: 'get_current_user_for_discussion',
        });
        return null;
    }
}
