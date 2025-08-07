'use client';

import { useState } from 'react';
import { Bot, User, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { cn } from '@/lib/utils';

import { ChatMessage as ChatMessageType } from '@/hooks/use-rag-chat';
import { TypingAnimation } from './typing-animation';

interface ChatMessageProps {
    message: ChatMessageType;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
    const [isSourcesOpen, setIsSourcesOpen] = useState(false);
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            toast.success('Message copied to clipboard');
        } catch (error) {
            toast.error('Failed to copy message');
        }
    };

    const formatContentType = (type: string) => {
        const typeMap: Record<string, string> = {
            'course': 'Course',
            'project': 'Project',
            'lesson': 'Lesson',
            'assignment': 'Assignment',
            'resource': 'Resource'
        };
        return typeMap[type] || type;
    };

    return (
        <div className={cn(
            'flex w-full gap-3',
            isUser ? 'justify-end' : 'justify-start'
        )}>
            {/* Avatar */}
            {!isUser && (
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                    </div>
                </div>
            )}

            {/* Message Content */}
            <div className={cn(
                'flex max-w-[80%] flex-col gap-2',
                isUser && 'items-end'
            )}>
                {/* Message Bubble */}
                <Card className={cn(
                    'relative',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50'
                )}>
                    <CardContent className="p-3">
                        {isStreaming && isAssistant ? (
                            <div className="flex items-center gap-2">
                                <TypingAnimation />
                                <span className="text-sm text-muted-foreground">
                                    {message.content || 'Thinking...'}
                                </span>
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Sources */}
                {isAssistant && message.sources && message.sources.length > 0 && (
                    <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <div className="flex items-center gap-1">
                                    {isSourcesOpen ? (
                                        <ChevronUp className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                    {message.sources.length} source{message.sources.length !== 1 ? 's' : ''}
                                </div>
                            </Button>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-2">
                            {message.sources.map((source) => (
                                <Card key={source.id} className="border-l-2 border-l-primary/20">
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {formatContentType(source.contentType)}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {(source.similarity * 100).toFixed(0)}% match
                                                    </Badge>
                                                </div>

                                                <h4 className="text-sm font-medium mb-1 truncate">
                                                    {source.title}
                                                </h4>

                                                {source.metadata.courseName && (
                                                    <div className="text-xs text-muted-foreground mb-2">
                                                        {[
                                                            source.metadata.courseName,
                                                            source.metadata.projectName,
                                                            source.metadata.lessonName
                                                        ].filter(Boolean).join(' → ')}
                                                    </div>
                                                )}

                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {source.excerpt}
                                                </p>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 shrink-0"
                                                onClick={() => {
                                                    // TODO: Navigate to source content
                                                    toast.info('Source navigation coming soon');
                                                }}
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Message Actions */}
                {!isUser && !isStreaming && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={handleCopy}
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                        </Button>

                        {message.tokenCount && (
                            <span className="text-xs text-muted-foreground">
                                • {message.tokenCount} tokens
                            </span>
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <div className={cn(
                    'text-xs text-muted-foreground',
                    isUser ? 'text-right' : 'text-left'
                )}>
                    {message.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                    </div>
                </div>
            )}
        </div>
    );
}
