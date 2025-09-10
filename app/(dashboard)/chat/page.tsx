import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function ChatPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/signin?callbackUrl=/chat");
  }

  return <ChatLayout currentUserId={user.id} />;
}
