"use client";

import {
  Bell,
  MessageSquare,
  Users,
  Hash,
  AtSign,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useNotifications } from "@/hooks/use-notifications";


function getNotificationIcon(type: string) {
  switch (type) {
    case "DIRECT_MESSAGE":
      return MessageSquare;
    case "GROUP_MESSAGE":
      return Users;
    case "CHANNEL_MESSAGE":
      return Hash;
    case "MENTION":
      return AtSign;
    case "CONVERSATION_INVITE":
      return UserPlus;
    default:
      return Bell;
  }
}

export function NotificationToasts() {
  const { notifications } = useNotifications();
  const router = useRouter();

  useEffect(() => {
    // Get the latest notification
    const latestNotification = notifications[0];

    if (latestNotification && !latestNotification.isRead) {
      const Icon = getNotificationIcon(latestNotification.type);

      toast(latestNotification.title, {
        description: latestNotification.message,
        icon: <Icon className="h-4 w-4" />,
        action: latestNotification.conversationId
          ? {
              label: "View",
              onClick: () => {
                router.push(
                  `/chat?conversation=${latestNotification.conversationId}`
                );
              },
            }
          : undefined,
      });
    }
  }, [notifications, router]);

  return null;
}
