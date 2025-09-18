import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'

export interface ConversationWithParticipants {
    id: string
    type: string
    name: string | null
    createdAt: Date
    updatedAt: Date
    participants: Array<{
        id: string
        userId: string
        joinedAt: Date
        lastSeenAt: Date | null
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
    unreadCount?: number
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

        // Get conversations where user is a participant
        const conversations = await prisma.conversation.findMany({
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
                        userId: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        const formattedConversations: ConversationWithParticipants[] = conversations.map((conv: any) => {
            // Find current user's participant record to get lastSeenAt
            const currentUserParticipant = conv.participants.find((p: any) => p.userId === userId)
            const lastSeenAt = currentUserParticipant?.lastSeenAt

            // Calculate unread count - messages created after user's lastSeenAt
            let unreadCount = 0
            if (lastSeenAt) {
                // Count messages created after lastSeenAt (excluding user's own messages)
                unreadCount = conv.messages.filter((msg: any) =>
                    new Date(msg.createdAt) > new Date(lastSeenAt) && msg.userId !== userId
                ).length
            } else {
                // If user never seen the conversation, count all messages except their own
                unreadCount = conv.messages.filter((msg: any) => msg.userId !== userId).length
            }

            return {
                id: conv.id,
                type: conv.type,
                name: conv.name,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                participants: conv.participants,
                lastMessage: conv.messages[0] || null,
                unreadCount,
            }
        })

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

        const conversation = await prisma.conversation.findFirst({
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
