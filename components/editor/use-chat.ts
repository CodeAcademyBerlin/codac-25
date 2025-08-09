'use client';

import { useChat as useBaseChat } from '@ai-sdk/react';
import { usePluginOption } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-kit';

export const useChat = () => {
  const options = usePluginOption(aiChatPlugin, 'chatOptions');

  const chat = useBaseChat({
    id: 'editor',
    api: '/api/ai/command',
    onError: (error) => {
      console.error('AI Chat error:', error);
      // Handle errors appropriately - could show toast notification
    },
    ...options,
  });

  return chat;
};
