'use server'

import { getConversation } from '@/data/chat/get-conversations'
import { handleServerAction } from '@/lib/server-action-utils'
import { z } from 'zod'

const getConversationSchema = z.object({
    conversationId: z.string().min(1),
})

export async function getConversationAction(input: unknown) {
    return handleServerAction(getConversationSchema, input, async ({ parsed, user }) => {
        if (!user) {
            throw new Error('Authentication required')
        }

        try {
            const conversation = await getConversation(parsed.conversationId, user.id)
            return { ok: true, data: conversation }
        } catch (error) {
            throw error
        }
    })
}
