#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import matter from 'gray-matter';

import { MarkdownPlugin } from '@platejs/markdown';
import { createPlateEditor } from 'platejs/react';

// Server-side PlateJS editor for markdown conversion
const serverEditor = createPlateEditor({
    plugins: [
        MarkdownPlugin.configure({
            options: {
                remarkPlugins: [],
            },
        }),
    ],
});

async function testMarkdownConversion() {
    try {
        // Test with a sample markdown file
        const sampleFile = path.join(process.cwd(), 'content/welcome.md');
        const content = await fs.readFile(sampleFile, 'utf-8');
        const { data, content: markdownContent } = matter(content);

        console.log('📄 Testing markdown conversion...');
        console.log('🔍 Frontmatter:', JSON.stringify(data, null, 2));
        console.log('📝 Markdown content (first 200 chars):', markdownContent.substring(0, 200) + '...');

        // Convert to PlateJS format
        const api = serverEditor.getApi(MarkdownPlugin);
        const plateContent = api.markdown.deserialize(markdownContent);

        console.log('✅ Conversion successful!');
        console.log('🎯 PlateJS content (first element):', JSON.stringify(plateContent?.[0], null, 2));

        // Test conversion back to markdown
        const markdownAgain = api.markdown.serialize(plateContent);
        console.log('🔄 Round-trip test successful!');
        console.log('📝 Converted back to markdown (first 200 chars):', markdownAgain.substring(0, 200) + '...');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

if (require.main === module) {
    testMarkdownConversion();
}

export { testMarkdownConversion }; 