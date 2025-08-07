'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ChatSessionSummary {
    id: string;
    title?: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    lastMessage?: string;
}

export function useChatSessions() {
    const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async (limit: number = 20) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/chat/sessions?limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const sessionsData = data.sessions.map((session: any) => ({
                ...session,
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt)
            }));

            setSessions(sessionsData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
            setError(errorMessage);
            console.error('Failed to fetch chat sessions:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSession = useCallback(async (title?: string) => {
        try {
            const response = await fetch('/api/chat/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const newSession = {
                ...data.session,
                createdAt: new Date(data.session.createdAt),
                updatedAt: new Date(data.session.updatedAt),
                messageCount: 0
            };

            setSessions(prev => [newSession, ...prev]);
            return newSession;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
            toast.error('Failed to create new chat session');
            throw new Error(errorMessage);
        }
    }, []);

    const deleteSession = useCallback(async (sessionId: string) => {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setSessions(prev => prev.filter(session => session.id !== sessionId));
            toast.success('Chat session deleted');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
            toast.error('Failed to delete chat session');
            throw new Error(errorMessage);
        }
    }, []);

    const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            setSessions(prev =>
                prev.map(session =>
                    session.id === sessionId
                        ? { ...session, title, updatedAt: new Date() }
                        : session
                )
            );

            toast.success('Session title updated');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
            toast.error('Failed to update session title');
            throw new Error(errorMessage);
        }
    }, []);

    // Auto-fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return {
        sessions,
        isLoading,
        error,
        fetchSessions,
        createSession,
        deleteSession,
        updateSessionTitle,
        refresh: fetchSessions
    };
}
