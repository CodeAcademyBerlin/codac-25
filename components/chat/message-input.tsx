"use client";

import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending || disabled) return;

    setSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + "px";
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 mb-2"
          disabled={disabled}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || sending}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none pr-12",
              "focus-visible:ring-1 focus-visible:ring-ring"
            )}
            rows={1}
          />

          {/* Emoji Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 bottom-2 h-6 w-6 p-0"
            disabled={disabled}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || sending || !message.trim()}
          size="sm"
          className="flex-shrink-0 mb-2"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}
