'use server'

import { z } from 'zod'

import { getUserConversations } from '@/data/chat/get-conversations'
import { handleServerAction } from '@/lib/server-action-utils'

const getUserConversationsSchema = z.object({})

export async function getUserConversationsAction(input: unknown = {}) {
    return handleServerAction(getUserConversationsSchema, input, async ({ user }) => {
        if (!user) {
            throw new Error('Authentication required')
        }

        const conversations = await getUserConversations(user.id)
        return { ok: true, data: conversations }
    })
}
