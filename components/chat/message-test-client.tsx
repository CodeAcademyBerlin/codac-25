"use client";

import {
  Loader2,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { getConversationAction } from "@/actions/chat/get-conversation";
import { sendConversationMessage } from "@/actions/chat/send-conversation-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface MessageTestClientProps {
  currentUserId: string;
}

export function MessageTestClient({ currentUserId }: MessageTestClientProps) {
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [result, setResult] = useState<any>(null);
  const [conversationDetails, setConversationDetails] = useState<any>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !conversationId.trim() || !messageContent.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await sendConversationMessage({
        conversationId: conversationId.trim(),
        content: messageContent.trim(),
      });

      console.log("Message send response:", response);
      setResult(response);

      if (response.success) {
        setMessageContent("");
        // Refresh conversation details to see the new message
        if (conversationDetails) {
          await loadConversationDetails(conversationId.trim());
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (convId: string) => {
    if (!convId.trim()) return;

    setLoadingConversation(true);
    try {
      const response = await getConversationAction({
        conversationId: convId.trim(),
      });

      if (response.success) {
        setConversationDetails(response.data);
      } else {
        console.error("Failed to load conversation:", response.error);
        setConversationDetails(null);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setConversationDetails(null);
    } finally {
      setLoadingConversation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Message Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Current User: {currentUserId}</Badge>
        </CardContent>
      </Card>

      {/* Load Conversation Details */}
      <Card>
        <CardHeader>
          <CardTitle>Load Conversation</CardTitle>
          <CardDescription>
            Enter a conversation ID to load its details and messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="conv-id">Conversation ID</Label>
              <Input
                id="conv-id"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="Enter conversation ID"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => loadConversationDetails(conversationId)}
                disabled={loadingConversation || !conversationId.trim()}
              >
                {loadingConversation && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Load
              </Button>
            </div>
          </div>

          {/* Conversation Details */}
          {conversationDetails && (
            <div className="border rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {conversationDetails.name ||
                    `${conversationDetails.type} Conversation`}
                </h4>
                <Badge variant="secondary">{conversationDetails.type}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Participants ({conversationDetails.participants?.length || 0}
                  ):
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {conversationDetails.participants?.map((p: any) => (
                    <Badge key={p.id} variant="outline" className="text-xs">
                      {p.user?.name || p.userId} ({p.role})
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Messages ({conversationDetails.messages?.length || 0}):
                </p>
                {conversationDetails.messages?.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto space-y-2 mt-2 border rounded p-2">
                    {conversationDetails.messages.map((msg: any) => (
                      <div key={msg.id} className="text-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">
                            {msg.user?.name || msg.userId}
                          </span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-1">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    No messages yet
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Message Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Send Message
          </CardTitle>
          <CardDescription>
            Send a message to the loaded conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <Label htmlFor="message">Message Content</Label>
              <Input
                id="message"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message..."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={
                loading || !conversationId.trim() || !messageContent.trim()
              }
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              Message Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Quick Test Conversation IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Test</CardTitle>
          <CardDescription>
            Use these conversation IDs from recent tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                cmfb678tc00018ozxjkqd8s92
              </Badge>
              <span className="text-sm text-muted-foreground">Direct</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConversationId("cmfb678tc00018ozxjkqd8s92")}
              >
                Use
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                cmfb67sj000058ozxhb5zwhhc
              </Badge>
              <span className="text-sm text-muted-foreground">Group</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConversationId("cmfb67sj000058ozxhb5zwhhc")}
              >
                Use
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                cmfb6859x00098ozxjrub6bl2
              </Badge>
              <span className="text-sm text-muted-foreground">Channel</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConversationId("cmfb6859x00098ozxjrub6bl2")}
              >
                Use
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
