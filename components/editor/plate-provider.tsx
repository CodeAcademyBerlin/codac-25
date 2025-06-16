"use client"
import { Value } from "platejs";
import { PlateController, useEditorRef, useEditorSelector, useEditorState } from "platejs/react";

import { logger } from "@/lib/logger";

import { PlateEditor } from "./plate-editor";

export function PlateProvider({ children }: { children: React.ReactNode }) {
    return (
        <PlateController>
            {children}
        </PlateController>
    )
}

export const PlateRefEditor = ({ docId: _docId, initialValue }: { docId: string, initialValue: Value }) => {
    return (
        <PlateController>
            <PlateEditor initialValue={initialValue} >
                <PlateStateUpdater />
            </PlateEditor>
        </PlateController>
    )
}

const PlateStateUpdater = () => {
    const _editor = useEditorRef();
    const hasSelection = useEditorSelector((editor) => !!editor?.selection, []);
    const editorState = useEditorState();

    // Log editor state changes in development
    logger.debug('Editor state updated', {
        action: 'state_update',
        resource: 'plate_editor',
        metadata: {
            hasSelection,
            editorStateKeys: Object.keys(editorState || {})
        }
    });

    return (
        <div>
            <h1>Plate State Updater</h1>
        </div>
    )
}