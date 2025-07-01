'use client';

import { createPlatePlugin, useEditorReadOnly } from 'platejs/react';

import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

function ConditionalFixedToolbar() {
    const readOnly = useEditorReadOnly();

    // Only show fixed toolbar when in edit mode (not read-only)
    if (readOnly) return null;

    return (
        <FixedToolbar>
            <FixedToolbarButtons />
        </FixedToolbar>
    );
}

export const ConditionalFixedToolbarKit = [
    createPlatePlugin({
        key: 'conditional-fixed-toolbar',
        render: {
            beforeEditable: () => <ConditionalFixedToolbar />,
        },
    }),
]; 