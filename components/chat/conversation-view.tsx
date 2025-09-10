"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState, useRef } from "react";

import { getConversationAction } from "@/actions/chat/get-conversation";
import { sendConversationMessage } from "@/actions/chat/send-conversation-message";
import { Button } from "@/components/ui/button";

import { ConversationHeader } from "./conversation-header";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";


interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
}

interface ConversationData {
  id: string;
  type: "DIRECT" | "GROUP" | "CHANNEL";
  name: string | null;
  description: string | null;
  participants: Array<{
    id: string;
    role: string;
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
}: ConversationViewProps) {
  const [conversation, setConversation] = useState<ConversationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getConversationAction({
        conversationId,
      });

      if (response.success) {
        setConversation(response.data);
      } else {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : "Failed to load conversation";
        setError(errorMessage);
      }
    } catch (err) {
      setError("Failed to load conversation");
      console.error("Error loading conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!conversation || sending) return;

    setSending(true);
    try {
      const response = await sendConversationMessage({
        conversationId: conversation.id,
        content,
      });

      if (response.success) {
        // Reload conversation to get the new message
        await loadConversation();
      } else {
        console.error("Failed to send message:", response.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const groupMessagesByDate = (messages: ConversationData["messages"]) => {
    const groups: { [date: string]: ConversationData["messages"] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
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
          <p className="text-muted-foreground">Loading conversation...</p>
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
          <Button onClick={loadConversation} variant="outline">
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

  const messageGroups = groupMessagesByDate(conversation.messages);
  const dates = Object.keys(messageGroups).sort();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <ConversationHeader
        conversation={conversation}
        currentUserId={currentUserId}
      />

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
                    key={message.id}
                    message={message}
                    isOwnMessage={message.userId === currentUserId}
                    showAvatar={shouldShowAvatar(message, nextMessage)}
                    showName={shouldShowName(message, prevMessage)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {conversation.messages.length === 0 && (
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

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={sending}
        placeholder={`Message ${
          conversation.type === "DIRECT"
            ? conversation.participants.find((p) => p.user.id !== currentUserId)
                ?.user.name || "user"
            : conversation.name || "conversation"
        }...`}
      />
    </div>
  );
}
