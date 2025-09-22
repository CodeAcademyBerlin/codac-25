'use client';

import { createPlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/lib/plate/ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/lib/plate/ui/floating-toolbar-buttons';

export const FloatingToolbarKit = [
  createPlatePlugin({
    key: 'floating-toolbar',
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
