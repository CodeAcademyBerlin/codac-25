'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { handleServerAction } from '@/lib/server-action-utils'

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

        const { type, name, participantIds } = parsed

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
                foundUsers: existingUsers.map(u => u.id),
                expectedCount: allParticipantIds.length,
                actualCount: existingUsers.length,
            },
        })

        if (existingUsers.length !== allParticipantIds.length) {
            const missingUsers = allParticipantIds.filter(id =>
                !existingUsers.some(user => user.id === id)
            )
            logger.error('Missing participants', undefined, {
                metadata: {
                    missing: missingUsers,
                    requested: allParticipantIds,
                    found: existingUsers.map(u => u.id),
                },
            })
            throw new Error('One or more participants not found')
        }

        // Check if direct conversation already exists
        if (type === 'DIRECT') {
            const existingConversation = await prisma.conversation.findFirst({
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
            const conversation = await tx.conversation.create({
                data: {
                    type: type,
                    name: name || (type === 'DIRECT' ? null : 'New Group'),
                    participants: {
                        create: allParticipantIds.map((userId) => ({
                            userId,
                        })),
                    },
                },
                select: {
                    id: true,
                    type: true,
                    name: true,
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
    })
}
