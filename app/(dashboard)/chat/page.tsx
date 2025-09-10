import { redirect } from "next/navigation";

import { ChatLayout } from "@/components/chat/chat-layout";
import { auth } from "@/lib/auth/auth";

export default async function ChatPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/signin?callbackUrl=/chat");
  }

  return <ChatLayout currentUserId={user.id} />;
}
