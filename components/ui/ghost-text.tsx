'use client';

import { CopilotPlugin } from '@platejs/ai/react';
import { usePluginOption } from 'platejs/react';
import * as React from 'react';

export function GhostText() {
  const suggestionText = usePluginOption(CopilotPlugin, 'suggestionText');

  if (!suggestionText) return null;

  return (
    <span
      className="pointer-events-none text-muted-foreground/70 max-sm:hidden"
      contentEditable={false}
    >
      {suggestionText}
    </span>
  );
}
