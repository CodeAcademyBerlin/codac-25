'use client';

import * as React from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { toast } from 'sonner';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { EditorKit } from './editor-kit';
import { useDebounce } from '@/hooks/use-debounce';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { updateDoc } from '@/actions/doc/update-doc';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Cloud, Save, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface AutoSavePlateEditorProps {
    documentId: string;
    initialValue?: Value;
    children?: React.ReactNode;
}

interface SaveStatus {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: Date;
    error?: string;
    hasUnsavedChanges: boolean;
}

function AutoSaveStatus({ status }: { status: SaveStatus }) {
    const getStatusIcon = () => {
        switch (status.status) {
            case 'saving':
                return <Cloud className="h-4 w-4 animate-pulse" />;
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
        <div className={cn(
            "flex items-center gap-2 text-sm",
            status.status === 'error' && "text-red-500",
            status.status === 'saved' && "text-green-500",
            status.hasUnsavedChanges && status.status === 'idle' && "text-yellow-600"
        )}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
        </div>
    );
}

export function AutoSavePlateEditor({
    documentId,
    initialValue,
    children,
}: AutoSavePlateEditorProps) {
    // Editor value state
    const [editorValue, setEditorValue] = React.useState<Value>(
        initialValue ?? [{ type: 'p', children: [{ text: '' }] }]
    );

    // Save status
    const [saveStatus, setSaveStatus] = React.useState<SaveStatus>({
        status: 'idle',
        hasUnsavedChanges: false,
    });

    // Local storage for drafts
    const [localDraft, setLocalDraft, removeLocalDraft] = useLocalStorage<{
        content: Value;
        timestamp: number;
        documentId: string;
    } | null>(`doc_draft_${documentId}`, null);

    // Debounced value for localStorage
    const debouncedValue = useDebounce(editorValue, 1000);

    // Refs for cleanup
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Create editor
    const editor = usePlateEditor({
        plugins: EditorKit,
        value: editorValue,
    });

    // Track if we've initialized to avoid loops
    const hasInitialized = useRef(false);

    // Save to localStorage when debounced value changes
    React.useEffect(() => {
        if (!hasInitialized.current) return;

        if (debouncedValue) {
            setLocalDraft({
                content: debouncedValue,
                timestamp: Date.now(),
                documentId,
            });

            setSaveStatus(prev => ({
                ...prev,
                hasUnsavedChanges: true,
            }));
        }
    }, [debouncedValue, documentId, setLocalDraft]);

    // Save to database function
    const saveToDatabase = React.useCallback(async (content: Value) => {
        setSaveStatus(prev => ({ ...prev, status: 'saving' }));

        try {
            const result = await updateDoc({
                id: documentId,
                content,
                title: 'Untitled', // Provide a default title
            });

            if (result.success) {
                removeLocalDraft();
                setSaveStatus({
                    status: 'saved',
                    lastSaved: new Date(),
                    hasUnsavedChanges: false,
                });
            } else {
                const errorMessage = Array.isArray(result.error)
                    ? result.error.map(e => e.message).join(', ')
                    : result.error;

                setSaveStatus(prev => ({
                    ...prev,
                    status: 'error',
                    error: errorMessage,
                }));
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus(prev => ({
                ...prev,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            }));
        }
    }, [documentId, removeLocalDraft]);

    // Handle editor changes
    const handleEditorChange = React.useCallback(({ value }: { value: Value }) => {
        setEditorValue(value);

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }

        // Set new timeout for database save
        saveTimeoutRef.current = setTimeout(() => {
            saveToDatabase(value);
        }, 2000);
    }, [saveToDatabase]);

    // Manual save
    const handleManualSave = React.useCallback(async () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = null;
        }
        await saveToDatabase(editorValue);
        toast.success('Document saved');
    }, [editorValue, saveToDatabase]);

    // Check for draft on mount (only once)
    React.useEffect(() => {
        if (!hasInitialized.current) {
            if (localDraft && localDraft.documentId === documentId) {
                const draftTime = new Date(localDraft.timestamp);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

                if (draftTime > oneHourAgo) {
                    const shouldRestore = confirm(
                        `Found unsaved changes from ${draftTime.toLocaleString()}. Restore them?`
                    );

                    if (shouldRestore) {
                        setEditorValue(localDraft.content);
                        setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
                        toast.success('Draft restored');
                    } else {
                        removeLocalDraft();
                    }
                }
            }
            hasInitialized.current = true;
        }
    }, [localDraft, documentId, removeLocalDraft]);

    // Auto-save interval
    React.useEffect(() => {
        autoSaveIntervalRef.current = setInterval(() => {
            if (saveStatus.hasUnsavedChanges) {
                saveToDatabase(editorValue);
            }
        }, 30000); // Every 30 seconds

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [saveStatus.hasUnsavedChanges, editorValue, saveToDatabase]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, []);

    // Show error toasts
    React.useEffect(() => {
        if (saveStatus.status === 'error') {
            toast.error(`Failed to save: ${saveStatus.error}`);
        }
    }, [saveStatus.status, saveStatus.error]);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-900">
                <AutoSaveStatus status={saveStatus} />
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManualSave}
                        disabled={saveStatus.status === 'saving'}
                    >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1">
                <Plate
                    editor={editor}
                    onChange={handleEditorChange}
                >
                    {children}
                    <EditorContainer>
                        <Editor variant="demo" />
                    </EditorContainer>
                </Plate>
            </div>
        </div>
    );
} 