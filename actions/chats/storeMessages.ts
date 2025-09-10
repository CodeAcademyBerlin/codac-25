'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { handleServerAction } from '@/lib/server-action-utils'

// Schema for storing multiple messages
const storeMessagesSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      userName: z.string(),
      createdAt: z.string(),
    })
  ),
  roomName: z.string().min(1, 'Room name is required'),
})

/**
 * Server action to store multiple chat messages (bulk operation)
 */
export async function storeMessages(input: unknown) {
  return handleServerAction(storeMessagesSchema, input, async ({ parsed, user }) => {
    if (!user) {
      throw new Error('Unauthorized: User must be authenticated to store messages')
    }

    try {
      logger.info('Storing chat messages', {
        metadata: {
          messageCount: parsed.messages.length,
          roomName: parsed.roomName,
          userId: user.id,
        },
      })

      // Convert to database format
      const messagesToInsert = parsed.messages.map((message) => ({
        id: message.id,
        content: message.content,
        conversationId: parsed.roomName, // Treating roomName as conversationId for backward compatibility
        userId: user.id,
        // Legacy fields for backward compatibility
        roomName: parsed.roomName,
        userName: message.userName,
        createdAt: new Date(message.createdAt),
      }))

      // Use transaction for bulk operations
      await prisma.$transaction(
        messagesToInsert.map((messageData) =>
          (prisma as any).chatMessage.upsert({
            where: { id: messageData.id },
            update: {
              content: messageData.content,
              updatedAt: new Date(),
            },
            create: messageData,
          })
        )
      )

      // Revalidate relevant paths
      revalidatePath('/chat')
      revalidatePath(`/chat/${parsed.roomName}`)

      logger.info('Chat messages stored successfully', {
        metadata: {
          messageCount: parsed.messages.length,
          roomName: parsed.roomName,
        },
      })

      return { ok: true, data: { stored: parsed.messages.length } }
    } catch (error) {
      logger.error('Error storing messages', error instanceof Error ? error : new Error(String(error)), {
        metadata: { input: parsed }
      })
      throw error
    }
  })
}