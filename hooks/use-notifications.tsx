"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { logger } from "@/lib/logger";

export interface Notification {
  id: string;
  type:
    | "DIRECT_MESSAGE"
    | "GROUP_MESSAGE"
    | "CHANNEL_MESSAGE"
    | "MENTION"
    | "CONVERSATION_INVITE"
    | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  metadata?: Record<string, any>;
  messageId?: string;
  conversationId?: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();

  // Subscribe to realtime notifications
  useEffect(() => {
    // Don't set up subscription if session is still loading or user is not authenticated
    if (status === "loading" || !user?.id) return;

    logger.info("Setting up notification subscription", {
      metadata: { userId: user.id },
    });

    const channel = supabase.channel(`user:notifications:${user.id}`);

    channel
      .on("broadcast", { event: "new_notification" }, (payload) => {
        logger.info("New notification received", {
          metadata: {
            notificationId: payload.payload.id,
            type: payload.payload.type,
          },
        });

        const notification = payload.payload as Notification;
        setNotifications((prev) => [notification, ...prev]);
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        logger.info("Notification subscription status", {
          metadata: { status, userId: user.id },
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, status]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  // Clear specific notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isConnected,
    clearNotification,
    clearAllNotifications,
  };
}
