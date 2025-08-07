'use client';

import { useState } from 'react';
import {
    Plus,
    MessageCircle,
    Trash2,
    Edit3,
    MoreHorizontal,
    PanelLeft,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { ChatSessionSummary } from '@/hooks/use-chat-sessions';

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    sessions: ChatSessionSummary[];
    isLoading: boolean;
    currentSessionId?: string;
    onNewChat: () => void;
    onLoadSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
}

export function ChatSidebar({
    isOpen,
    onToggle,
    sessions,
    isLoading,
    currentSessionId,
    onNewChat,
    onLoadSession,
    onDeleteSession
}: ChatSidebarProps) {
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const handleEditStart = (session: ChatSessionSummary) => {
        setEditingSessionId(session.id);
        setEditingTitle(session.title || 'New Chat');
    };

    const handleEditCancel = () => {
        setEditingSessionId(null);
        setEditingTitle('');
    };

    const handleEditSave = async () => {
        if (!editingTitle.trim()) {
            toast.error('Session title cannot be empty');
            return;
        }

        try {
            // TODO: Implement session title update
            // await updateSessionTitle(sessionId, editingTitle.trim());
            setEditingSessionId(null);
            setEditingTitle('');
            toast.success('Session title updated');
        } catch (error) {
            toast.error('Failed to update session title');
        }
    };

    const handleDelete = async (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this chat session?')) {
            await onDeleteSession(sessionId);
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Chat Sessions</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNewChat}
                    className="h-8 w-8 p-0"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 5 }).map((_, index) => (
                            <Card key={index} className="p-3">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            </Card>
                        ))
                    ) : sessions.length === 0 ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-4">
                                No chat sessions yet
                            </p>
                            <Button onClick={onNewChat} size="sm">
                                Start your first chat
                            </Button>
                        </div>
                    ) : (
                        // Sessions
                        sessions.map((session) => (
                            <Card
                                key={session.id}
                                className={cn(
                                    'cursor-pointer transition-colors hover:bg-muted/50',
                                    currentSessionId === session.id && 'bg-muted border-primary/50'
                                )}
                                onClick={() => onLoadSession(session.id)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            {editingSessionId === session.id ? (
                                                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                                                    <Input
                                                        value={editingTitle}
                                                        onChange={(e) => setEditingTitle(e.target.value)}
                                                        className="h-7 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleEditSave();
                                                            } else if (e.key === 'Escape') {
                                                                handleEditCancel();
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => handleEditSave()}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={handleEditCancel}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-sm font-medium truncate mb-1">
                                                        {session.title || 'New Chat'}
                                                    </h3>
                                                    {session.lastMessage && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                                            {session.lastMessage}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(session.updatedAt)}
                                                        <span>•</span>
                                                        <span>{session.messageCount} messages</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {editingSessionId !== session.id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditStart(session)}>
                                                        <Edit3 className="h-3 w-3 mr-2" />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(session.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );

    // Mobile: Use Sheet, Desktop: Use fixed sidebar
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="fixed top-4 left-4 z-50 md:hidden"
                >
                    <PanelLeft className="h-4 w-4" />
                </Button>

                <Sheet open={isOpen} onOpenChange={onToggle}>
                    <SheetContent side="left" className="w-80 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return (
        <div className={cn(
            'border-r bg-background transition-all duration-200 ease-in-out',
            isOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}>
            <SidebarContent />
        </div>
    );
}
