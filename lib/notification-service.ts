import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/client'

export interface NotificationData {
    type: 'DIRECT_MESSAGE' | 'GROUP_MESSAGE' | 'CHANNEL_MESSAGE' | 'MENTION' | 'CONVERSATION_INVITE' | 'SYSTEM'
    title: string
    message: string
    metadata?: Record<string, any>
    messageId?: string
    conversationId?: string
}

export interface NotificationRecipient {
    userId: string
    preferences?: {
        inApp?: boolean
        email?: boolean
        push?: boolean
    }
}

export class NotificationService {
    private supabase = createClient()

    /**
     * Send realtime notification to users
     */
    async sendRealtimeNotification(
        data: NotificationData,
        recipients: NotificationRecipient[]
    ): Promise<void> {
        try {
            for (const recipient of recipients) {
                const notification = {
                    ...data,
                    id: `notification_${Date.now()}_${recipient.userId}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    userId: recipient.userId
                }

                // Send to user-specific channel for realtime updates
                const userChannel = this.supabase.channel(`user:notifications:${recipient.userId}`)

                await userChannel.send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: notification
                })

                logger.info('Realtime notification sent', {
                    metadata: {
                        userId: recipient.userId,
                        type: data.type,
                        notificationId: notification.id
                    }
                })
            }
        } catch (error) {
            logger.error('Error sending realtime notifications', error instanceof Error ? error : new Error(String(error)))
        }
    }

    /**
     * Send chat message notifications
     */
    async notifyConversationMessage(
        messageId: string,
        conversationId: string,
        senderId: string,
        content: string
    ): Promise<void> {
        try {
            // Get conversation details and participants
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    }
                }
            })

            if (!conversation) {
                throw new Error('Conversation not found')
            }

            const sender = conversation.participants.find(p => p.userId === senderId)?.user
            if (!sender) {
                throw new Error('Sender not found in conversation')
            }

            // Get recipients (exclude sender)
            const recipients = conversation.participants
                .filter(p => p.userId !== senderId)
                .map(p => ({ userId: p.userId }))

            if (recipients.length === 0) {
                return // No one to notify
            }

            // Determine notification type and content based on conversation type
            let notificationType: NotificationData['type']
            let title: string
            let message: string

            switch (conversation.type) {
                case 'DIRECT':
                    notificationType = 'DIRECT_MESSAGE'
                    title = `New message from ${sender.name || sender.email || 'Someone'}`
                    message = this.truncateContent(content)
                    break
                case 'GROUP':
                    notificationType = 'GROUP_MESSAGE'
                    title = `${sender.name || sender.email || 'Someone'} in ${conversation.name || 'Group Chat'}`
                    message = this.truncateContent(content)
                    break
                case 'CHANNEL':
                    notificationType = 'CHANNEL_MESSAGE'
                    title = `${sender.name || sender.email || 'Someone'} in #${conversation.name || 'channel'}`
                    message = this.truncateContent(content)
                    break
                default:
                    notificationType = 'DIRECT_MESSAGE'
                    title = 'New message'
                    message = this.truncateContent(content)
            }

            // Check for mentions
            const mentions = this.extractMentions(content)
            if (mentions.length > 0) {
                // Send mention notifications to mentioned users
                const mentionedRecipients = recipients.filter(r =>
                    mentions.some(mention => {
                        const participant = conversation.participants.find(p => p.userId === r.userId)
                        return participant?.user.name?.toLowerCase().includes(mention.toLowerCase()) ||
                            participant?.user.email?.toLowerCase().includes(mention.toLowerCase())
                    })
                )

                if (mentionedRecipients.length > 0) {
                    await this.sendRealtimeNotification({
                        type: 'MENTION',
                        title: `${sender.name || sender.email || 'Someone'} mentioned you`,
                        message: this.truncateContent(content),
                        metadata: {
                            conversationId,
                            messageId,
                            senderId,
                            conversationType: conversation.type,
                            conversationName: conversation.name,
                        },
                        messageId,
                        conversationId,
                    }, mentionedRecipients)
                }

                // Send regular notifications to non-mentioned users
                const regularRecipients = recipients.filter(r =>
                    !mentionedRecipients.some(mr => mr.userId === r.userId)
                )

                if (regularRecipients.length > 0) {
                    await this.sendRealtimeNotification({
                        type: notificationType,
                        title,
                        message,
                        metadata: {
                            conversationId,
                            messageId,
                            senderId,
                            conversationType: conversation.type,
                            conversationName: conversation.name,
                        },
                        messageId,
                        conversationId,
                    }, regularRecipients)
                }
            } else {
                // Send regular notifications to all recipients
                await this.sendRealtimeNotification({
                    type: notificationType,
                    title,
                    message,
                    metadata: {
                        conversationId,
                        messageId,
                        senderId,
                        conversationType: conversation.type,
                        conversationName: conversation.name,
                    },
                    messageId,
                    conversationId,
                }, recipients)
            }

        } catch (error) {
            logger.error('Error sending conversation message notifications', error instanceof Error ? error : new Error(String(error)))
            // Don't throw - notification failures shouldn't break message sending
        }
    }

    /**
     * Notify users when they're added to a conversation
     */
    async notifyConversationInvite(
        conversationId: string,
        inviterId: string,
        invitedUserIds: string[]
    ): Promise<void> {
        try {
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: {
                        where: { userId: inviterId },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    }
                }
            })

