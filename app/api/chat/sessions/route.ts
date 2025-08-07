import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';
import { ChatService } from '@/lib/rag/chat-service';

// Request validation schemas
const CreateSessionSchema = z.object({
    title: z.string().optional()
});

// const UpdateSessionSchema = z.object({
//     title: z.string().min(1, 'Title is required')
// });

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const chatService = new ChatService();
        const sessions = await chatService.getUserSessions(user.id, limit);

        return NextResponse.json({
            sessions: sessions.map(session => ({
                id: session.id,
                title: session.title,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                messageCount: session.messages.length,
                lastMessage: session.messages[0]?.content?.substring(0, 100)
            }))
        });

    } catch (error) {
        logger.error(
            'Failed to get chat sessions:',
            error instanceof Error ? error : new Error(String(error))
        );
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }

}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validation = CreateSessionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { title } = validation.data;

        const chatService = new ChatService();
        const session = await chatService.createSession(user.id, title);

        return NextResponse.json({
            session: {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt
            }
        }, { status: 201 });

    } catch (error) {
        logger.error(
            'Failed to create chat session:',
            error instanceof Error ? error : new Error(String(error))
        );
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
