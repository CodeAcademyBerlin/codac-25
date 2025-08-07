'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRAGChat } from '@/hooks/use-rag-chat';
import { useChatSessions } from '@/hooks/use-chat-sessions';

import { ChatMessage } from './chat-message';
import { ChatSidebar } from './chat-sidebar';
import { WelcomeScreen } from './welcome-screen';
import { SuggestionChips } from './suggestion-chips';

interface User {
    id: string;
    name?: string | null;
    role: string;
}

interface ChatInterfaceProps {
    user: User;
}

export function ChatInterface({ user }: ChatInterfaceProps) {
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        messages,
        isLoading,
        sessionId,
        suggestions,
        sendMessage,
        stopGeneration,
        clearMessages,
        loadSession
    } = useRAGChat({
        maxSources: 5,
        includeContext: true,
        model: 'gpt-4o-mini',
        onSessionCreated: () => {
            // Refresh sessions list when a new session is created
            refresh();
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const {
        sessions,
        isLoading: isLoadingSessions,
        createSession,
        deleteSession,
        refresh
    } = useChatSessions();

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const message = input.trim();
        setInput('');

        try {
            await sendMessage(message, true); // Enable streaming
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
        inputRef.current?.focus();
    };

    const handleNewChat = async () => {
        try {
            await createSession();
            clearMessages();
            toast.success('New chat started');
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const handleLoadSession = async (sessionId: string) => {
        try {
            await loadSession(sessionId);
            if (isSidebarOpen && window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await deleteSession(sessionId);
            if (sessionId === sessionId) {
                clearMessages();
            }
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <ChatSidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                sessions={sessions}
                isLoading={isLoadingSessions}
                currentSessionId={sessionId}
                onNewChat={handleNewChat}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
            />

            {/* Main Chat Area */}
            <div className="flex flex-1 flex-col">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                    <div className="max-w-4xl mx-auto">
                        {!hasMessages ? (
                            <WelcomeScreen
                                userName={user.name || 'Student'}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        ) : (
                            <div className="space-y-4">
                                {messages.map((message) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        isStreaming={message.isLoading}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Suggestions */}
                {suggestions.length > 0 && !isLoading && (
                    <div className="border-t bg-muted/20 p-4">
                        <div className="max-w-4xl mx-auto">
                            <SuggestionChips
                                suggestions={suggestions}
                                onSuggestionClick={handleSuggestionClick}
                            />
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t bg-background p-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <div className="flex-1 relative">
                                <Input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything about your courses..."
                                    disabled={isLoading}
                                    className="pr-12"
                                    maxLength={1000}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                    {input.length}/1000
                                </div>
                            </div>

                            {isLoading ? (
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={stopGeneration}
                                    className="shrink-0"
                                >
                                    <Square className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            )}
                        </form>

                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>
                                AI can make mistakes. Verify important information with your course materials.
                            </span>
                            {sessionId && (
                                <span>
                                    Session: {sessionId.slice(-8)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
