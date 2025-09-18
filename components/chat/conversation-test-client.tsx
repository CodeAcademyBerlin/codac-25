"use client";

import {
  Loader2,
  MessageCircle,
  Users,
  Hash,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

import { createConversation } from "@/actions/chat/create-conversation";
import { getAvailableUsers } from "@/actions/chat/get-available-users";
import { getUserConversationsAction } from "@/actions/chat/get-user-conversations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConversationTestClientProps {
  currentUserId: string;
}

export function ConversationTestClient({
  currentUserId,
}: ConversationTestClientProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"DIRECT" | "GROUP" | "CHANNEL">("DIRECT");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [participantIds, setParticipantIds] = useState("");
  const [result, setResult] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setResult(null);
    try {
      const participantIdArray = participantIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      console.log("Creating conversation with:", {
        type,
        name: name || undefined,
        description: description || undefined,
        participantIds: participantIdArray,
      });

      const response = await createConversation({
        type,
        name: name || undefined,
        description: description || undefined,
        participantIds: participantIdArray,
      });

      console.log("Conversation creation response:", response);
      setResult(response);

      if (response.success) {
        // Clear form on success
        setName("");
        setDescription("");
        setParticipantIds("");
        // Refresh conversations list
        await loadConversations();
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await getUserConversationsAction();
      if (response.success) {
        setConversations(response.data);
      } else {
        console.error("Failed to load conversations:", response.error);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await getAvailableUsers();
      setAvailableUsers(users);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "DIRECT":
        return <MessageCircle className="h-4 w-4" />;
      case "GROUP":
        return <Users className="h-4 w-4" />;
      case "CHANNEL":
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current User</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">{currentUserId}</Badge>
        </CardContent>
      </Card>

      {/* Available Users */}
      <Card>
        <CardHeader>
          <CardTitle>Available Users</CardTitle>
          <CardDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              disabled={loadingUsers}
            >
              {loadingUsers && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Load Users
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableUsers.length === 0 ? (
            <p className="text-muted-foreground">
              Click "Load Users" to see available users
            </p>
          ) : (
            <div className="space-y-2">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {user.name || user.email || "Unknown"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">
                      {user.id}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const currentIds = participantIds
                          .split(",")
                          .map((id) => id.trim())
                          .filter(Boolean);
                        if (!currentIds.includes(user.id)) {
                          setParticipantIds(
                            currentIds.length > 0
                              ? currentIds.join(",") + "," + user.id
                              : user.id
                          );
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Conversation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getIcon()}
            Create Conversation
          </CardTitle>
          <CardDescription>
            Test conversation creation with different types and participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="type">Conversation Type</Label>
              <Select
                value={type}
                onValueChange={(value: any) => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select conversation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DIRECT">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Direct Message
                    </div>
                  </SelectItem>
                  <SelectItem value="GROUP">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Group Chat
                    </div>
                  </SelectItem>
                  <SelectItem value="CHANNEL">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Channel
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type !== "DIRECT" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter conversation name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="participants">
                Participant IDs
                <span className="text-xs text-muted-foreground ml-1">
                  (comma-separated user IDs)
                </span>
              </Label>
              <Input
                id="participants"
                value={participantIds}
                onChange={(e) => setParticipantIds(e.target.value)}
                placeholder={`${currentUserId},other-user-id`}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your user ID ({currentUserId}) will be automatically included
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Conversation
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
              Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Load Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Your Conversations</CardTitle>
          <CardDescription>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              disabled={loadingConversations}
            >
              {loadingConversations && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Load Conversations
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <p className="text-muted-foreground">No conversations found</p>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {conv.type === "DIRECT" && (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      {conv.type === "GROUP" && <Users className="h-4 w-4" />}
                      {conv.type === "CHANNEL" && <Hash className="h-4 w-4" />}
                      <span className="font-medium">
                        {conv.name || `${conv.type} Conversation`}
                      </span>
                    </div>
                    <Badge variant="secondary">{conv.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    ID: {conv.id}
                  </p>
                  <p className="text-sm">
                    Participants: {conv.participants.length}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-sm text-muted-foreground">
                      Last: {conv.lastMessage.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
