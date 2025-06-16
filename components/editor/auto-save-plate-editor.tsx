'use client';

import { AlertCircle, CheckCircle2, Cloud, Save, CloudOff } from 'lucide-react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { updateDoc } from '@/actions/doc/update-doc';
import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { useAutoSave, type AutoSaveStatus } from '@/hooks/use-auto-save';
import { cn } from '@/lib/utils';

import { EditorKit } from './editor-kit';

interface AutoSavePlateEditorProps {
    documentId: string;
    initialValue?: Value;
    children?: React.ReactNode;
}

function AutoSaveStatus({ status }: { status: AutoSaveStatus }) {
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

function DraftRecoveryDialog({
    onRestore,
    onDiscard,
    timestamp
}: {
    onRestore: () => void;
    onDiscard: () => void;
    timestamp: Date;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-2">Unsaved Changes Found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    We found unsaved changes from {timestamp.toLocaleString()}.
                    Would you like to restore them?
                </p>
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={onDiscard}>
                        Discard
                    </Button>
                    <Button onClick={onRestore}>
                        Restore Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function AutoSavePlateEditor({
    documentId,
    initialValue,
    children,
}: AutoSavePlateEditorProps) {
    const [showDraftDialog, setShowDraftDialog] = React.useState(false);
    const [draftInfo, setDraftInfo] = React.useState<{
        hasLocalDraft: boolean;
        timestamp?: Date;
    }>({ hasLocalDraft: false });

    // Editor value state
    const [editorValue, setEditorValue] = React.useState<Value>(
        initialValue ?? [{ type: 'p', children: [{ text: '' }] }]
    );

    // Auto-save hook
    const {
        updateContent,
        save,
        status,
        checkForLocalDraft,
        restoreFromLocalDraft,
        discardLocalDraft,
    } = useAutoSave({
        documentId,
        onSave: async (content: Value) => {
            try {
                const result = await updateDoc({
                    id: documentId,
                    content,
                });

                if (result.success) {
                    return { success: true };
                } else {
                    return {
                        success: false,
                        error: Array.isArray(result.error)
                            ? result.error.map(e => e.message).join(', ')
                            : result.error
                    };
                }
            } catch (error) {
                console.error('Save error:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        },
        debounceMs: 1000,      // Save to localStorage after 1 second
        autoSaveIntervalMs: 30000, // Sync to database every 30 seconds
    });

    // Create editor
    const editor = usePlateEditor({
        plugins: EditorKit,
        value: editorValue,
    });

    // Check for local draft on mount
    React.useEffect(() => {
        const draft = checkForLocalDraft();
        setDraftInfo(draft);

        if (draft.hasLocalDraft && draft.timestamp) {
            setShowDraftDialog(true);
        }
    }, [checkForLocalDraft]);

    // Handle editor value changes
    const handleEditorChange = React.useCallback(({ value }: { value: Value }) => {
        setEditorValue(value);
        updateContent(value);
    }, [updateContent]);

    // Show error toasts
    React.useEffect(() => {
        if (status.status === 'error') {
            toast.error(`Failed to save: ${status.error}`);
        } else if (status.status === 'saved' && status.lastSaved) {
            // Optionally show success toast
            // toast.success('Document saved');
        }
    }, [status.status, status.error, status.lastSaved]);

    const handleRestoreDraft = () => {
        const draftData = checkForLocalDraft();
        if (draftData.hasLocalDraft && draftData.draft) {
            setEditorValue(draftData.draft);
            updateContent(draftData.draft);
        }
        restoreFromLocalDraft();
        setShowDraftDialog(false);
        toast.success('Draft restored');
    };

    const handleDiscardDraft = () => {
        discardLocalDraft();
        setShowDraftDialog(false);
        toast.info('Draft discarded');
    };

    const handleManualSave = async () => {
        await save();
        toast.success('Document saved manually');
    };

    return (
        <>
            {showDraftDialog && draftInfo.timestamp && (
                <DraftRecoveryDialog
                    onRestore={handleRestoreDraft}
                    onDiscard={handleDiscardDraft}
                    timestamp={draftInfo.timestamp}
                />
            )}

            <div className="w-full h-full flex flex-col">
                {/* Status bar */}
                <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-900">
                    <AutoSaveStatus status={status} />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualSave}
                            disabled={status.status === 'saving'}
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
        </>
    );
} 