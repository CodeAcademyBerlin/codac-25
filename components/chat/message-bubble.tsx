"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: Date | string;
    userName: string | null;
    userId: string;
    user?: {
      id: string;
      name: string | null;
      email: string | null;
      avatar: string | null;
    };
  };
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showName?: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showName = true,
}: MessageBubbleProps) {
  const formatTime = (date: Date | string) => {
    const messageDate = typeof date === "string" ? new Date(date) : date;
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = () => {
    return (
      message.user?.name ||
      message.userName ||
      message.user?.email ||
      "Unknown User"
    );
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%] mb-4",
        isOwnMessage ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.user?.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1",
          isOwnMessage ? "items-end" : "items-start"
        )}
      >
        {/* Name and Time */}
        {showName && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground",
              isOwnMessage ? "flex-row-reverse" : ""
            )}
          >
            <span className="font-medium">{getUserName()}</span>
            <span>{formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-lg px-3 py-2 max-w-full break-words",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
