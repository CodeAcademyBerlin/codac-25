"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useRealtimeChat } from "@/hooks/use-realtime-chat";
import type { ChatMessage as PrismaChatMessage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface RealtimeChatProps {
  roomName: string;
  username: string;
  initialMessages?: PrismaChatMessage[];
}

/**
 * Realtime chat component
 * @param roomName - The name of the room to join. Each room is a unique chat.
 * @param username - The username of the user
 * @param initialMessages - The initial messages from the database to display in the chat.
 * @returns The chat component
 */
export const RealtimeChat = ({
  roomName,
  username,
  initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    isSending,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
  } = useRealtimeChat({
    roomName,
    username,
    initialMessages,
  });
  const [newMessage, setNewMessage] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Use messages from the hook (which handles initial + realtime messages)
  const allMessages = realtimeMessages;

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageToSend = newMessage.trim();
    setNewMessage("");

    // Clear typing indicator immediately
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    stopTyping();

    await sendMessage(messageToSend);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (!e.target.value.trim()) {
      // If input is empty, stop typing
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      stopTyping();
    } else {
      // Start typing if not already
      startTyping();

      // Reset the typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Stop typing after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        stopTyping();
        setTypingTimeout(null);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name;

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  message={message}
                  isOwnMessage={message.user.name === username}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>

        {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground italic">
            {typingUsers.length === 1
              ? `${typingUsers[0].username} is typing...`
              : typingUsers.length === 2
              ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
              : `${typingUsers[0].username} and ${
                  typingUsers.length - 1
                } others are typing...`}
          </div>
        )}
      </div>

      {/* Status and presence indicator */}
      <div className="px-4 py-2 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <span>{onlineUsers.length} online</span>
              <div className="flex -space-x-1">
                {onlineUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    className="w-4 h-4 rounded-full bg-green-500 border border-background text-[8px] flex items-center justify-center text-white"
                    title={user.username}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                ))}
                {onlineUsers.length > 3 && (
                  <div className="w-4 h-4 rounded-full bg-muted-foreground border border-background text-[8px] flex items-center justify-center text-white">
                    +{onlineUsers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          disabled={!isConnected || isSending}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected || isSending}
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        )}
      </form>
    </div>
  );
};