            if (!conversation) return

            const inviter = conversation.participants[0]?.user
            if (!inviter) return

            const recipients = invitedUserIds.map(userId => ({ userId }))

            await this.sendRealtimeNotification({
                type: 'CONVERSATION_INVITE',
                title: `${inviter.name || inviter.email || 'Someone'} added you to ${conversation.name || 'a conversation'}`,
                message: `You've been added to a ${conversation.type.toLowerCase()} conversation`,
                metadata: {
                    conversationId,
                    inviterId,
                    conversationType: conversation.type,
                    conversationName: conversation.name,
                },
                conversationId,
            }, recipients)

        } catch (error) {
            logger.error('Error sending conversation invite notifications', error instanceof Error ? error : new Error(String(error)))
        }
    }

    /**
     * Broadcast conversation updates to all participants
     */
    async broadcastConversationUpdate(
        conversationId: string,
        updateType: 'new_message' | 'conversation_updated' | 'participant_added' | 'participant_removed',
        metadata?: Record<string, any>
    ): Promise<void> {
        try {
            // Get conversation participants
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
                include: {
                    participants: {
                        select: {
                            userId: true
                        }
                    }
                }
            })

            if (!conversation) {
                logger.warn('Conversation not found for broadcasting update', {
                    metadata: { conversationId }
                })
                return
            }

            // Broadcast to all participants
            for (const participant of conversation.participants) {
                const channel = this.supabase.channel(`conversation_updates:${participant.userId}`)

                await channel.send({
                    type: 'broadcast',
                    event: 'conversation_update',
                    payload: {
                        conversationId,
                        updateType,
                        timestamp: new Date().toISOString(),
                        metadata: metadata || {}
                    }
                })
            }

            logger.info('Conversation update broadcasted', {
                metadata: {
                    conversationId,
                    updateType,
                    participantCount: conversation.participants.length
                }
            })

        } catch (error) {
            logger.error('Error broadcasting conversation update', error instanceof Error ? error : new Error(String(error)))
        }
    }

    private truncateContent(content: string, maxLength: number = 100): string {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength - 3) + '...'
    }

    private extractMentions(content: string): string[] {
        // Extract @mentions from message content
        const mentionRegex = /@(\w+)/g
        const mentions = []
        let match

        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1])
        }

        return mentions
    }
}

export const notificationService = new NotificationService()
