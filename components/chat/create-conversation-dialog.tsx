"use client";

import { Plus, MessageCircle, Users, Hash } from "lucide-react";
import { useState } from "react";

import { createConversation } from "@/actions/chat/create-conversation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


interface CreateConversationDialogProps {
  onConversationCreated?: (conversationId: string) => void;
}

export function CreateConversationDialog({
  onConversationCreated,
}: CreateConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"DIRECT" | "GROUP" | "CHANNEL">("DIRECT");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [participantIds, setParticipantIds] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const participantIdArray = participantIds
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      const result = await createConversation({
        type,
        name: name || undefined,
        description: description || undefined,
        participantIds: participantIdArray,
      });

      if (result.success) {
        onConversationCreated?.(result.data.conversationId);
        setOpen(false);
        setName("");
        setDescription("");
        setParticipantIds("");
        setType("DIRECT");
      } else {
        console.error("Failed to create conversation:", result.error);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setLoading(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            Create New Conversation
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={(value: any) => setType(value)}>
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
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter conversation name"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Participant IDs
              <span className="text-xs text-muted-foreground ml-1">
                (comma-separated user IDs)
              </span>
            </label>
            <Input
              value={participantIds}
              onChange={(e) => setParticipantIds(e.target.value)}
              placeholder="user1,user2,user3"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Conversation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
