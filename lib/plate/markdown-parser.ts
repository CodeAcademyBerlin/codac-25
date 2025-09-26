import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import type { Value } from 'platejs';

export interface MarkdownMetadata {
    navTitle?: string;
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
    access?: string;
    order?: number;
    prev?: string;
    next?: string;
}

export interface ParsedMarkdown {
    metadata: MarkdownMetadata;
    plateValue: Value;
    content: string;
}

const CONTENT_DIR = join(process.cwd(), 'content');

/**
 * Parse a markdown file and convert it to Plate.js format
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
    const fullPath = join(CONTENT_DIR, filePath);

    try {
        const content = readFileSync(fullPath, 'utf-8');
        return parseMarkdownContent(content, filePath);
    } catch (_error) {
        throw new Error(`Failed to read markdown file: ${filePath}`);
    }
}

/**
 * Parse markdown content string and convert to Plate.js format
 */
export function parseMarkdownContent(content: string, _filePath?: string): ParsedMarkdown {
    // Extract frontmatter
    const { metadata, markdownContent } = extractFrontmatter(content);

    // For now, create a simple Plate.js value structure
    // This is a simplified approach - in a real implementation, you'd use the MarkdownPlugin
    const plateValue: Value = [
        {
            type: 'p',
            children: [{ text: markdownContent }],
        },
    ];

    return {
        metadata,
        plateValue,
        content: markdownContent,
    };
}

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content: string): { metadata: MarkdownMetadata; markdownContent: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return {
            metadata: {},
            markdownContent: content,
        };
    }

    const frontmatterContent = match[1];
    const markdownContent = match[2];

    // Parse frontmatter (simple YAML-like parsing)
    const metadata: MarkdownMetadata = {};
    const lines = frontmatterContent?.split('\n') ?? [];

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmedLine.slice(0, colonIndex).trim();
        const value = trimmedLine.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');

        // Convert string values to appropriate types
        if (key === 'order') {
            metadata[key] = parseInt(value, 10) || undefined;
        } else {
            (metadata as any)[key] = value || undefined;
        }
    }

    return { metadata, markdownContent: markdownContent ?? '' };
}

/**
 * Get all markdown files in the content directory
 */
export function getAllMarkdownFiles(): string[] {
    const files: string[] = [];

    function scanDirectory(dir: string, relativePath = ''): void {
        const items = readdirSync(dir);

        for (const item of items) {
            const fullPath = join(dir, item);
            const relativeItemPath = relativePath ? join(relativePath, item) : item;

            if (statSync(fullPath).isDirectory()) {
                scanDirectory(fullPath, relativeItemPath);
            } else if (item.endsWith('.md')) {
                files.push(relativeItemPath);
            }
        }
    }

    scanDirectory(CONTENT_DIR);
    return files;
}

/**
 * Get markdown files by pattern
 */
export function getMarkdownFilesByPattern(pattern: string): string[] {
    const allFiles = getAllMarkdownFiles();
    const regex = new RegExp(pattern);
    return allFiles.filter(file => regex.test(file));
}

/**
 * Get LMS content structure (organized by modules)
 */
export function getLMSContentStructure(): Record<string, string[]> {
    const files = getAllMarkdownFiles();
    const structure: Record<string, string[]> = {};

    for (const file of files) {
        const parts = file.split('/');
        if (parts.length >= 2) {
            const moduleName = parts[0];
            if (moduleName && !structure[moduleName]) {
                structure[moduleName] = [];
            }
            if (moduleName) {
                structure[moduleName]!.push(file);
            }
        }
    }

    return structure;
}
