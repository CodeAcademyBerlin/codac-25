import { redirect } from "next/navigation";

import { ConversationTestClient } from "@/components/chat/conversation-test-client";
import { MessageTestClient } from "@/components/chat/message-test-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth/auth";

export default async function ConversationTestPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/signin?callbackUrl=/chat/test");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chat System Testing</h1>

        <Tabs defaultValue="conversations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations">
              Create Conversations
            </TabsTrigger>
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="conversations" className="space-y-0">
            <div className="bg-card border rounded-lg p-6">
              <ConversationTestClient currentUserId={user.id} />
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-0">
            <div className="bg-card border rounded-lg p-6">
              <MessageTestClient currentUserId={user.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
