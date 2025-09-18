import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

interface ExportedChatData {
    conversations: any[];
    conversationParticipants: any[];
    chatMessages: any[];
    exportedAt: string;
    totalConversations: number;
    totalParticipants: number;
    totalMessages: number;
}

export async function seedChatData() {
    try {
        logger.info('🗨️ Starting chat data seeding...');

        // Check if chat data file exists
        const chatDataPath = path.join(process.cwd(), 'prisma/seed/data/chat-data.json');

        if (!fs.existsSync(chatDataPath)) {
            logger.warn('⚠️ Chat data file not found. Run the export script first or seed will be skipped.');
            logger.info(`Expected file: ${chatDataPath}`);
            return;
        }

        // Load chat data
        const chatData: ExportedChatData = JSON.parse(
            fs.readFileSync(chatDataPath, 'utf-8')
        );

        logger.info(`📊 Loading chat data exported on ${chatData.exportedAt}`);
        logger.info(`   • Conversations: ${chatData.totalConversations}`);
        logger.info(`   • Participants: ${chatData.totalParticipants}`);
        logger.info(`   • Messages: ${chatData.totalMessages}`);

        // Check if we have existing users to map conversations to
        const existingUsers = await prisma.user.findMany({
            select: { id: true, email: true }
        });

        if (existingUsers.length === 0) {
            logger.warn('⚠️ No users found in database. Chat data requires existing users. Please seed users first.');
            return;
        }

        const userIdMap = new Map(existingUsers.map(u => [u.id, u]));

        // Seed conversations
        logger.info('🗨️ Seeding conversations...');
        const conversationMap = new Map();

        for (const conv of chatData.conversations) {
            try {
                const newConv = await prisma.conversation.upsert({
                    where: { id: conv.id },
                    create: {
                        id: conv.id,
                        type: conv.type,
                        name: conv.name,
                        description: conv.description,
                        createdAt: new Date(conv.createdAt),
                        updatedAt: new Date(conv.updatedAt),
                    },
                    update: {
                        type: conv.type,
                        name: conv.name,
                        description: conv.description,
                        updatedAt: new Date(conv.updatedAt),
                    }
                });
                conversationMap.set(conv.id, newConv.id);
                logger.info(`   ✓ Conversation: ${conv.name || conv.type} (${conv.id})`);
            } catch (error) {
                logger.error(`   ✗ Failed to seed conversation ${conv.id}:`, error instanceof Error ? error : new Error(String(error)));
            }
        }

        // Seed conversation participants
        logger.info('👥 Seeding conversation participants...');
        const participantMap = new Map();

        for (const participant of chatData.conversationParticipants) {
            try {
                // Check if user exists
                if (!userIdMap.has(participant.userId)) {
                    logger.warn(`   ⚠️ Skipping participant ${participant.userId} - user not found`);
                    continue;
                }

                // Check if conversation exists
                if (!conversationMap.has(participant.conversationId)) {
                    logger.warn(`   ⚠️ Skipping participant for conversation ${participant.conversationId} - conversation not found`);
                    continue;
                }

                const newParticipant = await prisma.conversationParticipant.upsert({
                    where: {
                        id: `${participant.userId}_${participant.conversationId}` // Use a composite ID approach
                    },
                    create: {
                        userId: participant.userId,
                        conversationId: participant.conversationId,
                        role: participant.role,
                        joinedAt: new Date(participant.joinedAt),
                    },
                    update: {
                        role: participant.role,
                    }
                });

                participantMap.set(`${participant.userId}_${participant.conversationId}`, newParticipant);
                logger.info(`   ✓ Participant: ${participant.userId} in ${participant.conversationId}`);
            } catch (error) {
                logger.error(`   ✗ Failed to seed participant ${participant.userId}:`, error instanceof Error ? error : new Error(String(error)));
            }
        }

        // Seed chat messages
        logger.info('💬 Seeding chat messages...');
        let messageCount = 0;

        for (const message of chatData.chatMessages) {
            try {
                // Check if user exists
                if (message.userId && !userIdMap.has(message.userId)) {
                    logger.warn(`   ⚠️ Skipping message ${message.id} - user ${message.userId} not found`);
                    continue;
                }

                // Check if conversation exists (for new conversation-based messages)
                if (message.conversationId && !conversationMap.has(message.conversationId)) {
                    logger.warn(`   ⚠️ Skipping message ${message.id} - conversation ${message.conversationId} not found`);
                    continue;
                }

                await prisma.chatMessage.upsert({
                    where: { id: message.id },
                    create: {
                        id: message.id,
                        content: message.content,
                        userName: message.userName,
                        userId: message.userId,
                        conversationId: message.conversationId,
                        roomName: message.roomName,
                        createdAt: new Date(message.createdAt),
                    },
                    update: {
                        content: message.content,
                        userName: message.userName,
                    }
                });

                messageCount++;
                if (messageCount % 50 === 0) {
                    logger.info(`   ✓ Seeded ${messageCount} messages...`);
                }
            } catch (error) {
                logger.error(`   ✗ Failed to seed message ${message.id}:`, error instanceof Error ? error : new Error(String(error)));
            }
        }

        logger.info('✅ Chat data seeding completed!');
        logger.info(`📊 Final counts:`);
        logger.info(`   • Conversations: ${conversationMap.size}`);
        logger.info(`   • Participants: ${participantMap.size}`);
        logger.info(`   • Messages: ${messageCount}`);

    } catch (error) {
        logger.error('❌ Error seeding chat data:', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

export async function cleanChatData() {
    try {
        logger.info('🧹 Cleaning chat data...');

        // Delete in reverse order of dependencies
        const messageCount = await prisma.chatMessage.count();
        const participantCount = await prisma.conversationParticipant.count();
        const conversationCount = await prisma.conversation.count();

        await prisma.chatMessage.deleteMany({});
        logger.info(`   ✓ Deleted ${messageCount} chat messages`);

        await prisma.conversationParticipant.deleteMany({});
        logger.info(`   ✓ Deleted ${participantCount} conversation participants`);

        await prisma.conversation.deleteMany({});
        logger.info(`   ✓ Deleted ${conversationCount} conversations`);

        logger.info('✅ Chat data cleaned successfully!');
    } catch (error) {
        logger.error('❌ Error cleaning chat data:', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}
