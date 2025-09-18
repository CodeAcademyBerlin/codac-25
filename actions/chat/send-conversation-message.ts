'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/db/prisma'
import { handleServerAction } from '@/lib/server-action-utils'
import { logger } from '@/lib/logger'
import { notificationService } from '@/lib/notification-service'

const sendConversationMessageSchema = z.object({
    conversationId: z.string().min(1),
    content: z.string().min(1).max(10000),
})

export async function sendConversationMessage(input: unknown) {
    return handleServerAction(sendConversationMessageSchema, input, async ({ parsed, user }) => {
        if (!user) {
            throw new Error('Unauthorized: User must be authenticated to send messages')
        }

        try {
            const { conversationId, content } = parsed

            // Verify user is a participant in this conversation
            const participation = await prisma.conversationParticipant.findFirst({
                where: {
                    conversationId,
                    userId: user.id,
                },
            })

            if (!participation) {
                throw new Error('Access denied: User is not a participant in this conversation')
            }

            logger.info('Sending message to conversation', {
                metadata: {
                    conversationId,
                    contentLength: content.length,
                    userId: user.id,
                },
            })

            // Create the message
            const message = await prisma.chatMessage.create({
                data: {
                    content,
                    userName: user.name || user.email || 'Anonymous',
                    userId: user.id,
                    conversationId,
                    // Keep roomName for backward compatibility (can be null)
                    roomName: null,
                },
                select: {
                    id: true,
                    content: true,
                    userName: true,
                    userId: true,
                    createdAt: true,
                    conversationId: true,
                },
            })

            // Update conversation's updated timestamp
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            })

            // Send notifications to other participants
            await notificationService.notifyConversationMessage(
                message.id,
                conversationId,
                user.id,
                content
            )

            // Broadcast conversation update for real-time UI updates
            await notificationService.broadcastConversationUpdate(
                conversationId,
                'new_message',
                {
                    messageId: message.id,
                    senderId: user.id,
                    senderName: user.name || user.email || 'Anonymous',
                    content: content.substring(0, 100) // Truncated content for preview
                }
            )

            revalidatePath('/chat')
            revalidatePath(`/chat/conversation/${conversationId}`)

            logger.info('Message sent to conversation successfully', {
                metadata: {
                    messageId: message.id,
                    conversationId,
                },
            })

            return { ok: true, data: message }
        } catch (error) {
            logger.error('Error sending message to conversation', error instanceof Error ? error : new Error(String(error)))
            throw error
        }
    })
}
