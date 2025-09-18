"use client";

import {
  Bell,
  X,
  Check,
  MessageSquare,
  Users,
  Hash,
  AtSign,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";


function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "DIRECT_MESSAGE":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "GROUP_MESSAGE":
      return <Users className="h-4 w-4 text-green-500" />;
    case "CHANNEL_MESSAGE":
      return <Hash className="h-4 w-4 text-purple-500" />;
    case "MENTION":
      return <AtSign className="h-4 w-4 text-orange-500" />;
    case "CONVERSATION_INVITE":
      return <UserPlus className="h-4 w-4 text-cyan-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onClear,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClear: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  return (
    <DropdownMenuItem
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer border-l-2 transition-colors focus:bg-muted/50",
        notification.isRead
          ? "border-l-transparent"
          : "border-l-primary bg-muted/20"
      )}
      onSelect={() => onClick(notification)}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn("text-sm", !notification.isRead && "font-medium")}>
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onClear(notification.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    isConnected,
  } = useNotifications();

  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    if (notification.conversationId) {
      router.push(`/chat?conversation=${notification.conversationId}`);
    } else if (notification.messageId) {
      // Navigate to the message location
      router.push(`/chat`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0">
            Notifications
            {!isConnected && (
              <span className="text-xs text-muted-foreground ml-2">
                (Disconnected)
              </span>
            )}
          </DropdownMenuLabel>

          {notifications.length > 0 && (
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={clearAllNotifications}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No notifications yet
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onClear={clearNotification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
