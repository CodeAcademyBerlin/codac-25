import { NextResponse } from 'next/server';
import { createSlateEditor } from 'platejs';
import { AutoformatPlugin } from '@platejs/autoformat';
import { BaseTextAlignPlugin } from '@platejs/basic-styles';
import {
    BaseBoldPlugin,
    BaseCodePlugin,
    BaseItalicPlugin,
    BaseBlockquotePlugin,
    BaseH1Plugin,
    BaseH2Plugin,
    BaseH3Plugin,
} from '@platejs/basic-nodes';
import { MarkdownPlugin, remarkMdx } from '@platejs/markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// Example initial value
const initialValue = [
    { type: 'h1', children: [{ text: 'Server-Generated Document' }] },
    {
        type: 'p',
        children: [{ text: 'This content was processed entirely on the server.' }],
    },
    { type: 'blockquote', children: [{ text: 'This is a quote.' }] },
    { type: 'p', children: [{ text: 'And this is bold.', bold: true }] },
];

/**
 * GET /api/generate-doc
 * Returns a markdown string and the raw Slate value of a server-generated document.
 */
export async function GET() {
    // Create the editor instance inside the request scope to avoid cross-request state sharing.
    const editor = createSlateEditor({
        plugins: [
            // Block plugins
            BaseH1Plugin,
            BaseH2Plugin,
            BaseH3Plugin,
            BaseBlockquotePlugin,
            BaseTextAlignPlugin,
            // ... add more element plugins as needed

            // Mark plugins
            BaseBoldPlugin,
            BaseItalicPlugin,
            BaseCodePlugin,
            // ... add more mark plugins

            // Functionality plugins
            AutoformatPlugin,
            MarkdownPlugin.configure({ // For serialization example
                options: {
                    remarkPlugins: [remarkMath, remarkGfm, remarkMdx],
                },
            }),
            // ... add other functional plugins
        ],
        value: initialValue, // Set initial content
    });
    // Serialize the content to markdown
    const markdown = editor.api.markdown.serialize();
    const plainText = editor.api.string([]);

    return NextResponse.json({ markdown, plainText, value: editor.children });
}
