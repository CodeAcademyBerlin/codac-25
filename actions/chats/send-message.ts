'use server'

import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { handleServerAction } from '@/lib/server-action-utils'
import { sendMessageSchema } from '@/schemas/chat'

/**
 * Server action to send a chat message
 */
export async function sendMessage(input: unknown) {
  return handleServerAction(sendMessageSchema, input, async ({ parsed, user }) => {
    if (!user) {
      throw new Error('Unauthorized: User must be authenticated to send messages')
    }

    try {
      logger.info('Sending message to room', {
        metadata: {
          roomName: parsed.roomName,
          contentLength: parsed.content.length,
          userId: user.id,
        },
      })

      const message = await (prisma as any).chatMessage.create({
        data: {
          content: parsed.content,
          conversationId: parsed.roomName, // Treating roomName as conversationId for backward compatibility
          userId: user.id,
          // Legacy fields for backward compatibility
          roomName: parsed.roomName,
          userName: user.name || user.email || 'Anonymous',
        },
        select: {
          id: true,
          content: true,
          roomName: true,
          userName: true,
          userId: true,
          createdAt: true,
        },
      })

      // Revalidate the chat page to ensure fresh data
      revalidatePath('/chat')
      revalidatePath(`/chat/${parsed.roomName}`)

      logger.info('Message sent successfully', {
        metadata: {
          messageId: message.id,
          roomName: parsed.roomName,
        },
      })

      return { ok: true, data: message }
    } catch (error) {
      logger.error('Error sending message', error instanceof Error ? error : new Error(String(error)), {
        metadata: { input: parsed }
      })
      throw error
    }
  })
}
