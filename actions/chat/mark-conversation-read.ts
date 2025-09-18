'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { handleServerAction } from '@/lib/server-action-utils'
import { logger } from '@/lib/logger'

const markConversationReadSchema = z.object({
    conversationId: z.string().min(1),
})

export async function markConversationReadAction(input: unknown) {
    return handleServerAction(markConversationReadSchema, input, async ({ parsed, user }) => {
        if (!user) {
            throw new Error('Unauthorized: User must be authenticated')
        }

        const { conversationId } = parsed

        logger.info('Marking conversation as read', {
            metadata: {
                conversationId,
                userId: user.id,
            },
        })

        // Update the user's lastSeenAt timestamp for this conversation
        await prisma.conversationParticipant.updateMany({
            where: {
                conversationId,
                userId: user.id,
            },
            data: {
                lastSeenAt: new Date(),
            },
        })

        logger.info('Conversation marked as read successfully', {
            metadata: {
                conversationId,
                userId: user.id,
            },
        })

        return { ok: true, data: { success: true } }
    })
}
