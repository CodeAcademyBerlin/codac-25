"use client"
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Save } from "lucide-react";
import { Value } from "platejs";
import { PlateController, useEditorRef, useEditorSelector } from "platejs/react";
import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { updateDoc } from "@/actions/doc/update-doc";
import { updateLessonContent } from "@/actions/lms/update-lesson";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useHasActiveUploads } from "@/hooks/use-upload-file";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

import { PlateEditor } from "./plate-editor";

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

interface UnifiedEditorProps {
    initialValue: Value;
    contentId: string;
    contentType: 'document' | 'lesson';
    showStatusBar?: boolean;
    canEdit?: boolean;
    readOnly?: boolean;
    children?: React.ReactNode;
}

export const UnifiedEditor = React.memo(function UnifiedEditor({
    initialValue,
    contentId,
    contentType,
    showStatusBar = false,
    canEdit = false,
    readOnly,
    children
}: UnifiedEditorProps) {
    const isReadOnly = readOnly ?? !canEdit;

    return (
        <PlateController>
            <div className="h-full flex flex-col">
                <PlateEditor initialValue={initialValue} readOnly={isReadOnly}>
                    {children}
                    <UnifiedStateUpdater
                        contentId={contentId}
                        contentType={contentType}
                        showStatusBar={showStatusBar}
                        initialValue={initialValue}
                        canEdit={canEdit}
                    />
                </PlateEditor>
            </div>
        </PlateController>
    );
});

const UnifiedStateUpdater = React.memo(function UnifiedStateUpdater({
    contentId,
    contentType,
    showStatusBar = false,
    initialValue,
    canEdit = false
}: {
    contentId: string;
    contentType: 'document' | 'lesson';
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
            } else {
                result = await updateDoc({ id: contentId, content: content });
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
                throw new Error(result.error || `Failed to save ${contentType}`);
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