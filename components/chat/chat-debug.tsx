"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
import { createClient } from "@/lib/supabase/client";

export function ChatDebugComponent({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    async function runDebug() {
      console.log("🔍 Starting chat debug for user:", currentUserId);
      console.log("🔍 NextAuth session status:", status);
      console.log("🔍 NextAuth session:", session);

      const supabase = createClient();
      const results: any = {
        timestamp: new Date().toISOString(),
        userId: currentUserId,
        tests: {},
      };

      try {
        // Test 1: Server Action
        console.log("🔍 Testing server action...");
        const actionResult = await getUserConversationsAction({});
        results.tests.serverAction = {
          success: actionResult.success,
          error: actionResult.success ? null : actionResult.error,
          dataLength: actionResult.success ? actionResult.data?.length : 0,
          data: actionResult.success ? actionResult.data : null,
        };

        // Test 2: Check NextAuth session
        console.log("🔍 Testing NextAuth authentication...");
        if (status === "loading") {
          results.tests.auth = {
            error: "NextAuth session still loading...",
          };
        } else if (status === "unauthenticated" || !session) {
          results.tests.auth = {
            error: "NextAuth session missing! Please sign in.",
          };
        } else {
          results.tests.auth = {
            userId: session.user?.id,
            email: session.user?.email,
            name: session.user?.name,
            status: status,
            error: null,
          };
        }

        // Test 3: Supabase client setup (for direct queries)
        console.log("🔍 Testing Supabase client configuration...");

        // For NextAuth + Supabase setup, we might need to set the auth token
        // Let's test if direct queries work at all
        if (!session || status !== "authenticated") {
          results.tests.conversations = {
            count: 0,
            error: "Skipped - no NextAuth session",
            data: null,
          };
          results.tests.participants = {
            count: 0,
            error: "Skipped - no NextAuth session",
            data: null,
          };
          results.tests.messages = {
            count: 0,
            error: "Skipped - no NextAuth session",
            data: null,
          };
          results.tests.complexQuery = {
            count: 0,
            error: "Skipped - no NextAuth session",
            data: null,
          };
        } else {
          // Test direct Supabase queries
          console.log("🔍 Testing direct Supabase queries...");

          // Test conversations table
          const { data: conversations, error: convError } = await supabase
            .from("conversations")
            .select("*")
            .limit(10);

          results.tests.conversations = {
            count: conversations?.length || 0,
            error: convError?.message,
            data: conversations,
          };

          // Test conversation_participants table
          const { data: participants, error: partError } = await supabase
            .from("conversation_participants")
            .select("*")
            .eq("userId", currentUserId)
            .limit(10);

          results.tests.participants = {
            count: participants?.length || 0,
            error: partError?.message,
            data: participants,
          };

          // Test chat_messages table
          const { data: messages, error: msgError } = await supabase
            .from("chat_messages")
            .select("*")
            .limit(10);

          results.tests.messages = {
            count: messages?.length || 0,
            error: msgError?.message,
            data: messages,
          };

          // Test complex query like getUserConversations does
          const { data: complexQuery, error: complexError } = await supabase
            .from("conversations")
            .select(
              `
              *,
              participants:conversation_participants(
                *,
                user:users(id, name, email, avatar)
              ),
              messages:chat_messages(
                id, content, createdAt, userName, userId
              )
            `
            )
            .eq("participants.userId", currentUserId)
            .limit(5);

          results.tests.complexQuery = {
            count: complexQuery?.length || 0,
            error: complexError?.message,
            data: complexQuery,
          };
        }
      } catch (error) {
        results.error =
          error instanceof Error ? error.message : "Unknown error";
        console.error("🚨 Debug error:", error);
      }

      console.log("🔍 Debug results:", results);
      setDebugInfo(results);
      setLoading(false);
    }

    // Wait for NextAuth session to load
    if (status !== "loading") {
      runDebug();
    }
  }, [currentUserId, session, status]);

  if (loading || status === "loading") {
    return <div className="p-4">🔍 Running chat debug tests...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Chat Debug Information</h2>

      <div className="bg-blue-50 p-4 rounded text-sm border border-blue-200">
        <h3 className="font-bold mb-2 text-blue-800">Authentication System</h3>
        <p className="text-blue-700">
          ℹ️ This app uses <strong>NextAuth</strong> for authentication, not
          Supabase Auth.
        </p>
        <p className="text-blue-700">
          NextAuth Status: <strong>{status}</strong>
        </p>
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <h3 className="font-bold mb-2">Server Action Test</h3>
        <p>Success: {debugInfo?.tests.serverAction?.success ? "✅" : "❌"}</p>
        <p>Data Length: {debugInfo?.tests.serverAction?.dataLength}</p>
        {debugInfo?.tests.serverAction?.error && (
          <p className="text-red-600">
            Error: {debugInfo.tests.serverAction.error}
          </p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <h3 className="font-bold mb-2">NextAuth Session Test</h3>
        <p>
          User ID: {debugInfo?.tests.auth?.userId || "❌ Not authenticated"}
        </p>
        <p>Email: {debugInfo?.tests.auth?.email || "N/A"}</p>
        <p>Name: {debugInfo?.tests.auth?.name || "N/A"}</p>
        <p>Status: {debugInfo?.tests.auth?.status || "Unknown"}</p>
        {debugInfo?.tests.auth?.error && (
          <p className="text-red-600">Error: {debugInfo.tests.auth.error}</p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <h3 className="font-bold mb-2">Direct Table Access (via Supabase)</h3>
        <p>Conversations: {debugInfo?.tests.conversations?.count} rows</p>
        <p>Participants: {debugInfo?.tests.participants?.count} rows</p>
        <p>Messages: {debugInfo?.tests.messages?.count} rows</p>
        {debugInfo?.tests.conversations?.error && (
          <p className="text-red-600">
            Conv Error: {debugInfo.tests.conversations.error}
          </p>
        )}
        {debugInfo?.tests.participants?.error && (
          <p className="text-red-600">
            Part Error: {debugInfo.tests.participants.error}
          </p>
        )}
        {debugInfo?.tests.messages?.error && (
          <p className="text-red-600">
            Msg Error: {debugInfo.tests.messages.error}
          </p>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded text-sm">
        <h3 className="font-bold mb-2">Complex Query Test</h3>
        <p>Results: {debugInfo?.tests.complexQuery?.count} conversations</p>
        {debugInfo?.tests.complexQuery?.error && (
          <p className="text-red-600">
            Error: {debugInfo.tests.complexQuery.error}
          </p>
        )}
      </div>

      <details className="bg-gray-50 p-4 rounded">
        <summary className="font-bold cursor-pointer">Raw Debug Data</summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  );
}
