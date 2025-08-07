import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';
import { OptimizedRAGEngine } from '@/lib/rag/optimized-rag-engine';
import { ChatService } from '@/lib/rag/chat-service';
import { rateLimiters, getRateLimitHeaders } from '@/lib/rag/rate-limiter';

// Request validation schema
const RAGQuerySchema = z.object({
    query: z.string().min(1, 'Query is required').max(1000, 'Query too long'),
    sessionId: z.string().optional(),
    maxSources: z.number().min(1).max(10).optional(),
    includeContext: z.boolean().optional(),
    model: z.enum(['gpt-4o-mini', 'gpt-4o']).optional(),
    stream: z.boolean().optional()
});

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check rate limits
        const rateLimitResult = await rateLimiters.ragQuery.checkLimit(user.id);
        if (!rateLimitResult.allowed) {
            const headers = await getRateLimitHeaders(rateLimiters.ragQuery, user.id);
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
                },
                {
                    status: 429,
                    headers
                }
            );
        }

        // Parse and validate request
        const body = await req.json();
        const validation = RAGQuerySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { query, sessionId, maxSources, includeContext, model, stream } = validation.data;

        // Get or create chat session
        const chatService = new ChatService();
        let activeSessionId = sessionId;

        if (!activeSessionId) {
            const session = await chatService.createSession(user.id, 'New Chat');
            activeSessionId = session.id;
        } else {
            // Verify user owns the session
            const existingSession = await chatService.getSession(activeSessionId, user.id);
            if (!existingSession) {
                return NextResponse.json(
                    { error: 'Session not found or access denied' },
                    { status: 404 }
                );
            }
        }

        const ragEngine = new OptimizedRAGEngine();

        // Handle streaming response
        if (stream) {
            const encoder = new TextEncoder();

            const readable = new ReadableStream({
                async start(controller) {
                    try {
                        const streamGenerator = ragEngine.streamQuery(query, activeSessionId, user.id, {
                            maxSources,
                            includeConversationContext: includeContext,
                            model
                        });

                        for await (const chunk of streamGenerator) {
                            const data = `data: ${JSON.stringify(chunk)}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }

                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                        controller.close();
                    } catch (error) {
                        logger.error('RAG streaming error:', error instanceof Error ? error : new Error(String(error)));
                        const errorData = `data: ${JSON.stringify({
                            type: 'error',
                            data: { message: 'An error occurred while processing your request' }
                        })}\n\n`;
                        controller.enqueue(encoder.encode(errorData));
                        controller.close();
                    }
                }
            });

            return new Response(readable, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        // Handle regular response
        const result = await ragEngine.query(query, activeSessionId, user.id, {
            maxSources,
            includeConversationContext: includeContext,
            model
        });

        // Generate follow-up suggestions
        const suggestions = await ragEngine.generateFollowUpSuggestions(result.sources, query);

        return NextResponse.json({
            sessionId: activeSessionId,
            response: result.response,
            sources: result.sources.map(source => ({
                id: source.id,
                contentType: source.contentType,
                title: source.metadata.title || source.metadata.courseName || 'Untitled',
                excerpt: source.chunkText.substring(0, 200) + '...',
                metadata: {
                    courseName: source.metadata.courseName,
                    projectName: source.metadata.projectName,
                    lessonName: source.metadata.lessonName,
                    assignmentName: source.metadata.assignmentName,
                    contentType: source.contentType
                },
                similarity: Math.round(source.similarity * 100) / 100
            })),
            suggestions,
            tokenCount: result.tokenCount
        });

    } catch (error) {
        logger.error('RAG API error:', error instanceof Error ? error : new Error(String(error)));

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Handle preflight requests
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
