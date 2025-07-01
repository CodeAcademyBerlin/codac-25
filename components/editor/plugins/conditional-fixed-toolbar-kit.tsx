'use client';

import { createPlatePlugin, useEditorReadOnly } from 'platejs/react';

import { useSave as useLessonSave } from '@/components/editor/plate-lesson-editor';
import { useSave as useDocSave } from '@/components/editor/plate-provider';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/ui/fixed-toolbar-buttons';

function ConditionalFixedToolbar() {
    const readOnly = useEditorReadOnly();

    // Try both save contexts - lesson editor and document editor
    const lessonSave = useLessonSave();
    const docSave = useDocSave();

    // Use the lesson save context if it has real functionality, otherwise use doc save
    const saveContext = lessonSave && typeof lessonSave.triggerSave === 'function' && lessonSave.saveStatus
        ? lessonSave
        : docSave;

    // Only show fixed toolbar when in edit mode (not read-only)
    if (readOnly) return null;

    return (
        <FixedToolbar>
            <FixedToolbarButtons
                onSave={saveContext.triggerSave}
                saveStatus={saveContext.saveStatus}
            />
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