"use client";

import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
import { useCallback, useEffect, useState } from "react";
import type { ConversationWithParticipants } from "@/data/chat/get-conversations";

interface UseSimpleConversationListProps {
  currentUserId: string;
}

export function useSimpleConversationList({
  currentUserId,
}: UseSimpleConversationListProps) {
  const [conversations, setConversations] = useState<
    ConversationWithParticipants[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations without realtime
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("📋 [SIMPLE] Loading conversations for user:", currentUserId);

      const response = await getUserConversationsAction({});
      console.log("📋 [SIMPLE] Server action response:", response);

      if (response.success) {
        setConversations(response.data);
        console.log(
          "✅ [SIMPLE] Loaded",
          response.data.length,
          "conversations"
        );
        console.log("📋 [SIMPLE] Conversations data:", response.data);
      } else {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : "Failed to load conversations";
        setError(errorMessage);
        console.error(
          "❌ [SIMPLE] Failed to load conversations:",
          response.error
        );
      }
    } catch (err) {
      setError("Failed to load conversations");
      console.error("❌ [SIMPLE] Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Load initial data only
  useEffect(() => {
    console.log("🔄 [SIMPLE] Loading conversations for user:", currentUserId);

    if (!currentUserId) {
      console.warn("❌ [SIMPLE] No currentUserId provided");
      return;
    }

    loadConversations();
  }, [currentUserId, loadConversations]);

  const getFilteredConversations = useCallback(
    (activeTab: "all" | "direct" | "group" | "channel") => {
      if (activeTab === "all") {
        return conversations;
      }
      return conversations.filter(
        (conv) => conv.type.toLowerCase() === activeTab.toLowerCase()
      );
    },
    [conversations]
  );

  // Function to mark a conversation as read locally
  const markConversationReadLocally = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  return {
    loading,
    error,
    conversations,
    getFilteredConversations,
    refreshConversations: loadConversations,
    markConversationReadLocally,
    // Helper to get unread count for a specific conversation
    getUnreadCount: (conversationId: string) => {
      const conversation = conversations.find((c) => c.id === conversationId);
      return conversation?.unreadCount || 0;
    },
  };
}
