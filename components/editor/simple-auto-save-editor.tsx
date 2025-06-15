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

// Helper function to ensure content is in correct Plate.js format
function normalizeContent(content: any): Value {
    // If content is already a valid Plate.js Value (array of elements)
    if (Array.isArray(content)) {
        return content;
    }

    // If content is null/undefined, return default
    if (!content) {
        return [{ type: 'p', children: [{ text: '' }] }];
    }

    // If content is in a different format (like the rich_text format), convert it
    if (content?.type === 'rich_text' && content?.blocks) {
        return content.blocks.map((block: any) => {
            switch (block.type) {
                case 'heading':
                    return {
                        type: `h${block.level || 1}`,
                        children: [{ text: block.content || '' }]
                    };
                case 'paragraph':
                    return {
                        type: 'p',
                        children: [{ text: block.content || '' }]
                    };
                default:
                    return {
                        type: 'p',
                        children: [{ text: block.content || '' }]
                    };
            }
        });
    }

    // Fallback for any other format
    console.warn('Unknown content format, using fallback:', content);
    return [{ type: 'p', children: [{ text: JSON.stringify(content) }] }];
}

export function SimpleAutoSaveEditor({
    documentId,
    initialValue,
    children,
}: SimpleAutoSaveEditorProps) {
    // Editor value state - normalize the initial content
    const [editorValue, setEditorValue] = React.useState<Value>(() => {
        const normalized = normalizeContent(initialValue);
        console.log('Normalizing initial content:', { initialValue, normalized });
        return normalized;
    });

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
        }, 10000);
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
            <div className="flex items-center justify-between p-2 border-b">
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