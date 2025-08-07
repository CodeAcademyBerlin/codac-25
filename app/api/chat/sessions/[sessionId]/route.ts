import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';
import { ChatService } from '@/lib/rag/chat-service';

const UpdateSessionSchema = z.object({
    title: z.string().min(1, 'Title is required')
});

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const chatService = new ChatService();
        const session = await chatService.getSession(sessionId, user.id);

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            session: {
                id: session.id,
                title: session.title,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                messages: session.messages.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    sources: msg.sources,
                    tokenCount: msg.tokenCount,
                    createdAt: msg.createdAt
                }))
            }
        });

    } catch (error) {
        logger.error('Failed to get chat session:', error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validation = UpdateSessionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.errors },
                { status: 400 }
            );
        }

        const { title } = validation.data;

        const chatService = new ChatService();

        // Verify session exists and user owns it
        const existingSession = await chatService.getSession(sessionId, user.id);
        if (!existingSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        await chatService.updateSessionTitle(sessionId, user.id, title);

        return NextResponse.json({
            success: true,
            message: 'Session updated successfully'
        });

    } catch (error) {
        logger.error('Failed to update chat session:', error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const chatService = new ChatService();

        // Verify session exists and user owns it
        const existingSession = await chatService.getSession(sessionId, user.id);
        if (!existingSession) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        await chatService.deleteSession(sessionId, user.id);

        return NextResponse.json({
            success: true,
            message: 'Session deleted successfully'
        });

    } catch (error) {
        logger.error('Failed to delete chat session:', error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
