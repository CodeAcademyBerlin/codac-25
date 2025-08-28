'use client';

import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { AIKit } from '@/components/ai-kit';
import { AutoformatKit } from '@/components/autoformat-kit';
import { BasicNodesKit } from '@/components/basic-nodes-kit';
import { CopilotKit } from '@/components/copilot-kit';
import { CursorOverlayKit } from '@/components/cursor-overlay-kit';
import { FixedToolbarKit } from '@/components/fixed-toolbar-kit';
import { FloatingToolbarKit } from '@/components/floating-toolbar-kit';
import { ListKit } from '@/components/list-kit';
import { MediaKit } from '@/components/media-kit';
import { TableKit } from '@/components/table-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';

const plugins = [
    ...BasicNodesKit,
    ...ListKit,
    ...MediaKit,
    ...TableKit,
    ...AutoformatKit,
    ...CursorOverlayKit,
    ...CopilotKit,
    ...AIKit,

    // Playground template toolbars
    ...FixedToolbarKit,
    ...FloatingToolbarKit,
];

export function SimplePlateEditor({
    initialValue,
    readOnly = false,
    placeholder = "Start writing...",
    children,
}: {
    initialValue?: Value;
    readOnly?: boolean;
    placeholder?: string;
    children?: React.ReactNode;
}) {
    const editor = usePlateEditor({
        plugins,
        value: initialValue || defaultValue,
    });

    return (
        <div className="w-full max-w-full overflow-hidden">
            <Plate editor={editor} readOnly={readOnly}>
                {children}
                <EditorContainer className="max-w-full">
                    <Editor variant="default" placeholder={placeholder} className="max-w-full" />
                </EditorContainer>
            </Plate>
        </div>
    );
}

const defaultValue: Value = [
    {
        children: [{ text: 'Welcome to Plate!' }],
        type: 'h1',
    },
    {
        children: [
            { text: 'This is a simplified editor using out-of-the-box Plate registry components.' },
        ],
        type: 'p',
    },
];
