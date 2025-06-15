'use client';

import * as React from 'react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import { toast } from 'sonner';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { EditorKit } from './editor-kit';
import { updateDoc } from '@/actions/doc/update-doc';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SimpleAutoSaveEditorProps {
    documentId: string;
    initialValue?: Value;
    children?: React.ReactNode;
}

export function SimpleAutoSaveEditor({
    documentId,
    initialValue,
    children,
}: SimpleAutoSaveEditorProps) {
    // Editor value state
    const [editorValue, setEditorValue] = React.useState<Value>(
        initialValue ?? [{ type: 'p', children: [{ text: '' }] }]
    );

    // Save timeout ref
    const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Create editor
    const editor = usePlateEditor({
        plugins: EditorKit,
        value: editorValue,
    });

    // Save to database function
    const saveToDatabase = React.useCallback(async (content: Value) => {
        try {
            console.log('Saving to database...', {
                documentId,
                documentIdType: typeof documentId,
                documentIdLength: documentId?.length,
                contentType: typeof content,
                content
            });

            if (!documentId) {
                console.error('No document ID provided');
                toast.error('Cannot save: Missing document ID');
                return;
            }

            const result = await updateDoc({
                id: documentId,
                content,
            });

            if (result.success) {
                console.log('Save successful');
                toast.success('Document saved');
            } else {
                console.error('Save failed - Full error:', result.error);
                const errorMessage = Array.isArray(result.error)
                    ? result.error.map(e => e.message || e).join(', ')
                    : result.error;
                console.error('Parsed error message:', errorMessage);
                toast.error(`Save failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Save failed');
        }
    }, [documentId]);

    // Handle editor changes
    const handleEditorChange = React.useCallback(({ value }: { value: Value }) => {
        console.log('Editor changed, new value:', value);
        setEditorValue(value);

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
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
        }
        await saveToDatabase(editorValue);
    }, [editorValue, saveToDatabase]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-900">
                <span className="text-sm text-gray-600">Auto-save enabled</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSave}
                >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                </Button>
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