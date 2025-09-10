"use client";

import { MessageCircle, Users, Hash, Plus, Settings } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { ConversationList } from "./conversation-list";
import { ConversationView } from "./conversation-view";

interface ChatLayoutProps {
  currentUserId: string;
}

export function ChatLayout({ currentUserId }: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "direct" | "group" | "channel"
  >("all");

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Conversations Sidebar */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={45}>
          <div className="flex flex-col h-full border-r">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Conversation Types Tabs */}
            <div className="flex items-center gap-1 p-2 border-b">
              <Button
                variant={activeTab === "all" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("all")}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">All</span>
              </Button>
              <Button
                variant={activeTab === "direct" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("direct")}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">Direct</span>
              </Button>
              <Button
                variant={activeTab === "group" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("group")}
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">Groups</span>
              </Button>
              <Button
                variant={activeTab === "channel" ? "default" : "ghost"}
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setActiveTab("channel")}
              >
                <Hash className="h-4 w-4" />
                <span className="text-sm">Channels</span>
              </Button>
            </div>

            {/* Conversations List */}
            <ConversationList
              currentUserId={currentUserId}
              selectedConversationId={selectedConversationId}
              onConversationSelect={handleConversationSelect}
              activeTab={activeTab}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Chat Area */}
        <ResizablePanel defaultSize={70}>
          <div className="flex flex-col h-full">
            {selectedConversationId ? (
              // Active conversation view
              <ConversationView
                conversationId={selectedConversationId}
                currentUserId={currentUserId}
              />
            ) : (
              // Empty state
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
