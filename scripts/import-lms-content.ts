#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import { MarkdownPlugin } from '@platejs/markdown';
import matter from 'gray-matter';
import { createPlateEditor } from 'platejs/react';

import { prisma } from '../lib/db';

// Server-side PlateJS editor for markdown conversion
const serverEditor = createPlateEditor({
    plugins: [
        MarkdownPlugin.configure({
            options: {
                // Add remark plugins for syntax extensions
                remarkPlugins: [],
            },
        }),
    ],
});

interface FrontMatter {
    navTitle?: string;
    title: string;
    metaTitle?: string;
    metaDescription?: string;
    access?: string;
    order?: number;
    prev?: string;
    next?: string;
}

interface FileNode {
    name: string;
    path: string;
    isDirectory: boolean;
    order?: number;
    children?: FileNode[];
}

async function readDirectory(dirPath: string): Promise<FileNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'assets') {
            continue; // Skip hidden files and assets folder for now
        }

        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            const children = await readDirectory(fullPath);
            nodes.push({
                name: entry.name,
                path: fullPath,
                isDirectory: true,
                children: children.length > 0 ? children : undefined,
            });
        } else if (entry.name.endsWith('.md')) {
            // Read frontmatter to get order
            try {
                const content = await fs.readFile(fullPath, 'utf-8');
                const { data } = matter(content);
                const frontmatter = data as FrontMatter;

                nodes.push({
                    name: entry.name,
                    path: fullPath,
                    isDirectory: false,
                    order: frontmatter.order,
                });
            } catch (error) {
                console.warn(`Failed to read frontmatter from ${fullPath}:`, error);
                nodes.push({
                    name: entry.name,
                    path: fullPath,
                    isDirectory: false,
                });
            }
        }
    }

    // Sort by order (if available) then by name
    return nodes.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
        }
        if (a.order !== undefined) return -1;
        if (b.order !== undefined) return 1;

        // Directories first, then files
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        return a.name.localeCompare(b.name);
    });
}

function markdownToPlateJS(markdown: string): any[] {
    try {
        const api = serverEditor.getApi(MarkdownPlugin);
        return api.markdown.deserialize(markdown) || [];
    } catch (error) {
        console.warn('Failed to convert markdown to PlateJS:', error);
        // Fallback: create a simple paragraph with the markdown content
        return [
            {
                type: 'p',
                children: [{ text: markdown }],
            },
        ];
    }
}

async function createDocumentFromMarkdown(
    filePath: string,
    parentId: string | null = null
): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: markdownContent } = matter(content);
    const frontmatter = data as FrontMatter;

    // Convert markdown to PlateJS format
    const plateContent = markdownToPlateJS(markdownContent);

    // Create the document
    const doc = await prisma.document.create({
        data: {
            title: frontmatter.title || path.basename(filePath, '.md'),
            content: plateContent,
            type: 'COURSE_MATERIAL',
            parentId,
            isFolder: false,
            isPublished: true,
            isArchived: false,
            authorId: 'lms-import',
        },
    });

    console.log(`✅ Created document: ${doc.title} (${doc.id})`);
    return doc.id;
}

async function createFolder(
    name: string,
    parentId: string | null = null
): Promise<string> {
    const folder = await prisma.document.create({
        data: {
            title: name,
            content: [], // Empty content for folders
            type: 'COURSE_MATERIAL',
            parentId,
            isFolder: true,
            isPublished: true,
            isArchived: false,
            authorId: 'lms-import',
        },
    });

    console.log(`📁 Created folder: ${folder.title} (${folder.id})`);
    return folder.id;
}

async function processNode(node: FileNode, parentId: string | null = null): Promise<void> {
    if (node.isDirectory) {
        // Create folder
        const folderId = await createFolder(node.name, parentId);

        // Process children
        if (node.children) {
            for (const child of node.children) {
                await processNode(child, folderId);
            }
        }
    } else if (node.name.endsWith('.md')) {
        // Create document from markdown file
        await createDocumentFromMarkdown(node.path, parentId);
    }
}

async function main() {
    try {
        console.log('🚀 Starting LMS content import...');

        // Check if we have a demo user, create one if not
        let demoUser = await prisma.user.findUnique({
            where: { id: 'lms-import' },
        });

        if (!demoUser) {
            demoUser = await prisma.user.create({
                data: {
                    id: 'lms-import',
                    email: 'lms@example.com',
                    name: 'LMS Content Import',
                    role: 'ADMIN',
                },
            });
            console.log('✅ Created LMS import user');
        }

        // Create root LMS folder
        const lmsRootId = await createFolder('LMS Content');

        // Read the content directory
        const contentPath = path.join(process.cwd(), 'content');
        const nodes = await readDirectory(contentPath);

        // Process each top-level item
        for (const node of nodes) {
            await processNode(node, lmsRootId);
        }

        console.log('✅ LMS content import completed successfully!');
        console.log('📖 You can now access the imported content in the /docs section');

    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}

export { main as importLMSContent }; 