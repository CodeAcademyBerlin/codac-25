'use server';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';
import { RAGEngine } from '@/lib/rag/rag-engine';
import { ChatService } from '@/lib/rag/chat-service';
import { ServerActionResult } from '@/lib/server-action-utils';

export interface TestRAGResult {
    success: boolean;
    response?: string;
    sources?: Array<{
        contentType: string;
        similarity: number;
        courseName?: string;
        excerpt: string;
    }>;
    tokenCount?: number;
    error?: string;
}

export type TestRAGActionResult = ServerActionResult<TestRAGResult>;

/**
 * Test RAG functionality with a sample query
 * Admin/Mentor only action for testing purposes
 */
export async function testRAG(query: string = "What courses are available?"): Promise<TestRAGActionResult> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check permissions - only admins and mentors can test RAG
        if (!['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        logger.info(`RAG test initiated by user ${user.id} with query: "${query}"`);

        // Check if OpenAI API key is available
        if (!process.env.OPENAI_API_KEY) {
            return {
                success: false,
                error: 'OpenAI API key not configured. Set OPENAI_API_KEY environment variable.'
            };
        }

        // Create a test session
        const chatService = new ChatService();
        const session = await chatService.createSession(user.id, 'RAG Test Session');

        // Initialize RAG engine and process query
        const ragEngine = new RAGEngine();
        const result = await ragEngine.query(query, session.id, user.id, {
            maxSources: 3,
            includeConversationContext: false
        });

        logger.info(`RAG test completed. Sources: ${result.sources.length}, Tokens: ${result.tokenCount}`);

        return {
            success: true,
            data: {
                success: true,
                response: result.response,
                sources: result.sources.map(source => ({
                    contentType: source.contentType,
                    similarity: Math.round(source.similarity * 100) / 100,
                    courseName: source.metadata.courseName,
                    excerpt: source.chunkText.substring(0, 200) + '...'
                })),
                tokenCount: result.tokenCount
            }
        };

    } catch (error) {
        logger.error('RAG test failed:', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: error instanceof Error ? error.message : 'RAG test failed'
        };
    }
}
