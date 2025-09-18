"use client";

import { createClient } from "@/lib/supabase/client";
import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
import { useCallback, useEffect, useState } from "react";
import type { ConversationWithParticipants } from "@/data/chat/get-conversations";

interface UseRealtimeConversationListProps {
  currentUserId: string;
  selectedConversationId?: string | null;
  initialConversations?: ConversationWithParticipants[];
}

export function useRealtimeConversationList({
  currentUserId,
  selectedConversationId,
}: UseRealtimeConversationListProps) {
  const [conversations, setConversations] = useState<
    ConversationWithParticipants[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const supabase = createClient();

  // Load initial conversations
  const loadConversations = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    // Load initial data
    loadConversations();

    // Create a simpler channel for conversation updates
    const conversationChannel = supabase.channel(
      `conversations_${currentUserId}`,
      {
        config: {
          broadcast: { self: false },
        },
      }
    );

    // Create separate channel for conversation update broadcasts
    const conversationUpdateChannel = supabase.channel(
      `conversation_updates:${currentUserId}`
    );

    // Simplified listeners to avoid binding mismatches
    conversationChannel
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "conversation_participants",
        },
        () => {
          // Reload conversations on any participant change
          setTimeout(() => loadConversations(), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          console.log("� Conversation change:", payload);
          // Reload conversations on any conversation change
          setTimeout(() => loadConversations(), 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Only new messages
          schema: "public",
          table: "chat_messages",
        },
        () => {
          // Reload conversations to update last message
          setTimeout(() => loadConversations(), 100);
        }
      );

    // Subscribe to the channel
    conversationChannel.subscribe(async (status, err) => {
      if (err) {
        console.error("Conversation list subscription error:", err);
      }
      setIsConnected(status === "SUBSCRIBED");

      if (status === "CHANNEL_ERROR") {
        setIsConnected(false);
      } else if (status === "TIMED_OUT") {
        setIsConnected(false);
      } else if (status === "CLOSED") {
        setIsConnected(false);
      }
    });

    // Subscribe to conversation update broadcasts
    conversationUpdateChannel
      .on("broadcast", { event: "conversation_update" }, () => {
        // Reload conversations when receiving broadcast updates
        setTimeout(() => {
          loadConversations();
        }, 100);
      })
      .subscribe();

    // Cleanup function
    return () => {
      conversationChannel.unsubscribe();
      conversationUpdateChannel.unsubscribe();
    };
  }, [currentUserId, selectedConversationId, supabase, loadConversations]);

  // Mark conversation as read
  const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  // Clear unread count when a conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  // Filter conversations by type
  const getFilteredConversations = useCallback(
    (activeTab: "all" | "direct" | "group" | "channel") => {
      return conversations.filter((conversation) => {
        if (activeTab === "all") return true;
        if (activeTab === "direct") return conversation.type === "DIRECT";
        if (activeTab === "group") return conversation.type === "GROUP";
        if (activeTab === "channel") return conversation.type === "CHANNEL";
        return true;
      });
    },
    [conversations]
  );

  // Get unread count for a conversation
  const getUnreadCount = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      return conversation?.unreadCount || 0;
    },
    [conversations]
  );

  // Get total unread count for a tab
  const getTotalUnreadCount = useCallback(
    (activeTab: "all" | "direct" | "group" | "channel") => {
      const filteredConversations = getFilteredConversations(activeTab);
      return filteredConversations.reduce((total, conversation) => {
        return total + getUnreadCount(conversation.id);
      }, 0);
    },
    [getFilteredConversations, getUnreadCount]
  );

  // Manual refresh function
  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    isConnected,
    getFilteredConversations,
    getUnreadCount,
    getTotalUnreadCount,
    refreshConversations,
    markAsRead,
  };
}
