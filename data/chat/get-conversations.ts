import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'

export interface ConversationWithParticipants {
    id: string
    type: string
    name: string | null
    description: string | null
    createdAt: Date
    updatedAt: Date
    participants: Array<{
        id: string
        role: string
        user: {
            id: string
            name: string | null
            email: string | null
            avatar: string | null
        }
    }>
    lastMessage?: {
        id: string
        content: string
        createdAt: Date
        userName: string | null
    } | null
}

/**
 * Get all conversations for a user with participants and last message
 */
export async function getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
    try {
        logger.info('Fetching user conversations', {
            metadata: {
                userId,
            },
        })

        // Type assertion for Prisma client until types are properly loaded
        const conversations = await (prisma as any).conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        joinedAt: 'asc',
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        userName: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        const formattedConversations: ConversationWithParticipants[] = conversations.map((conv: any) => ({
            id: conv.id,
            type: conv.type,
            name: conv.name,
            description: conv.description,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            participants: conv.participants,
            lastMessage: conv.messages[0] || null,
        }))

        logger.info('User conversations fetched successfully', {
            metadata: {
                userId,
                conversationCount: formattedConversations.length,
            },
        })

        return formattedConversations
    } catch (error) {
        logger.error('Failed to fetch user conversations', error instanceof Error ? error : new Error(String(error)))
        throw new Error('Failed to fetch conversations')
    }
}

/**
 * Get a specific conversation with messages
 */
export async function getConversation(conversationId: string, userId: string) {
    try {
        logger.info('Fetching conversation', {
            metadata: {
                conversationId,
                userId,
            },
        })

        const conversation = await (prisma as any).conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        userName: true,
                        userId: true,
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        })

        if (!conversation) {
            throw new Error('Conversation not found or access denied')
        }

        logger.info('Conversation fetched successfully', {
            metadata: {
                conversationId,
                messageCount: conversation.messages.length,
            },
        })

        return conversation
    } catch (error) {
        logger.error('Failed to fetch conversation', error instanceof Error ? error : new Error(String(error)))
        throw new Error('Failed to fetch conversation')
    }
}
