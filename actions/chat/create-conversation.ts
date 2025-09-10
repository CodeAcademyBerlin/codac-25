'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db/prisma'
import { handleServerAction } from '@/lib/server-action-utils'
import { logger } from '@/lib/logger'

// Create the schema with string literals for now, until Prisma client is regenerated
const createConversationSchema = z.object({
    type: z.enum(['DIRECT', 'GROUP', 'CHANNEL']),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    participantIds: z.array(z.string()).min(1).max(50),
})

export async function createConversation(input: unknown) {
    return handleServerAction(createConversationSchema, input, async ({ parsed, user }) => {
        if (!user) {
            throw new Error('Authentication required')
        }

        try {
            const { type, name, description, participantIds } = parsed

            // Ensure the current user is included in participants
            const allParticipantIds = Array.from(new Set([user.id, ...participantIds]))

            // For direct conversations, ensure only 2 participants
            if (type === 'DIRECT' && allParticipantIds.length !== 2) {
                throw new Error('Direct conversations must have exactly 2 participants')
            }

            // Verify all participants exist
            const existingUsers = await prisma.user.findMany({
                where: { id: { in: allParticipantIds } },
                select: { id: true },
            })

            logger.info('Participant validation debug', {
                metadata: {
                    requestedParticipants: allParticipantIds,
                    foundUsers: existingUsers.map((u: { id: string }) => u.id),
                    expectedCount: allParticipantIds.length,
                    actualCount: existingUsers.length,
                },
            })

            if (existingUsers.length !== allParticipantIds.length) {
                const missingUsers = allParticipantIds.filter(id =>
                    !existingUsers.some((user: { id: string }) => user.id === id)
                )
                logger.error('Missing participants', undefined, {
                    metadata: {
                        missing: missingUsers,
                        requested: allParticipantIds,
                        found: existingUsers.map((u: { id: string }) => u.id),
                    },
                })
                throw new Error('One or more participants not found')
            }

            // Check if direct conversation already exists
            if (type === 'DIRECT') {
                const existingConversation = await (prisma as any).conversation.findFirst({
                    where: {
                        type: 'DIRECT',
                        participants: {
                            every: {
                                userId: { in: allParticipantIds },
                            },
                        },
                    },
                    include: {
                        participants: {
                            select: { userId: true },
                        },
                    },
                })

                if (
                    existingConversation &&
                    existingConversation.participants.length === 2 &&
                    allParticipantIds.every((id) =>
                        existingConversation.participants.some((p: { userId: string }) => p.userId === id)
                    )
                ) {
                    logger.info('Direct conversation already exists', {
                        metadata: {
                            conversationId: existingConversation.id,
                            participants: allParticipantIds,
                        },
                    })
                    return { ok: true, data: { conversationId: existingConversation.id } }
                }
            }

            // Create conversation with participants in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const conversation = await (tx as any).conversation.create({
                    data: {
                        type: type as any, // Using any for now until types are properly generated
                        name: name || (type === 'DIRECT' ? null : 'New Group'),
                        description,
                        participants: {
                            create: allParticipantIds.map((userId) => ({
                                userId,
                                role: userId === user.id ? 'OWNER' : type === 'DIRECT' ? 'MEMBER' : 'MEMBER',
                            })),
                        },
                    },
                    select: {
                        id: true,
                        type: true,
                        name: true,
                        description: true,
                        createdAt: true,
                    },
                })

                return conversation
            })

            logger.info('Conversation created successfully', {
                metadata: {
                    conversationId: result.id,
                    type,
                    participantCount: allParticipantIds.length,
                    createdBy: user.id,
                },
            })

            revalidatePath('/chat')
            return { ok: true, data: { conversationId: result.id } }
        } catch (error) {
            logger.error('Error creating conversation', error instanceof Error ? error : new Error(String(error)))
            throw error
        }
    })
}
