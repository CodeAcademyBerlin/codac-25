import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import type { Value } from 'platejs';
// import rehypeStringify from 'rehype-stringify';
// import { remark } from 'remark';
// import remarkGfm from 'remark-gfm';
// import remarkMath from 'remark-math';
// import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export interface MarkdownMetadata {
    navTitle?: string;
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
    access?: string;
    order?: number;
    prev?: string;
    next?: string;
    folder?: string;
    icon?: string;
    color?: string;
}

export interface ParsedMarkdown {
    metadata: MarkdownMetadata;
    plateValue: Value;
    content: string;
    htmlContent: string;
}

const CONTENT_DIR = join(process.cwd(), 'content');

/**
 * Enhanced markdown parser with Plate MCP and rehype plugins
 */
export class EnhancedMarkdownParser {
    // private processor: ReturnType<typeof unified>;

    constructor() {
        // Initialize a simple unified processor without problematic plugins for now
        // TODO: Fix plugin compatibility issues
        // this.processor = unified();
    }

    /**
     * Parse a markdown file and convert it to Plate.js format with enhanced processing
     */
    async parseMarkdownFile(filePath: string): Promise<ParsedMarkdown> {
        // Normalize the file path to use forward slashes for consistency
        const normalizedPath = filePath.replace(/\\/g, '/');
        const fullPath = join(CONTENT_DIR, normalizedPath);

        try {
            const content = readFileSync(fullPath, 'utf-8');
            return await this.parseMarkdownContent(content, filePath);
        } catch (_error) {
            throw new Error(`Failed to read markdown file: ${filePath} (tried: ${fullPath})`);
        }
    }

    /**
     * Parse markdown content string and convert to Plate.js format with enhanced processing
     */
    async parseMarkdownContent(content: string, _filePath?: string): Promise<ParsedMarkdown> {
        // Extract frontmatter
        const { metadata, markdownContent } = this.extractFrontmatter(content);

        // Process markdown to HTML with plugins
        // For now, use a simple HTML conversion until plugin issues are resolved
        const htmlString = `<div class="markdown-content">${markdownContent.replace(/\n/g, '<br>')}</div>`;

        // Convert to Plate.js value using enhanced processing
        const plateValue = await this.convertToPlateValue(markdownContent, metadata);

        return {
            metadata,
            plateValue,
            content: markdownContent,
            htmlContent: htmlString,
        };
    }

    /**
     * Convert markdown content to Plate.js value with enhanced processing
     */
    private async convertToPlateValue(content: string, _metadata: MarkdownMetadata): Promise<Value> {
        // Use Plate's MarkdownPlugin for conversion
        // const markdownPlugin = MarkdownPlugin.configure({
        //     options: {
        //         remarkPlugins: [remarkGfm, remarkMath],
        //     },
        // });

        // For now, create a structured Plate.js value
        // In a full implementation, you would use the actual MarkdownPlugin
        const lines = content.split('\n');
        const plateNodes: unknown[] = [];

        let currentList: unknown[] | null = null;
        let listType: string | null = null;

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                if (currentList) {
                    plateNodes.push({
                        type: listType === 'ul' ? 'ul' : 'ol',
                        children: currentList,
                    });
                    currentList = null;
                    listType = null;
                }
                continue;
            }

            // Handle headings
            if (trimmedLine.startsWith('#')) {
                const level = trimmedLine.match(/^#+/)?.[0].length ?? 1;
                const text = trimmedLine.replace(/^#+\s*/, '');
                plateNodes.push({
                    type: `h${level}`,
                    children: [{ text }],
                });
                continue;
            }

            // Handle lists
            if (trimmedLine.match(/^[-*+]\s/)) {
                if (!currentList || listType !== 'ul') {
                    if (currentList) {
                        plateNodes.push({
                            type: listType === 'ul' ? 'ul' : 'ol',
                            children: currentList,
                        });
                    }
                    currentList = [];
                    listType = 'ul';
                }
                const text = trimmedLine.replace(/^[-*+]\s/, '');
                currentList.push({
                    type: 'li',
                    children: [{ text }],
                });
                continue;
            }

            if (trimmedLine.match(/^\d+\.\s/)) {
                if (!currentList || listType !== 'ol') {
                    if (currentList) {
                        plateNodes.push({
                            type: listType === 'ul' ? 'ul' : 'ol',
                            children: currentList,
                        });
                    }
                    currentList = [];
                    listType = 'ol';
                }
                const text = trimmedLine.replace(/^\d+\.\s/, '');
                currentList.push({
                    type: 'li',
                    children: [{ text }],
                });
                continue;
            }

            // Handle blockquotes
            if (trimmedLine.startsWith('>')) {
                const text = trimmedLine.replace(/^>\s*/, '');
                plateNodes.push({
                    type: 'blockquote',
                    children: [{ text }],
                });
                continue;
            }

            // Handle code blocks
            if (trimmedLine.startsWith('```')) {
                // This is a simplified implementation
                // In a full implementation, you'd handle multi-line code blocks
                continue;
            }

            // Handle horizontal rules
            if (trimmedLine.match(/^[-*_]{3,}$/)) {
                plateNodes.push({
                    type: 'hr',
                    children: [{ text: '' }],
                });
                continue;
            }

            // Handle regular paragraphs
            if (currentList) {
                plateNodes.push({
                    type: listType === 'ul' ? 'ul' : 'ol',
                    children: currentList,
                });
                currentList = null;
                listType = null;
            }

            // Process inline formatting
            const processedText = this.processInlineFormatting(trimmedLine);
            plateNodes.push({
                type: 'p',
                children: processedText,
            });
        }

        // Close any remaining list
        if (currentList) {
            plateNodes.push({
                type: listType === 'ul' ? 'ul' : 'ol',
                children: currentList,
            });
        }

        return (plateNodes.length > 0 ? plateNodes : [{ type: 'p', children: [{ text: '' }] }]) as Value;
    }

