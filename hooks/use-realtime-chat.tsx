"use client";

import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/actions/chats/send-message";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage as PrismaChatMessage } from "@prisma/client";

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
  initialMessages?: PrismaChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export interface UserPresence {
  username: string;
  userId?: string;
  online_at: string;
}

export interface TypingUser {
  username: string;
  typing_at: string;
}

// Convert Prisma message to ChatMessage format
function convertPrismaMessageToChatMessage(
  prismaMessage: PrismaChatMessage
): ChatMessage {
  // Handle both Date objects and ISO strings for createdAt
  const createdAt =
    prismaMessage.createdAt instanceof Date
      ? prismaMessage.createdAt.toISOString()
      : typeof prismaMessage.createdAt === "string"
      ? prismaMessage.createdAt
      : new Date(prismaMessage.createdAt).toISOString();

  return {
    id: prismaMessage.id,
    content: prismaMessage.content,
    user: {
      name: prismaMessage.userName || "Anonymous",
    },
    createdAt,
  };
}

export function useRealtimeChat({
  roomName,
  username,
  initialMessages = [],
}: UseRealtimeChatProps) {
  const supabase = createClient();
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialMessages.map(convertPrismaMessageToChatMessage)
  );
  const [channel, setChannel] = useState<ReturnType<
    typeof supabase.channel
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Create channel for this specific room with retry logic
    const newChannel = supabase.channel(`chat:${roomName}`, {
      config: {
        broadcast: { self: true },
        presence: { key: username },
      },
    });

    let retryCount = 0;
    const maxRetries = 3;

    const setupChannel = () => {
      console.log(`🔧 Setting up channel for room: ${roomName}`);
      console.log("🔧 Channel config:", {
        channelName: `chat:${roomName}`,
        filter: `roomName=eq.${roomName}`,
        username: username,
      });

      // Test: Listen to ALL postgres changes on chat_messages (no filter)
      newChannel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            console.log("🎯 ANY change detected on chat_messages:", payload);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `roomName=eq.${roomName}`,
          },
          (payload) => {
            console.log("✅ Received new message via realtime:", payload);
            console.log("✅ Payload details:", {
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              schema: payload.schema,
              table: payload.table,
            });

            try {
              console.log("🔍 Raw payload.new:", payload.new);
              console.log("🔍 Raw payload.new type:", typeof payload.new);
              console.log(
                "🔍 Raw payload.new.createdAt:",
                payload.new?.createdAt
              );
              console.log(
                "🔍 Raw payload.new.createdAt type:",
                typeof payload.new?.createdAt
              );

              const newMessage = convertPrismaMessageToChatMessage(
                payload.new as PrismaChatMessage
              );
              console.log("✅ Converted message:", newMessage);

              setMessages((current) => {
                console.log("🔄 Current messages count:", current.length);
                // Avoid duplicates
                if (current.some((msg) => msg.id === newMessage.id)) {
                  console.log("⚠️ Duplicate message ignored:", newMessage.id);
                  return current;
                }
                console.log("✅ Adding new message to state");
                const updated = [...current, newMessage];
                console.log("🔄 New messages count:", updated.length);
                return updated;
              });
            } catch (error) {
              console.error("❌ Error processing realtime message:", error);
            }
          }
        )
        .on("presence", { event: "sync" }, () => {
          console.log("👥 Presence sync event received");
          const presenceState = newChannel.presenceState();
          console.log("👥 Presence state:", presenceState);

          const users: UserPresence[] = [];

          Object.keys(presenceState).forEach((key) => {
            const presences = presenceState[key];
            if (presences && presences.length > 0) {
              // Safely cast the presence data
              const presence = presences[0] as any;
              if (presence.username) {
                users.push({
                  username: presence.username,
                  userId: key,
                  online_at: presence.online_at || new Date().toISOString(),
                });
              }
            }
          });

          setOnlineUsers(users.filter((user) => user.username !== username));
          console.log("👥 Online users:", users);
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("User joined:", key, newPresences);
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("User left:", key, leftPresences);
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          const { username: typingUsername, isTyping: userIsTyping } = payload;

          setTypingUsers((current) => {
            const filtered = current.filter(
              (user) => user.username !== typingUsername
            );

            if (userIsTyping && typingUsername !== username) {
              return [
                ...filtered,
                {
                  username: typingUsername,
                  typing_at: new Date().toISOString(),
                },
              ];
            }

            return filtered;
          });

          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((current) =>
              current.filter((user) => user.username !== typingUsername)
            );
          }, 3000);
        })
        .on("broadcast", { event: "new_message" }, ({ payload }) => {
          console.log("📨 Received broadcast message:", payload);

          if (payload.message) {
            try {
              const newMessage = convertPrismaMessageToChatMessage(
                payload.message
              );
              console.log("📨 Converted broadcast message:", newMessage);

              setMessages((current) => {
                if (current.some((msg) => msg.id === newMessage.id)) {
                  console.log(
                    "⚠️ Duplicate broadcast message ignored:",
                    newMessage.id
                  );
                  return current;
                }
                console.log("✅ Adding broadcast message to state");
                return [...current, newMessage];
              });
            } catch (error) {
              console.error("❌ Error processing broadcast message:", error);
            }
          }
        })
        .subscribe(async (status, err) => {
          console.log("📡 Channel subscription status:", status, err);

          if (status === "SUBSCRIBED") {
            console.log("✅ Successfully subscribed to channel");
            setIsConnected(true);
            retryCount = 0; // Reset retry count on successful connection

            // Track presence
            newChannel.track({
              username,
              online_at: new Date().toISOString(),
            });
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            setIsConnected(false);

            // Retry connection with exponential backoff
            if (retryCount < maxRetries) {
              const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              retryCount++;
              console.log(
                `Retrying connection in ${delay}ms (attempt ${retryCount})`
              );

              setTimeout(() => {
                newChannel.unsubscribe();
                setupChannel();
              }, delay);
            } else {
              console.error("Max retries reached. Connection failed.");
              toast.error(
                "Failed to connect to chat. Please refresh the page."
              );
            }
          } else if (status === "CLOSED") {
            setIsConnected(false);
          }
        });
    };

    setupChannel();
    setChannel(newChannel);

    return () => {
      newChannel.untrack();
      newChannel.unsubscribe();
    };
  }, [roomName, username, supabase]);

  const sendMessageAction = useCallback(
    async (content: string) => {
      if (!isConnected || isSending) return;

      setIsSending(true);

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        channel?.send({
          type: "broadcast",
          event: "typing",
          payload: { username, isTyping: false },
        });
      }

      try {
        const result = await sendMessage({
          content,
          roomName,
        });

        if (!result.success) {
          toast.error(
            typeof result.error === "string"
              ? result.error
              : "Failed to send message"
          );
          return;
        }

        console.log("📤 Message sent successfully, broadcasting...");

        // Broadcast the new message as backup (in case postgres_changes doesn't work)
        if (channel && result.data) {
          await channel.send({
            type: "broadcast",
            event: "new_message",
            payload: {
              message: result.data,
            },
          });
          console.log("📤 Broadcast sent for message:", result.data);
        }

        // Message will be added to the list via realtime subscription
        // so we don't need to manually update the state here
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [isConnected, isSending, roomName, isTyping, channel, username]
  );

  const startTyping = useCallback(() => {
    if (!isTyping && channel && isConnected) {
      setIsTyping(true);
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { username, isTyping: true },
      });
    }
  }, [isTyping, channel, isConnected, username]);

  const stopTyping = useCallback(() => {
    if (isTyping && channel && isConnected) {
      setIsTyping(false);
      channel.send({
        type: "broadcast",
        event: "typing",
        payload: { username, isTyping: false },
      });
    }
  }, [isTyping, channel, isConnected, username]);

  return {
    messages,
    sendMessage: sendMessageAction,
    isConnected: isConnected && !isSending,
    isSending,
    onlineUsers,
    typingUsers,
    startTyping,
    stopTyping,
  };
}
