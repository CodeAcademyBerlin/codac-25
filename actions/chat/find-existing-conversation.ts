'use server'

import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'

export async function findExistingDirectConversation(participantId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Authentication required')
    }

    const currentUserId = session.user.id

    try {
        // Find existing direct conversation between current user and the participant
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                type: 'DIRECT',
                participants: {
                    every: {
                        OR: [
                            { userId: currentUserId },
                            { userId: participantId }
                        ]
                    }
                },
                // Ensure exactly 2 participants (current user + target user)
                AND: {
                    participants: {
                        some: { userId: currentUserId }
                    }
                }
            },
            include: {
                participants: {
                    select: {
                        userId: true
                    }
                }
            }
        })

        // Verify it's exactly between these two users
        if (existingConversation) {
            const participantIds = existingConversation.participants.map(p => p.userId)
            if (participantIds.length === 2 &&
                participantIds.includes(currentUserId) &&
                participantIds.includes(participantId)) {
                return {
                    success: true,
                    data: { conversationId: existingConversation.id }
                }
            }
        }

        return {
            success: true,
            data: { conversationId: null }
        }
    } catch (error) {
        console.error('Error finding existing conversation:', error)
        return {
            success: false,
            error: 'Failed to check for existing conversation'
        }
    }
}
