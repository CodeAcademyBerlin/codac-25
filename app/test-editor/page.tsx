'use client';

import { SimplePlateEditor } from '@/components/editor/simple-plate-editor';

export default function TestEditorPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Plate Editor with Playground Template Toolbar</h1>
            <div className="text-sm text-muted-foreground mb-4">
                <p>✨ Features now included from the Plate playground template:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Fixed Toolbar:</strong> Persistent toolbar at the top with formatting options</li>
                    <li><strong>Floating Toolbar:</strong> Context-sensitive toolbar on text selection</li>
                    <li><strong>AI Integration:</strong> AI-powered writing assistance and completion</li>
                    <li><strong>Rich Formatting:</strong> Full text formatting, lists, tables, media support</li>
                </ul>
            </div>
            <div className="border rounded-lg min-h-[600px] bg-background">
                <SimplePlateEditor
                    placeholder="Start typing to test the playground template editor with toolbars..."
                />
            </div>
        </div>
    );
}
