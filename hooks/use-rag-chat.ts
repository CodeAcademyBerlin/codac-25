'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: Array<{
        id: string;
        contentType: string;
        title: string;
        excerpt: string;
        metadata: {
            courseName?: string;
            projectName?: string;
            lessonName?: string;
            assignmentName?: string;
            contentType: string;
        };
        similarity: number;
    }>;
    tokenCount?: number;
    createdAt: Date;
    isLoading?: boolean;
}

export interface ChatSession {
    id: string;
    title?: string;
    createdAt: Date;
    updatedAt: Date;
    messages: ChatMessage[];
}

export interface UseRAGChatOptions {
    sessionId?: string;
    maxSources?: number;
    includeContext?: boolean;
    model?: 'gpt-4o-mini' | 'gpt-4o';
    onSessionCreated?: (sessionId: string) => void;
    onError?: (error: string) => void;
}

export function useRAGChat(options: UseRAGChatOptions = {}) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(options.sessionId);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string, stream: boolean = false) => {
        if (!content.trim() || isLoading) return;

        // Add user message immediately
        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            createdAt: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setSuggestions([]);

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        try {
            if (stream) {
                await handleStreamingResponse(content);
            } else {
                await handleRegularResponse(content);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Request was cancelled
                return;
            }

            console.error('Chat error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            options.onError?.(errorMessage);
            toast.error('Failed to send message: ' + errorMessage);

            // Add error message
            const errorResponse: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'I apologize, but I encountered an error while processing your message. Please try again.',
                createdAt: new Date()
            };

            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [isLoading, currentSessionId, options]);

    const handleRegularResponse = async (content: string) => {
        const response = await fetch('/api/chat/rag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: content,
                sessionId: currentSessionId,
                maxSources: options.maxSources,
                includeContext: options.includeContext,
                model: options.model,
                stream: false
            }),
            signal: abortControllerRef.current?.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();

        // Update session ID if this was the first message
        if (!currentSessionId && data.sessionId) {
            setCurrentSessionId(data.sessionId);
            options.onSessionCreated?.(data.sessionId);
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.response,
            sources: data.sources,
            tokenCount: data.tokenCount,
            createdAt: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setSuggestions(data.suggestions || []);
    };

    const handleStreamingResponse = async (content: string) => {
        const response = await fetch('/api/chat/rag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: content,
                sessionId: currentSessionId,
                maxSources: options.maxSources,
                includeContext: options.includeContext,
                model: options.model,
                stream: true
            }),
            signal: abortControllerRef.current?.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
            createdAt: new Date(),
            isLoading: true
        };

        // Add the loading message
        setMessages(prev => [...prev, assistantMessage]);

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;

                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.type === 'sources') {
                                assistantMessage.sources = parsed.data;
                            } else if (parsed.type === 'content') {
                                assistantMessage.content += parsed.data;
                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === assistantMessage.id
                                            ? { ...assistantMessage }
                                            : msg
                                    )
                                );
                            } else if (parsed.type === 'done') {
                                assistantMessage.tokenCount = parsed.data.tokenCount;
                                assistantMessage.isLoading = false;

                                // Update session ID if this was the first message
                                if (!currentSessionId && parsed.data.sessionId) {
                                    setCurrentSessionId(parsed.data.sessionId);
                                    options.onSessionCreated?.(parsed.data.sessionId);
                                }
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.data.message);
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse SSE data:', parseError);
                        }
                    }
                }
            }
        } finally {
            // Mark message as complete
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === assistantMessage.id
                        ? { ...msg, isLoading: false }
                        : msg
                )
            );
        }
    };

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setSuggestions([]);
    }, []);

    const loadSession = useCallback(async (sessionId: string) => {
        try {
            const response = await fetch(`/api/chat/sessions/${sessionId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const session = data.session;

            setCurrentSessionId(sessionId);
            setMessages(session.messages.map((msg: any) => ({
                ...msg,
                createdAt: new Date(msg.createdAt)
            })));

        } catch (error) {
            console.error('Failed to load session:', error);
            toast.error('Failed to load chat session');
        }
    }, []);

    const updateSessionTitle = useCallback(async (title: string) => {
        if (!currentSessionId) return;

        try {
            const response = await fetch(`/api/chat/sessions/${currentSessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            toast.success('Session title updated');
        } catch (error) {
            console.error('Failed to update session title:', error);
            toast.error('Failed to update session title');
        }
    }, [currentSessionId]);

    return {
        messages,
        isLoading,
        sessionId: currentSessionId,
        suggestions,
        sendMessage,
        stopGeneration,
        clearMessages,
        loadSession,
        updateSessionTitle
    };
}
