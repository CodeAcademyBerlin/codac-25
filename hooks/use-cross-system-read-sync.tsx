"use client";

import { useCallback } from "react";
import { useNotifications } from "./use-notifications";

/**
 * Hook to sync read status between notifications and chat systems
 * When a conversation is marked as read, this will also mark related notifications as read
 */
export function useCrossSystemReadSync() {
  const { markAsRead: markNotificationAsRead, notifications } = useNotifications();

  // Mark related notifications as read when a conversation is marked as read
  const syncConversationRead = useCallback(
    (conversationId: string) => {
      // Find and mark all notifications related to this conversation as read
      const relatedNotifications = notifications.filter(
        (notification) =>
          notification.conversationId === conversationId && !notification.isRead
      );

      relatedNotifications.forEach((notification) => {
        markNotificationAsRead(notification.id);
      });

      if (relatedNotifications.length > 0) {
        console.log(
          `📖 Auto-marked ${relatedNotifications.length} notifications as read for conversation ${conversationId}`
        );
      }
    },
    [notifications, markNotificationAsRead]
  );

  return {
    syncConversationRead,
  };
}
