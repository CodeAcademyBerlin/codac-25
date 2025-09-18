"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";

import { getConversationAction } from "@/actions/chat/get-conversation";
import { markConversationReadAction } from "@/actions/chat/mark-conversation-read";
import { Button } from "@/components/ui/button";
import { useCrossSystemReadSync } from "@/hooks/use-cross-system-read-sync";
import { useRealtimeConversation } from "@/hooks/use-realtime-conversation";

import { ConversationHeader } from "./conversation-header";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  currentUserName?: string;
}

interface ConversationData {
  id: string;
  type: "DIRECT" | "GROUP" | "CHANNEL";
  name: string | null;
  description: string | null;
  participants: Array<{
    id: string;
    role: string;
    userId: string;
    conversationId: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };
  }>;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    userName: string | null;
    userId: string;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };
  }>;
}

export function ConversationView({
  conversationId,
  currentUserId,
  currentUserName,
}: ConversationViewProps) {
  const [conversation, setConversation] = useState<ConversationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [lastReadMessageId, setLastReadMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const disconnectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wasDisconnectedForLongRef = useRef(false);

  // Cross-system read sync for notifications
  const { syncConversationRead } = useCrossSystemReadSync();

  // Use realtime hook for realtime updates only
  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    isSending,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
  } = useRealtimeConversation({
    conversationId,
    currentUserId,
    currentUserName,
  });


  // Window focus detection for auto-read functionality
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);
    const handleVisibilityChange = () => {
      setIsWindowFocused(!document.hidden);
    };

    // Set initial focus state
    setIsWindowFocused(!document.hidden && document.hasFocus());

    // Listen for focus/blur events
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Auto-read functionality: mark conversation as read when focused and messages are present
  const markConversationAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId || !isWindowFocused) {
      return;
    }

    try {
      await markConversationReadAction({ conversationId });
      // Also sync notifications
      syncConversationRead(conversationId);
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  }, [conversationId, currentUserId, isWindowFocused, syncConversationRead]);

  // Combine conversation messages with realtime messages
  const allMessages = useMemo(() => {
    // If no conversation loaded yet, return realtime messages only
    if (!conversation?.messages) {
      const safeRealtimeMessages = Array.isArray(realtimeMessages) ? realtimeMessages : [];
      return safeRealtimeMessages;
    }

    // Ensure realtimeMessages is an array
    const safeRealtimeMessages = Array.isArray(realtimeMessages) ? realtimeMessages : [];

    // Simple deduplication: create a Map with message ID as key
    const messageMap = new Map();

    // Add conversation messages first (these are authoritative)
    conversation.messages.forEach(msg => {
      if (msg.id) {
        messageMap.set(msg.id, {
          ...msg,
          createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
        });
      }
    });

    // Add realtime messages, but only if they don't already exist
    safeRealtimeMessages.forEach(msg => {
      if (msg.id && !messageMap.has(msg.id)) {
        messageMap.set(msg.id, {
          id: msg.id,
          content: msg.content,
          createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
          userName: msg.userName,
          userId: msg.userId,
          user: msg.user,
        });
      }
    });

    // Convert to array and sort by creation date
    const combined = Array.from(messageMap.values()).sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return combined;
  }, [conversation?.messages, realtimeMessages]);


  // Auto-read when window regains focus
  useEffect(() => {
    if (isWindowFocused && allMessages.length > 0) {
      // Small delay to ensure messages are loaded
      const timeoutId = setTimeout(() => {
        markConversationAsRead();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
    return undefined; // Explicit return for when condition is false
  }, [isWindowFocused, allMessages.length, markConversationAsRead]);

  // Auto-read when new messages arrive (if window is focused)
  useEffect(() => {
    if (allMessages.length > 0 && isWindowFocused) {
      const latestMessage = allMessages[allMessages.length - 1];

      // Only mark as read if this is a new message we haven't seen
      if (latestMessage.id !== lastReadMessageId) {
        setLastReadMessageId(latestMessage.id);
        markConversationAsRead();
      }
    }
  }, [allMessages, isWindowFocused, lastReadMessageId, markConversationAsRead]);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  // Handle connection state changes with better UX
  useEffect(() => {
    if (!isConnected) {
      // Clear any existing timeout
      if (disconnectionTimeoutRef.current) {
        clearTimeout(disconnectionTimeoutRef.current);
      }

      // Set flag after being disconnected for 3+ seconds
      disconnectionTimeoutRef.current = setTimeout(() => {
        wasDisconnectedForLongRef.current = true;
      }, 3000);
    } else if (isConnected && conversation) {
      // Clear timeout if we reconnect quickly
      if (disconnectionTimeoutRef.current) {
        clearTimeout(disconnectionTimeoutRef.current);
        disconnectionTimeoutRef.current = null;
      }

      // Only show toast if we were genuinely disconnected for a meaningful period
      if (wasDisconnectedForLongRef.current) {
        const hasMessages = conversation && (conversation.messages?.length > 0 || allMessages.length > 0);
        if (hasMessages) {
          toast.success("Reconnected to live chat");
        }
        wasDisconnectedForLongRef.current = false;
      }
    }

    return () => {
      if (disconnectionTimeoutRef.current) {
        clearTimeout(disconnectionTimeoutRef.current);
      }
    };
  }, [isConnected, conversation, allMessages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async (currentRetryCount = 0) => {
    setLoading(true);
    setError(null);
    setRetryCount(currentRetryCount);

    try {
      const response = await getConversationAction({
        conversationId,
      });

      if (response.success) {
        setConversation(response.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : "Failed to load conversation";

        // If conversation not found and we haven't retried too many times,
        // wait a bit and retry (helps with newly created conversations)
        if (errorMessage.includes('not found') && currentRetryCount < 3) {
          setTimeout(() => {
            loadConversation(currentRetryCount + 1);
          }, 1000 * (currentRetryCount + 1)); // Exponential backoff
          return;
        }

        setError(errorMessage);
      }
    } catch (err) {
      // Retry logic for network errors as well
      if (currentRetryCount < 3) {
        setTimeout(() => {
          loadConversation(currentRetryCount + 1);
        }, 1000 * (currentRetryCount + 1));
        return;
      }

      setError("Failed to load conversation");
      console.error("Error loading conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversationId || !currentUserId) {
      console.warn('Cannot send message: missing conversationId or currentUserId');
      return;
    }

    try {
      setLastFailedMessage(null); // Clear any previous failed message

      // Use the real-time sendMessage function which provides optimistic updates
      const result = await sendMessage(content);

      if (!result.success) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setLastFailedMessage(content); // Store the failed message for retry
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleRetryMessage = async () => {
    if (lastFailedMessage) {
      await handleSendMessage(lastFailedMessage);
    }
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [date: string]: any[] } = {};

    messages.forEach((message) => {
      // Ensure createdAt is a valid Date object
      const messageDate =
        message.createdAt instanceof Date
          ? message.createdAt
          : new Date(message.createdAt);
      const date = messageDate.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    // Sort messages within each date group by time
    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return groups;
  };

  const shouldShowAvatar = (
    message: ConversationData["messages"][0],
    nextMessage?: ConversationData["messages"][0]
  ) => {
    if (!nextMessage) return true;
    return message.userId !== nextMessage.userId;
  };

  const shouldShowName = (
    message: ConversationData["messages"][0],
    prevMessage?: ConversationData["messages"][0]
  ) => {
    if (!prevMessage) return true;
    return message.userId !== prevMessage.userId;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {retryCount > 0
              ? `Loading conversation... (attempt ${retryCount + 1})`
              : "Loading conversation..."
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => loadConversation(0)} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(allMessages);
  const dates = Object.keys(messageGroups).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader
        conversation={conversation}
        currentUserId={currentUserId}
        onlineUsers={onlineUsers}
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-muted  px-4 py-2">
          <p className="text-sm">
            Reconnecting to live chat... Please wait...
          </p>
        </div>
      )}

      {/* Sending Status */}
      {isSending && (
        <div className="bg-muted  px-4 py-2">
          <p className="text-sm">
            Sending message...
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {dates.map((date) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-muted px-3 py-1 rounded-full">
                <span className="text-xs text-muted-foreground font-medium">
                  {new Date(date).toLocaleDateString([], {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Messages for this date */}
            <div className="space-y-1">
              {messageGroups[date].map((message, index) => {
                const prevMessage = messageGroups[date][index - 1];
                const nextMessage = messageGroups[date][index + 1];

                return (
                  <MessageBubble
                    key={message.id || `${date}-${index}`}
                    message={message}
                    isOwnMessage={message.userId === currentUserId}
                    showAvatar={shouldShowAvatar(message, nextMessage)}
                    showName={shouldShowName(message, prevMessage)}
                  />
                );
              })}
            </div>
          </div>
        )
        )}

        {/* Empty state */}
        {allMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message below
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicators - Fixed at bottom */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-muted-foreground italic bg-background/95 backdrop-blur animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2">
            {typingUsers.map((user) => user.username).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        </div>
      )}

      {/* Failed Message Retry */}
      {lastFailedMessage && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm text-destructive">
                Failed to send: <span className="font-medium">"{lastFailedMessage}"</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRetryMessage}
                size="sm"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Retry
              </Button>
              <Button
                onClick={() => setLastFailedMessage(null)}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isSending || !isConnected}
        placeholder={
          !isConnected
            ? "Connecting to chat..."
            : isSending
              ? "Sending..."
              : `Message ${conversation?.type === "DIRECT"
                ? conversation.participants.find((p) => p.user.id !== currentUserId)
                  ?.user.name || "user"
                : conversation?.name || "conversation"
              }...`
        }
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
      />
    </div>
  );
}