    /**
     * Process inline formatting (bold, italic, links, etc.)
     */
    private processInlineFormatting(text: string): unknown[] {
        // This is a simplified implementation
        // In a full implementation, you'd use a proper markdown parser
        const children: unknown[] = [];
        let currentText = text;

        // Handle bold text
        currentText = currentText.replace(/\*\*(.*?)\*\*/g, (_match, content) => {
            children.push({ text: content, bold: true });
            return '';
        });

        // Handle italic text
        currentText = currentText.replace(/\*(.*?)\*/g, (_match, content) => {
            children.push({ text: content, italic: true });
            return '';
        });

        // Handle inline code
        currentText = currentText.replace(/`(.*?)`/g, (_match, content) => {
            children.push({ text: content, code: true });
            return '';
        });

        // Handle links
        currentText = currentText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
            children.push({
                type: 'a',
                url,
                children: [{ text }],
            });
            return '';
        });

        // Add remaining text
        if (currentText) {
            children.push({ text: currentText });
        }

        return children.length > 0 ? children : [{ text }];
    }

    /**
     * Extract frontmatter from markdown content
     */
    private extractFrontmatter(content: string): { metadata: MarkdownMetadata; markdownContent: string } {
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
     * Get all markdown files in the content directory with folder structure
     */
    getAllMarkdownFiles(): Array<{ filePath: string; folderPath: string; folderName: string }> {
        const files: Array<{ filePath: string; folderPath: string; folderName: string }> = [];

        function scanDirectory(dir: string, relativePath = '', folderPath = '', folderName = ''): void {
            const items = readdirSync(dir);

            for (const item of items) {
                const fullPath = join(dir, item);
                const relativeItemPath = relativePath ? join(relativePath, item) : item;

                if (statSync(fullPath).isDirectory()) {
                    const newFolderPath = folderPath ? `${folderPath}/${item}` : item;
                    scanDirectory(fullPath, relativeItemPath, newFolderPath, item);
                } else if (item.endsWith('.md')) {
                    // Normalize paths to use forward slashes for consistency
                    const normalizedFilePath = relativeItemPath.replace(/\\/g, '/');
                    const normalizedFolderPath = folderPath.replace(/\\/g, '/');

                    files.push({
                        filePath: normalizedFilePath,
                        folderPath: normalizedFolderPath,
                        folderName,
                    });
                }
            }
        }

        scanDirectory(CONTENT_DIR);
        return files;
    }

    /**
     * Get LMS content structure organized by folders
     */
    getLMSContentStructure(): Record<string, Array<{ filePath: string; folderPath: string; folderName: string }>> {
        const files = this.getAllMarkdownFiles();
        const structure: Record<string, Array<{ filePath: string; folderPath: string; folderName: string }>> = {};

        for (const file of files) {
            const folderName = file.folderName || 'root';
            structure[folderName] ??= [];
            structure[folderName]?.push(file);
        }

        return structure;
    }
}

// Export singleton instance
export const enhancedMarkdownParser = new EnhancedMarkdownParser();

// Export legacy functions for backward compatibility
export const parseMarkdownFile = (filePath: string) => enhancedMarkdownParser.parseMarkdownFile(filePath);
export const parseMarkdownContent = (content: string, filePath?: string) =>
    enhancedMarkdownParser.parseMarkdownContent(content, filePath);
export const getAllMarkdownFiles = () => enhancedMarkdownParser.getAllMarkdownFiles();
export const getLMSContentStructure = () => enhancedMarkdownParser.getLMSContentStructure();
