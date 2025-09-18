"use client";

import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";

export function useTotalUnreadCount() {
  const { data: session } = useSession();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const updateUnreadCount = useCallback(async () => {
    if (!session?.user?.id) {
      setTotalUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getUserConversationsAction({});
      if (response.success) {
        const total = response.data.reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0
        );
        setTotalUnreadCount(total);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    updateUnreadCount();
  }, [updateUnreadCount]);

  // Set up real-time subscription for conversation updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const channel = supabase.channel(`total_unread_${userId}`);

    // Listen for new messages in conversations
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          // Update unread count when new messages arrive
          setTimeout(() => updateUnreadCount(), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_participants",
          filter: `userId=eq.${userId}`,
        },
        () => {
          // Update when user's lastSeenAt is updated (marks conversation as read)
          setTimeout(() => updateUnreadCount(), 100);
        }
      )
      .subscribe();

    // Also listen for conversation update broadcasts
    const conversationUpdateChannel = supabase.channel(
      `conversation_updates:${userId}`
    );

    conversationUpdateChannel
      .on("broadcast", { event: "conversation_update" }, () => {
        // Update unread count when receiving broadcast updates
        setTimeout(() => updateUnreadCount(), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(conversationUpdateChannel);
    };
  }, [session?.user?.id, supabase, updateUnreadCount]);

  return {
    totalUnreadCount,
    loading,
    refreshUnreadCount: updateUnreadCount,
  };
}
