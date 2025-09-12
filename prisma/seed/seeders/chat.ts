import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

interface ChatMessage {
    senderEmail: string;
    content: string;
    timestamp: string;
}

interface ChatConversationData {
    cohortSlug: string;
    name: string;
    description: string;
    messages: ChatMessage[];
}

export async function seedChatConversations() {
    try {
        logger.info('💬 Starting chat conversations seed...');

        // Load chat data from JSON file
        const chatData: ChatConversationData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/chat-conversations.json'), 'utf-8')
        );

        // Get all cohorts and their users
        const cohorts = await prisma.cohort.findMany({
            include: {
                students: true
            }
        });

        let totalConversations = 0;
        let totalMessages = 0;

        for (const conversationData of chatData) {
            const cohort = cohorts.find((c: { slug: string; }) => c.slug === conversationData.cohortSlug);

            if (!cohort) {
                logger.warn(`⚠️ Cohort not found for slug: ${conversationData.cohortSlug}`);
                continue;
            }

            if (cohort.students.length === 0) {
                logger.warn(`⚠️ No students found in cohort: ${cohort.name}`);
                continue;
            }

            logger.info(`💬 Creating group conversation for cohort: ${cohort.name}`);

            // Create the group conversation
            const conversation = await prisma.conversation.create({
                data: {
                    type: 'GROUP',
                    name: conversationData.name,
                    description: conversationData.description,
                    createdAt: new Date('2024-09-01T00:00:00Z'), // Set a consistent creation date
                }
            });

            // Add all cohort members as participants
            await Promise.all(
                cohort.students.map(async (user: { id: any; role: string; }) => {
                    return prisma.conversationParticipant.create({
                        data: {
                            conversationId: conversation.id,
                            userId: user.id,
                            role: user.role === 'MENTOR' || user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
                            joinedAt: new Date('2024-09-01T00:00:00Z'), // Set consistent join date
                        }
                    });
                })
            );

            logger.info(`👥 Added ${cohort.students.length} participants to conversation: ${conversation.name}`);

            // Create messages for the conversation
            for (const messageData of conversationData.messages) {
                const sender = cohort.students.find((user: { email: string; }) => user.email === messageData.senderEmail);

                if (!sender) {
                    // If sender not found in this cohort, try to find them in any cohort
                    const globalSender = await prisma.user.findUnique({
                        where: { email: messageData.senderEmail }
                    });

                    if (globalSender) {
                        // Add the sender as a participant if they're not already
                        const existingParticipant = await prisma.conversationParticipant.findUnique({
                            where: {
                                conversationId_userId: {
                                    conversationId: conversation.id,
                                    userId: globalSender.id
                                }
                            }
                        });

                        if (!existingParticipant) {
                            await prisma.conversationParticipant.create({
                                data: {
                                    conversationId: conversation.id,
                                    userId: globalSender.id,
                                    role: globalSender.role === 'MENTOR' || globalSender.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
                                    joinedAt: new Date(messageData.timestamp),
                                }
                            });
                        }

                        // Create the message
                        await prisma.chatMessage.create({
                            data: {
                                content: messageData.content,
                                conversationId: conversation.id,
                                userId: globalSender.id,
                                createdAt: new Date(messageData.timestamp),
                                updatedAt: new Date(messageData.timestamp),
                                // Legacy fields for backward compatibility
                                userName: globalSender.name,
                                roomName: conversation.name,
                            }
                        });

                        totalMessages++;
                    } else {
                        logger.warn(`⚠️ Sender not found for email: ${messageData.senderEmail}`);
                    }
                } else {
                    // Create the message
                    await prisma.chatMessage.create({
                        data: {
                            content: messageData.content,
                            conversationId: conversation.id,
                            userId: sender.id,
                            createdAt: new Date(messageData.timestamp),
                            updatedAt: new Date(messageData.timestamp),
                            // Legacy fields for backward compatibility
                            userName: sender.name,
                            roomName: conversation.name,
                        }
                    });

                    totalMessages++;
                }
            }

            logger.info(`📝 Created ${conversationData.messages.length} messages for conversation: ${conversation.name}`);
            totalConversations++;
        }

        logger.info('✅ Chat conversations seed completed successfully!');
        logger.info(`💬 Created ${totalConversations} group conversations`);
        logger.info(`📝 Created ${totalMessages} chat messages`);
        logger.info(`👥 Added participants for ${cohorts.length} cohorts`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Chat conversations seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanChatConversations() {
    try {
        logger.info('🧹 Cleaning chat conversations data...');

        // Delete all chat messages
        await prisma.chatMessage.deleteMany();

        // Delete all conversation participants
        await prisma.conversationParticipant.deleteMany();

        // Delete all conversations
        await prisma.conversation.deleteMany();

        logger.info('✅ Chat conversations data cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean chat conversations data:', errorMessage);
        throw errorMessage;
    }
}
