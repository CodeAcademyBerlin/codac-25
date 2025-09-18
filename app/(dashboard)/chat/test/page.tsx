import { ChatDebugComponent } from "@/components/chat/chat-debug";
import { ConversationTestClient } from "@/components/chat/conversation-test-client";
import { MessageTestClient } from "@/components/chat/message-test-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireServerAuth } from "@/lib/auth/auth-server";

export default async function ConversationTestPage() {
  const user = await requireServerAuth();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chat System Testing</h1>

        <Tabs defaultValue="debug" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="debug">Debug</TabsTrigger>
            <TabsTrigger value="conversations">
              Create Conversations
            </TabsTrigger>
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="debug" className="space-y-0">
            <div className="bg-card border rounded-lg p-6">
              <ChatDebugComponent currentUserId={user.id} />
            </div>
          </TabsContent>

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
