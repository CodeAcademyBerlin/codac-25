'use server'

import { auth } from '@/lib/auth/auth'
import { findExistingDirectConversation } from './find-existing-conversation'
import { createConversation } from './create-conversation'
import { logger } from '@/lib/logger'

/**
 * Start a direct message conversation with a user
 * This function will either find an existing direct conversation or create a new one
 * and return the conversation ID
 */
export async function startDirectMessage(participantId: string) {
    try {
        // Check authentication
        const session = await auth()
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        // Prevent self-messaging
        if (session.user.id === participantId) {
            return {
                success: false,
                error: 'Cannot start a conversation with yourself'
            }
        }

        logger.info('Starting direct message', {
            metadata: { participantId, currentUserId: session.user.id }
        })

        // First, check if a direct conversation already exists
        const existingResult = await findExistingDirectConversation(participantId)

        if (!existingResult.success) {
            return {
                success: false,
                error: existingResult.error || 'Failed to check existing conversations'
            }
        }

        let conversationId: string

        if (existingResult.data?.conversationId) {
            // Use existing conversation
            conversationId = existingResult.data.conversationId
            logger.info('Using existing conversation', {
                metadata: { conversationId, participantId }
            })
        } else {
            // Create new direct conversation
            const createResult = await createConversation({
                type: 'DIRECT',
                participantIds: [participantId]
            })

            if (!createResult.success) {
                return {
                    success: false,
                    error: 'Failed to create conversation'
                }
            }

            conversationId = createResult.data.conversationId
            logger.info('Created new conversation', {
                metadata: { conversationId, participantId }
            })

            // Small delay to ensure database transaction is committed
            // This helps prevent race conditions when immediately navigating to the chat
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        return {
            success: true,
            data: { conversationId }
        }

    } catch (error) {
        logger.error('Error starting direct message', error instanceof Error ? error : new Error(String(error)))
        return {
            success: false,
            error: 'Failed to start direct message'
        }
    }
}
