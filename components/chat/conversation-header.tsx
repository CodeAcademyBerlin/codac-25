"use client";

import {
  MessageCircle,
  Users,
  Hash,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationHeaderProps {
  conversation: {
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
  };
  currentUserId: string;
  onlineUsers?: Array<{
    userId: string;
    username: string;
    online_at: string;
  }>;
}

export function ConversationHeader({
  conversation,
  currentUserId,
  onlineUsers = [],
}: ConversationHeaderProps) {
  const getConversationIcon = () => {
    switch (conversation.type) {
      case "DIRECT":
        return <MessageCircle className="h-5 w-5" />;
      case "GROUP":
        return <Users className="h-5 w-5" />;
      case "CHANNEL":
        return <Hash className="h-5 w-5" />;
    }
  };

  const getConversationName = () => {
    if (conversation.name) {
      return conversation.name;
    }

    if (conversation.type === "DIRECT") {
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

  const getConversationSubtitle = () => {
    if (conversation.description) {
      return conversation.description;
    }

    if (conversation.type === "DIRECT") {
      const otherParticipant = conversation.participants.find(
        (p: any) => p.user.id !== currentUserId
      );

      // Check if the other user is online
      const isOnline = onlineUsers.some(user => user.userId === otherParticipant?.user.id);

      if (isOnline) {
        return "Online";
      }

      return otherParticipant?.user.email || "Direct message";
    }

    // For group conversations, show online count
    const onlineCount = onlineUsers.filter(user =>
      conversation.participants.some(p => p.user.id === user.userId)
    ).length;

    if (onlineCount > 0) {
      return `${conversation.participants.length} participants • ${onlineCount} online`;
    }

    return `${conversation.participants.length} participants`;
  };

  const getConversationAvatar = () => {
    if (conversation.type === "DIRECT") {
      const otherParticipant = conversation.participants.find(
        (p: any) => p.user.id !== currentUserId
      );
      return otherParticipant?.user.avatar;
    }
    return null;
  };

  const getAvatarInitials = () => {
    const name = getConversationName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar for direct messages, icon for groups/channels */}
        {conversation.type === "DIRECT" ? (
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={getConversationAvatar() || undefined} />
              <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            {(() => {
              const otherParticipant = conversation.participants.find(
                (p: any) => p.user.id !== currentUserId
              );
              const isOnline = onlineUsers.some(user => user.userId === otherParticipant?.user.id);

              return isOnline ? (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              ) : null;
            })()}
          </div>
        ) : (
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
            {getConversationIcon()}
          </div>
        )}

        {/* Conversation Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-base truncate">
              {getConversationName()}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {conversation.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {getConversationSubtitle()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {conversation.type === "DIRECT" && (
          <>
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View participants</DropdownMenuItem>
            <DropdownMenuItem>Conversation settings</DropdownMenuItem>
            {conversation.type !== "DIRECT" && (
              <DropdownMenuItem>Leave conversation</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
