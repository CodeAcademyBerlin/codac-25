"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Users, Hash, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
import type { ConversationWithParticipants } from "@/data/chat/get-conversations";

interface ConversationListProps {
  currentUserId: string;
  selectedConversationId?: string | null;
  onConversationSelect: (conversationId: string) => void;
  activeTab: "all" | "direct" | "group" | "channel";
}

export function ConversationList({
  currentUserId,
  selectedConversationId,
  onConversationSelect,
  activeTab,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<
    ConversationWithParticipants[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserConversationsAction({});
      if (response.success) {
        setConversations(response.data);
      } else {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : "Failed to load conversations";
        setError(errorMessage);
      }
    } catch (err) {
      setError("Failed to load conversations");
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case "DIRECT":
        return <User className="h-4 w-4" />;
      case "GROUP":
        return <Users className="h-4 w-4" />;
      case "CHANNEL":
        return <Hash className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getConversationName = (conversation: ConversationWithParticipants) => {
    if (conversation.name) {
      return conversation.name;
    }

    if (conversation.type === "DIRECT") {
      // Find the other participant
      const otherParticipant = conversation.participants.find(
        (p: any) => p.user.id !== currentUserId
      );
      return (
        otherParticipant?.user.name ||
        otherParticipant?.user.email ||
        "Unknown User"
      );
    }

    return `${conversation.type} Conversation`;
  };

  const getLastMessagePreview = (
    conversation: ConversationWithParticipants
  ) => {
    if (!conversation.lastMessage) {
      return "No messages yet";
    }

    const maxLength = 50;
    const content = conversation.lastMessage.content;
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "all") return true;
    if (activeTab === "direct") return conversation.type === "DIRECT";
    if (activeTab === "group") return conversation.type === "GROUP";
    if (activeTab === "channel") return conversation.type === "CHANNEL";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center text-destructive text-sm">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConversations}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {activeTab === "all"
            ? "No conversations yet"
            : `No ${activeTab} conversations`}
        </p>
        <p className="text-xs">Start a new conversation to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        {filteredConversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant="ghost"
            className={cn(
              "w-full h-auto p-3 justify-start flex-col items-start gap-2",
              selectedConversationId === conversation.id && "bg-muted"
            )}
            onClick={() => onConversationSelect(conversation.id)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {getConversationIcon(conversation.type)}
                <span className="font-medium text-sm truncate">
                  {getConversationName(conversation)}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant="secondary" className="text-xs h-5">
                  {conversation.participants.length}
                </Badge>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(conversation.lastMessage.createdAt.toString())}
                  </span>
                )}
              </div>
            </div>

            {conversation.lastMessage && (
              <div className="w-full text-left">
                <p className="text-xs text-muted-foreground truncate">
                  {getLastMessagePreview(conversation)}
                </p>
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
