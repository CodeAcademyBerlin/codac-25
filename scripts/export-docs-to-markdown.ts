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
                remarkPlugins: [],
            },
        }),
    ],
});

interface DocumentNode {
    id: string;
    title: string;
    content: any[];
    isFolder: boolean;
    parentId: string | null;
    children?: DocumentNode[];
    createdAt: Date;
    updatedAt: Date;
}

interface ExportOptions {
    outputDir: string;
    includeMetadata: boolean;
    authorFilter?: string;
}

function plateJSToMarkdown(content: any[]): string {
    try {
        if (!content || content.length === 0) {
            return '';
        }

        // Set the editor value and serialize
        serverEditor.children = content;
        const api = serverEditor.getApi(MarkdownPlugin);
        const markdown = api.markdown.serialize();

        return markdown || '';
    } catch (error) {
        console.warn('Failed to convert PlateJS to markdown:', error);
        // Fallback: try to extract text content
        try {
            return extractTextContent(content);
        } catch (fallbackError) {
            console.warn('Fallback text extraction also failed:', fallbackError);
            return '';
        }
    }
}

function extractTextContent(nodes: any[]): string {
    let text = '';

    for (const node of nodes) {
        if (node.text) {
            text += node.text;
        } else if (node.children) {
            text += extractTextContent(node.children);
        }

        // Add line breaks for block elements
        if (node.type && ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(node.type)) {
            text += '\n';
        }
    }

    return text;
}

function sanitizeFilename(filename: string): string {
    // Remove or replace invalid filename characters
    return filename
        .replace(/[<>:"/\\|?*]/g, '-')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

function generateFrontmatter(doc: DocumentNode, includeMetadata: boolean): string {
    const frontmatter: Record<string, any> = {
        title: doc.title,
    };

    if (includeMetadata) {
        frontmatter.exportedAt = new Date().toISOString();
        frontmatter.originalId = doc.id;
        frontmatter.createdAt = doc.createdAt.toISOString();
        frontmatter.updatedAt = doc.updatedAt.toISOString();
    }

    return matter.stringify('', frontmatter).split('\n').slice(0, -1).join('\n') + '\n';
}

async function createDirectoryStructure(dirPath: string): Promise<void> {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

async function exportDocument(
    doc: DocumentNode,
    basePath: string,
    options: ExportOptions
): Promise<void> {
    if (doc.isFolder) {
        // Create directory
        const folderPath = path.join(basePath, sanitizeFilename(doc.title));
        await createDirectoryStructure(folderPath);
        console.log(`📁 Created directory: ${folderPath}`);

        // Export children
        if (doc.children) {
            for (const child of doc.children) {
                await exportDocument(child, folderPath, options);
            }
        }
    } else {
        // Export as markdown file
        const filename = `${sanitizeFilename(doc.title)}.md`;
        const filePath = path.join(basePath, filename);

        // Convert content to markdown
        const markdownContent = plateJSToMarkdown(doc.content);

        // Generate frontmatter
        const frontmatter = generateFrontmatter(doc, options.includeMetadata);

        // Combine frontmatter and content
        const fullContent = frontmatter + '\n' + markdownContent;

        await fs.writeFile(filePath, fullContent, 'utf-8');
        console.log(`✅ Exported: ${filePath}`);
    }
}

function buildDocumentTree(documents: any[]): DocumentNode[] {
    const nodeMap = new Map<string, DocumentNode>();
    const rootNodes: DocumentNode[] = [];

    // Create all nodes
    documents.forEach(doc => {
        const node: DocumentNode = {
            id: doc.id,
            title: doc.title,
            content: doc.content,
            isFolder: doc.isFolder,
            parentId: doc.parentId,
            children: [],
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        nodeMap.set(doc.id, node);
    });

    // Build tree structure
    documents.forEach(doc => {
        const node = nodeMap.get(doc.id);
        if (!node) return;

        if (doc.parentId) {
            const parent = nodeMap.get(doc.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            } else {
                rootNodes.push(node);
            }
        } else {
            rootNodes.push(node);
        }
    });

    // Sort children by title
    const sortChildren = (nodes: DocumentNode[]): DocumentNode[] => {
        return nodes
            .sort((a, b) => {
                // Folders first, then documents
                if (a.isFolder && !b.isFolder) return -1;
                if (!a.isFolder && b.isFolder) return 1;
                return a.title.localeCompare(b.title);
            })
            .map(node => ({
                ...node,
                children: node.children ? sortChildren(node.children) : undefined
            }));
    };

    return sortChildren(rootNodes);
}

async function exportDocsToMarkdown(options: ExportOptions): Promise<void> {
    try {
        console.log('🚀 Starting docs export to markdown...');

        // Fetch documents from database
        const whereClause: any = {};
        if (options.authorFilter) {
            whereClause.authorId = options.authorFilter;
        }

        const documents = await prisma.document.findMany({
            where: whereClause,
            orderBy: [
                { createdAt: 'asc' }
            ],
        });

        if (documents.length === 0) {
            console.log('📭 No documents found to export.');
            return;
        }

        console.log(`📚 Found ${documents.length} documents to export`);

        // Create output directory
        await createDirectoryStructure(options.outputDir);

        // Build document tree
        const documentTree = buildDocumentTree(documents);

        // Export each root document/folder
        for (const rootDoc of documentTree) {
            await exportDocument(rootDoc, options.outputDir, options);
        }

        console.log('✅ Export completed successfully!');
        console.log(`📁 Content exported to: ${options.outputDir}`);

    } catch (error) {
        console.error('❌ Export failed:', error);
        throw error;
    }
}

async function main() {
    const outputDir = process.argv[2] || './exported-content';
    const includeMetadata = process.argv.includes('--metadata');
    const authorFilter = process.argv.includes('--lms-only') ? 'lms-import' : undefined;

    const options: ExportOptions = {
        outputDir,
        includeMetadata,
        authorFilter,
    };

    console.log('📋 Export options:', {
        outputDir: options.outputDir,
        includeMetadata: options.includeMetadata,
        authorFilter: options.authorFilter || 'all documents',
    });

    try {
        await exportDocsToMarkdown(options);
    } catch (error) {
        console.error('Export failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    main();
}

export { exportDocsToMarkdown, ExportOptions }; 