"use client"
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Save } from "lucide-react";
import { Value } from "platejs";
import { Plate, usePlateEditor, useEditorRef, useEditorSelector } from "platejs/react";
import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

// updateDoc import removed
import { updateLessonContent } from "@/actions/lms/update-lesson";
import { updateProjectSummary } from "@/actions/projects/update-project-summary";
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
import { Button } from "@/components/ui/button";
import { Editor, EditorContainer } from '@/components/ui/editor';
import { useDebounce } from "@/hooks/use-debounce";
import { useHasActiveUploads } from "@/hooks/use-upload-file";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface SaveStatus {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
    hasUnsavedChanges: boolean;
}

interface SaveContextValue {
    triggerSave: () => Promise<void>;
    saveStatus: SaveStatus;
}

const SaveContext = createContext<SaveContextValue | null>(null);

export const useSave = () => {
    const context = useContext(SaveContext);
    if (!context) {
        return {
            triggerSave: async () => {
                console.warn('Save context not available - save operation skipped');
            },
            saveStatus: {
                status: 'idle' as const,
                hasUnsavedChanges: false,
            }
        };
    }
    return context;
};

const SaveStatusIndicator = React.memo(function SaveStatusIndicator({
    status,
    onManualSave
}: {
    status: SaveStatus;
    onManualSave: () => void;
}) {
    const getStatusIcon = () => {
        switch (status.status) {
            case 'saving':
                return <Cloud className="h-4 w-4 animate-pulse text-blue-500" />;
            case 'saved':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return status.hasUnsavedChanges ? (
                    <CloudOff className="h-4 w-4 text-yellow-500" />
                ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                );
        }
    };

    const getStatusText = () => {
        switch (status.status) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return status.lastSaved
                    ? `Saved ${status.lastSaved.toLocaleTimeString()}`
                    : 'Saved';
            case 'error':
                return `Error: ${status.error}`;
            default:
                return status.hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved';
        }
    };

    return (
        <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className={cn(
                "flex items-center gap-2 text-sm",
                status.status === 'error' && "text-red-500",
                status.status === 'saved' && "text-green-500",
                status.hasUnsavedChanges && status.status === 'idle' && "text-yellow-600"
            )}>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={onManualSave}
                disabled={status.status === 'saving'}
            >
                <Save className="h-4 w-4 mr-1" />
                Save Now
            </Button>
        </div>
    );
});

// Registry-based plugin configuration with playground template toolbars
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

interface SimplifiedUnifiedEditorProps {
    initialValue: Value;
    contentId: string;
    contentType: 'lesson' | 'project';
    showStatusBar?: boolean;
    canEdit?: boolean;
    readOnly?: boolean;
    children?: React.ReactNode;
    editorClassName?: string;
}

export const SimplifiedUnifiedEditor = React.memo(function SimplifiedUnifiedEditor({
    initialValue,
    contentId,
    contentType,
    showStatusBar = false,
    canEdit = false,
    readOnly,
    children,
    editorClassName
}: SimplifiedUnifiedEditorProps) {
    const isReadOnly = readOnly ?? !canEdit;

    const editor = usePlateEditor({
        plugins,
        value: initialValue,
    });

    return (
        <div className="h-full flex flex-col">
            <Plate editor={editor} readOnly={isReadOnly}>
                {children}
                <EditorContainer className="max-w-full">
                    <Editor
                        variant="default"
                        className={editorClassName || "max-w-full"}
                    />
                </EditorContainer>
                <SimplifiedStateUpdater
                    contentId={contentId}
                    contentType={contentType}
                    showStatusBar={showStatusBar}
                    initialValue={initialValue}
                    canEdit={canEdit}
                />
            </Plate>
        </div>
    );
});

