"use client"
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Save } from "lucide-react";
import { Value } from "platejs";
import { PlateController, useEditorRef, useEditorSelector } from "platejs/react";
import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

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

// Context for save functionality
interface SaveContextValue {
    triggerSave: () => Promise<void>;
    saveStatus: SaveStatus;
}

const SaveContext = createContext<SaveContextValue | null>(null);

export const useSave = () => {
    const context = useContext(SaveContext);
    if (!context) {
        // Provide a fallback when context is not available
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

function SaveStatusIndicator({ status, onManualSave }: {
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
                Save
            </Button>
        </div>
    );
}

export function PlateProvider({ children }: { children: React.ReactNode }) {
    return (
        <PlateController>
            {children}
        </PlateController>
    )
}

export const PlateLessonEditor = ({ lessonId, initialValue, showStatusBar = false, canEdit = false }: {
    lessonId: string;
    initialValue: Value;
    showStatusBar?: boolean;
    canEdit?: boolean;
}) => {
    return (
        <PlateController>
            <div className="h-full flex flex-col">
                <PlateEditor initialValue={initialValue} readOnly={!canEdit}>
                    <PlateStateUpdater lessonId={lessonId} showStatusBar={showStatusBar} initialValue={initialValue} canEdit={canEdit} />
                </PlateEditor>
            </div>
        </PlateController>
    )
}

const PlateStateUpdater = ({ lessonId, showStatusBar = false, initialValue, canEdit = false }: {
    lessonId: string;
    showStatusBar?: boolean;
    initialValue?: Value;
    canEdit?: boolean;
}) => {
    const editor = useEditorRef();
    const hasActiveUploads = useHasActiveUploads();

    // Track only the editor content (children), not the entire state
    const editorContent = useEditorSelector((editor) => editor?.children, []);

    // Save status state
    const [saveStatus, setSaveStatus] = useState<SaveStatus>({
        status: 'idle',
        hasUnsavedChanges: false,
    });

    // Debounce only the content changes, not all editor state changes
    const debouncedContent = useDebounce(editorContent, 5000);

    // Keep track of save status
    const isSavingRef = useRef(false);
    const lastSavedContentRef = useRef<Value | null>(initialValue || null);
    const hasInitializedRef = useRef(false);

    // Save to database function
    const saveToDatabase = useCallback(async (content: Value, isManual = false) => {
        if (!canEdit || isSavingRef.current || !content || !editor?.children) {
            return;
        }

        // Prevent autosave when uploads are in progress (but allow manual saves)
        if (!isManual && hasActiveUploads) {
            logger.debug('Skipping autosave due to active uploads', {
                action: 'autosave_skipped',
                resource: 'lesson',
                resourceId: lessonId,
                metadata: { hasActiveUploads }
            });
            return;
        }

        // Check if content has actually changed (skip for manual saves)
        if (!isManual && JSON.stringify(content) === JSON.stringify(lastSavedContentRef.current)) {
            return;
        }

        isSavingRef.current = true;
        setSaveStatus(prev => ({ ...prev, status: 'saving' }));

        try {
            const result = await updateLessonContent(lessonId, content);

            if (result.success) {
                lastSavedContentRef.current = content;
                setSaveStatus({
                    status: 'saved',
                    lastSaved: new Date(),
                    hasUnsavedChanges: false,
                });

                logger.info('Lesson auto-saved successfully', {
                    action: 'lesson_autosave',
                    resource: 'lesson',
                    resourceId: lessonId,
                    metadata: { isManual, contentLength: JSON.stringify(content).length }
                });
            } else {
                throw new Error(result.error || 'Failed to save lesson');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setSaveStatus({
                status: 'error',
                error: errorMessage,
                hasUnsavedChanges: true,
            });

            logger.error('Lesson auto-save failed', error instanceof Error ? error : new Error(String(error)), {
                action: 'lesson_autosave',
                resource: 'lesson',
                resourceId: lessonId,
                metadata: { isManual }
            });
        } finally {
            isSavingRef.current = false;
        }
    }, [lessonId, canEdit, editor, hasActiveUploads]);

    // Manual save function
    const triggerManualSave = useCallback(async () => {
        if (editor?.children) {
            await saveToDatabase(editor.children, true);
        }
    }, [editor, saveToDatabase]);

    // Auto-save effect
    useEffect(() => {
        if (!canEdit || !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            return;
        }

        if (debouncedContent) {
            saveToDatabase(debouncedContent, false);
        }
    }, [debouncedContent, saveToDatabase, canEdit]);

    // Track unsaved changes
    useEffect(() => {
        if (!canEdit || !editorContent) return;

        const hasChanges = JSON.stringify(editorContent) !== JSON.stringify(lastSavedContentRef.current);
        setSaveStatus(prev => ({
            ...prev,
            hasUnsavedChanges: hasChanges && prev.status !== 'saving'
        }));
    }, [editorContent, canEdit]);

    const saveContextValue: SaveContextValue = {
        triggerSave: triggerManualSave,
        saveStatus,
    };

    return (
        <SaveContext.Provider value={saveContextValue}>
            {showStatusBar && canEdit && (
                <SaveStatusIndicator status={saveStatus} onManualSave={triggerManualSave} />
            )}
        </SaveContext.Provider>
    );
}; 