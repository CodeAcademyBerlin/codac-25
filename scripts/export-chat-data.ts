#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { logger } from '../lib/logger';

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

export async function exportChatData(): Promise<void> {
    try {
        logger.info('🗨️ Starting chat data export...');

        // Export conversations
        logger.info('Exporting conversations...');
        const conversations = await prisma.conversation.findMany({
            orderBy: { createdAt: 'asc' }
        });

        // Export conversation participants
        logger.info('Exporting conversation participants...');
        const conversationParticipants = await prisma.conversationParticipant.findMany({
            orderBy: [
                { conversationId: 'asc' },
                { joinedAt: 'asc' }
            ]
        });

        // Export chat messages (limit to recent ones to avoid huge files)
        logger.info('Exporting chat messages...');
        const chatMessages = await prisma.chatMessage.findMany({
            orderBy: { createdAt: 'asc' },
            // Limit to last 1000 messages to keep file size manageable
            take: 1000
        });

        // Create export data structure
        const exportData: ExportedChatData = {
            conversations,
            conversationParticipants,
            chatMessages,
            exportedAt: new Date().toISOString(),
            totalConversations: conversations.length,
            totalParticipants: conversationParticipants.length,
            totalMessages: chatMessages.length
        };

        // Ensure data directory exists
        const dataDir = path.join(process.cwd(), 'prisma/seed/data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write to JSON file
        const outputPath = path.join(dataDir, 'chat-data.json');
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

        logger.info(`✅ Chat data exported successfully!`);
        logger.info(`📊 Export summary:`);
        logger.info(`   • Conversations: ${exportData.totalConversations}`);
        logger.info(`   • Participants: ${exportData.totalParticipants}`);
        logger.info(`   • Messages: ${exportData.totalMessages}`);
        logger.info(`   • File: ${outputPath}`);

        // Also create a summary file for easy reference
        const summaryData = {
            exportedAt: exportData.exportedAt,
            totalConversations: exportData.totalConversations,
            totalParticipants: exportData.totalParticipants,
            totalMessages: exportData.totalMessages,
            conversationTypes: conversations.reduce((acc: Record<string, number>, conv) => {
                acc[conv.type] = (acc[conv.type] || 0) + 1;
                return acc;
            }, {}),
            messagesByConversation: chatMessages.reduce((acc: Record<string, number>, msg) => {
                acc[msg.conversationId] = (acc[msg.conversationId] || 0) + 1;
                return acc;
            }, {})
        };

        const summaryPath = path.join(dataDir, 'chat-data-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2));

        logger.info(`📋 Summary file created: ${summaryPath}`);

    } catch (error) {
        logger.error('❌ Error exporting chat data:', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

// Run export if called directly
if (require.main === module) {
    exportChatData()
        .then(() => {
            logger.info('🎉 Chat data export completed!');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('💥 Chat data export failed:', error);
            process.exit(1);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}
