import { ChatLayout } from "@/components/chat/chat-layout";
import { requireServerAuth } from "@/lib/auth/auth-server";

export default async function ChatPage() {
  const user = await requireServerAuth();

  return <ChatLayout currentUserId={user.id} currentUserName={user.name || undefined} />;
}
