import { prisma } from '@/lib/db/prisma';
import { ChatSession, ChatMessage } from '@/types/rag';

export class ChatService {
    /**
     * Create a new chat session
     */
    async createSession(userId: string, title?: string): Promise<ChatSession> {
        const session = await prisma.chatSession.create({
            data: {
                userId,
                title: title || 'New Chat'
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        return {
            id: session.id,
            userId: session.userId,
            title: session.title || undefined,
            messages: session.messages.map(msg => ({
                id: msg.id,
                sessionId: msg.sessionId,
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
                sources: msg.sources ? JSON.parse(JSON.stringify(msg.sources)) : undefined,
                tokenCount: msg.tokenCount || undefined,
                createdAt: msg.createdAt
            })),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        };
    }

    /**
     * Get user's chat sessions
     */
    async getUserSessions(userId: string, limit: number = 20): Promise<ChatSession[]> {
        const sessions = await prisma.chatSession.findMany({
            where: { userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 1 // Just get the first message for preview
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: limit
        });

        return sessions.map(session => ({
            id: session.id,
            userId: session.userId,
            title: session.title || undefined,
            messages: session.messages.map(msg => ({
                id: msg.id,
                sessionId: msg.sessionId,
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
                sources: msg.sources ? JSON.parse(JSON.stringify(msg.sources)) : undefined,
                tokenCount: msg.tokenCount || undefined,
                createdAt: msg.createdAt
            })),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        }));
    }

    /**
     * Get a specific chat session with all messages
     */
    async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
        const session = await prisma.chatSession.findFirst({
            where: {
                id: sessionId,
                userId // Ensure user can only access their own sessions
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!session) return null;

        return {
            id: session.id,
            userId: session.userId,
            title: session.title || undefined,
            messages: session.messages.map(msg => ({
                id: msg.id,
                sessionId: msg.sessionId,
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content,
                sources: msg.sources ? JSON.parse(JSON.stringify(msg.sources)) : undefined,
                tokenCount: msg.tokenCount || undefined,
                createdAt: msg.createdAt
            })),
            createdAt: session.createdAt,
            updatedAt: session.updatedAt
        };
    }

    /**
     * Add a message to a chat session
     */
    async addMessage(
        sessionId: string,
        role: 'user' | 'assistant' | 'system',
        content: string,
        sources?: any[],
        tokenCount?: number
    ): Promise<ChatMessage> {
        const message = await prisma.chatMessage.create({
            data: {
                sessionId,
                role,
                content,
                sources: sources ? JSON.parse(JSON.stringify(sources)) : null,
                tokenCount
            }
        });

        // Update session's updatedAt timestamp
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() }
        });

        return {
            id: message.id,
            sessionId: message.sessionId,
            role: message.role as 'user' | 'assistant' | 'system',
            content: message.content,
            sources: message.sources ? JSON.parse(JSON.stringify(message.sources)) : undefined,
            tokenCount: message.tokenCount || undefined,
            createdAt: message.createdAt
        };
    }

    /**
     * Update session title
     */
    async updateSessionTitle(sessionId: string, userId: string, title: string): Promise<void> {
        await prisma.chatSession.updateMany({
            where: {
                id: sessionId,
                userId
            },
            data: { title }
        });
    }

    /**
     * Delete a chat session
     */
    async deleteSession(sessionId: string, userId: string): Promise<void> {
        await prisma.chatSession.deleteMany({
            where: {
                id: sessionId,
                userId
            }
        });
    }

    /**
     * Get conversation context for RAG (recent messages)
     */
    async getConversationContext(sessionId: string, limit: number = 10): Promise<ChatMessage[]> {
        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return messages.reverse().map(msg => ({
            id: msg.id,
            sessionId: msg.sessionId,
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content,
            sources: msg.sources ? JSON.parse(JSON.stringify(msg.sources)) : undefined,
            tokenCount: msg.tokenCount || undefined,
            createdAt: msg.createdAt
        }));
    }
}