const SimplifiedStateUpdater = React.memo(function SimplifiedStateUpdater({
    contentId,
    contentType,
    showStatusBar = false,
    initialValue,
    canEdit = false
}: {
    contentId: string;
    contentType: 'lesson' | 'project';
    showStatusBar?: boolean;
    initialValue?: Value;
    canEdit?: boolean;
}) {
    const editor = useEditorRef();
    const hasActiveUploads = useHasActiveUploads();

    const editorContent = useEditorSelector((editor) => editor?.children, []);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        status: 'idle',
        hasUnsavedChanges: false,
    });

    const debouncedContent = useDebounce(editorContent, 5000);

    const isSavingRef = useRef(false);
    const lastSavedContentRef = useRef<Value | null>(initialValue || null);
    const hasInitializedRef = useRef(false);

    const saveToDatabase = useCallback(async (content: Value, isManual = false) => {
        if (!canEdit || isSavingRef.current || !content || !editor?.children) {
            return;
        }

        if (!isManual && hasActiveUploads) {
            logger.debug('Skipping autosave due to active uploads', {
                action: 'autosave_skipped',
                resource: contentType,
                resourceId: contentId,
                metadata: { hasActiveUploads }
            });
            return;
        }

        if (!isManual && JSON.stringify(content) === JSON.stringify(lastSavedContentRef.current)) {
            return;
        }

        isSavingRef.current = true;
        setSaveStatus(prev => ({ ...prev, status: 'saving' }));

        try {
            let result;
            if (contentType === 'lesson') {
                result = await updateLessonContent(contentId, content);
            } else if (contentType === 'project') {
                result = await updateProjectSummary(contentId, content);
            } else {
                throw new Error(`Unsupported content type: ${contentType}`);
            }

            if (result.success) {
                lastSavedContentRef.current = content;
                setSaveStatus({
                    status: 'saved',
                    lastSaved: new Date(),
                    hasUnsavedChanges: false,
                });

                logger.info(`${contentType} auto-saved successfully`, {
                    action: `${contentType}_autosave`,
                    resource: contentType,
                    resourceId: contentId,
                    metadata: { isManual, contentLength: JSON.stringify(content).length }
                });
            } else {
                const errorMessage = typeof result.error === 'string'
                    ? result.error
                    : Array.isArray(result.error)
                        ? result.error.map(e => e.message).join(', ')
                        : `Failed to save ${contentType}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setSaveStatus({
                status: 'error',
                error: errorMessage,
                hasUnsavedChanges: true,
            });

            logger.error(`${contentType} auto-save failed`, error instanceof Error ? error : new Error(String(error)), {
                action: `${contentType}_autosave`,
                resource: contentType,
                resourceId: contentId,
                metadata: { isManual }
            });
        } finally {
            isSavingRef.current = false;
        }
    }, [contentId, contentType, canEdit, editor, hasActiveUploads]);

    const triggerManualSave = useCallback(async () => {
        if (editor?.children) {
            await saveToDatabase(editor.children, true);
        }
    }, [editor, saveToDatabase]);

    useEffect(() => {
        if (!canEdit || !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            return;
        }

        if (debouncedContent) {
            saveToDatabase(debouncedContent, false);
        }
    }, [debouncedContent, saveToDatabase, canEdit]);

    useEffect(() => {
        if (!canEdit || !editorContent) return;

        const hasChanges = JSON.stringify(editorContent) !== JSON.stringify(lastSavedContentRef.current);
        setSaveStatus(prev => ({
            ...prev,
            hasUnsavedChanges: hasChanges && prev.status !== 'saving'
        }));
    }, [editorContent, canEdit]);

    const saveContextValue: SaveContextValue = useMemo(() => ({
        triggerSave: triggerManualSave,
        saveStatus,
    }), [triggerManualSave, saveStatus]);

    return (
        <SaveContext.Provider value={saveContextValue}>
            {showStatusBar && canEdit && (
                <SaveStatusIndicator status={saveStatus} onManualSave={triggerManualSave} />
            )}
        </SaveContext.Provider>
    );
});

// Export the save context for use in toolbars
export { SaveContext };
