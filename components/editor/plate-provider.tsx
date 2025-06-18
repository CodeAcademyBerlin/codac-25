"use client"
import { AlertCircle, CheckCircle2, Cloud, CloudOff, Save } from "lucide-react";
import { Value } from "platejs";
import { PlateController, useEditorRef, useEditorSelector } from "platejs/react";
import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";

import { updateDoc } from "@/actions/doc/update-doc";
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

export const PlateRefEditor = ({ docId, initialValue, showStatusBar = false }: { 
    docId: string; 
    initialValue: Value; 
    showStatusBar?: boolean;
}) => {
    return (
        <PlateController>
            <div className="h-full flex flex-col">
                <PlateEditor initialValue={initialValue} >
                    <PlateStateUpdater docId={docId} showStatusBar={showStatusBar} initialValue={initialValue} />
                </PlateEditor>
            </div>
        </PlateController>
    )
}

export const PlateAutoSaveEditor = ({ docId, initialValue }: { 
    docId: string; 
    initialValue: Value; 
}) => {
    return (
        <PlateController>
            <div className="h-full w-full flex flex-col">
                <PlateEditor initialValue={initialValue} >
                    <PlateStateUpdater docId={docId} showStatusBar={true} initialValue={initialValue} />
                </PlateEditor>
            </div>
        </PlateController>
    )
}

const PlateStateUpdater = ({ docId, showStatusBar = false, initialValue }: { 
    docId: string; 
    showStatusBar?: boolean;
    initialValue?: Value;
}) => {
    const editor = useEditorRef();
    const hasSelection = useEditorSelector((editor) => !!editor?.selection, []);
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
        if (isSavingRef.current || !content || !editor?.children) {
            return;
        }

        // Prevent autosave when uploads are in progress (but allow manual saves)
        if (!isManual && hasActiveUploads) {
            logger.debug('Skipping autosave due to active uploads', {
                action: 'autosave_skipped',
                resource: 'document',
                resourceId: docId,
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
            const result = await updateDoc({
                id: docId,
                content: content,
            });

            if (result.success) {
                lastSavedContentRef.current = content;
                setSaveStatus({
                    status: 'saved',
                    lastSaved: new Date(),
                    hasUnsavedChanges: false,
                });
                
                logger.debug('Editor content saved to database', {
                    action: isManual ? 'manual_save' : 'auto_save',
                    resource: 'document',
                    resourceId: docId,
                    metadata: {
                        hasSelection,
                        contentLength: content?.length || 0
                    }
                });
            } else {
                setSaveStatus(prev => ({
                    ...prev,
                    status: 'error',
                    error: Array.isArray(result.error) 
                        ? result.error.map(e => (typeof e === 'object' && e.message) ? e.message : String(e)).join(', ')
                        : result.error?.toString() || 'Unknown error'
                }));
                
                logger.error('Failed to save editor content', new Error(result.error?.toString() || 'Unknown error'), {
                    action: isManual ? 'manual_save' : 'auto_save',
                    resource: 'document',
                    resourceId: docId
                });
            }
        } catch (error) {
            setSaveStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            }));
            
            logger.error('Error saving editor content', error instanceof Error ? error : new Error(String(error)), {
                action: isManual ? 'manual_save' : 'auto_save',
                resource: 'document',
                resourceId: docId
            });
        } finally {
            isSavingRef.current = false;
        }
    }, [docId, editor, hasSelection, hasActiveUploads]);

    // Manual save function
    const handleManualSave = useCallback(async () => {
        if (editorContent) {
            await saveToDatabase(editorContent as Value, true);
        }
    }, [editorContent, saveToDatabase]);

    // Initialize the saved content reference when editor first loads
    useEffect(() => {
        if (!hasInitializedRef.current && editorContent && initialValue) {
            lastSavedContentRef.current = initialValue;
            hasInitializedRef.current = true;
        }
    }, [editorContent, initialValue]);

    // Save when debounced content changes
    useEffect(() => {
        if (debouncedContent && debouncedContent.length > 0 && hasInitializedRef.current) {
            saveToDatabase(debouncedContent as Value);
        }
    }, [debouncedContent, saveToDatabase]);

    // Mark as having unsaved changes when content changes (but only after initialization)
    useEffect(() => {
        if (editorContent && hasInitializedRef.current && saveStatus.status !== 'saving') {
            // Only mark as unsaved if content actually differs from last saved
            const contentString = JSON.stringify(editorContent);
            const lastSavedString = JSON.stringify(lastSavedContentRef.current);
            
            if (contentString !== lastSavedString) {
                setSaveStatus(prev => ({
                    ...prev,
                    hasUnsavedChanges: true
                }));
            }
        }
    }, [editorContent, saveStatus.status]);

    // Log editor content changes in development
    logger.debug('Editor content updated', {
        action: 'content_update',
        resource: 'plate_editor',
        metadata: {
            hasSelection,
            contentLength: editorContent?.length || 0
        }
    });

    // Provide save context to child components
    const saveContextValue: SaveContextValue = {
        triggerSave: handleManualSave,
        saveStatus,
    };

    return (
        <SaveContext.Provider value={saveContextValue}>
            {showStatusBar ? (
                <SaveStatusIndicator 
                    status={saveStatus} 
                    onManualSave={handleManualSave}
                />
            ) : null}
        </SaveContext.Provider>
    );
}