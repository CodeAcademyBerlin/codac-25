'use client';

import { Save } from 'lucide-react';
import { type Value } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { updateDoc } from '@/actions/doc/update-doc';
import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/components/ui/editor';

import { EditorKit } from './editor-kit';


interface SimpleAutoSaveEditorProps {
    documentId: string;
    initialValue?: Value;
    children?: React.ReactNode;
}

// Helper function to ensure content is in correct Plate.js format
function normalizeContent(content: Value): Value {
    // If content is already a valid Plate.js Value (array of elements)
    if (Array.isArray(content)) {
        return content;
    }

    // If content is null/undefined, return default
    if (!content) {
        return [{ type: 'p', children: [{ text: '' }] }];
    }

    // If content is in a different format (like the rich_text format), convert it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((content as any)?.type === 'rich_text' && (content as any)?.blocks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (content as any).blocks.map((block: any) => {
            if (block.type === 'heading') {
                return {
                    type: `h${block.level || 1}`,
                    children: [{ text: block.content || '' }]
                };
            }
            if (block.type === 'paragraph') {
                return {
                    type: 'p',
                    children: [{ text: block.content || '' }]
                };
            }
            if (block.type === 'list') {
                return {
                    type: 'ul',
                    children: block.items.map((item: { content: string }) => ({
                        type: 'li',
                        children: [{ text: item.content || '' }]
                    }))
                };
            }
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
        const normalized = normalizeContent(initialValue || []);
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

    return (<>

        {/* <div className="flex flex-col h-full overflow-hidden">
            Status bar with improved accessibility */}
        {/* <div className="flex-shrink-0 flex items-center flex-wrap justify-between px-3 py-2 border-b bg-muted/30" role="toolbar" aria-label="Document controls">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground" aria-live="polite">
                        Auto-save enabled
                    </span>
                    <span className="sr-only">
                        Document changes are automatically saved every 10 seconds
                    </span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSave}
                    aria-label="Save document now"
                    className="h-8"
                >
                    <Save className="h-4 w-4 mr-1" aria-hidden="true" />
                    Save
                </Button>
            </div> */}

        {/* Editor with proper overflow handling */}

        <Plate
            editor={editor}
            onChange={handleEditorChange}
        >
            {children}
            <EditorContainer variant="responsive" >
                <Editor
                    variant="responsive"
                    aria-label="Document content"
                    role="textbox"
                    aria-multiline="true"
                    aria-describedby="editor-help"
                />
                <div id="editor-help" className="sr-only">
                    Rich text editor. Use toolbar buttons or keyboard shortcuts to format text.
                    Changes are automatically saved.
                </div>
            </EditorContainer>
        </Plate>
        {/* </div> */}
    </>

    );
} 