#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';

import matter from 'gray-matter';

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

// Extract order from filename or frontmatter
const extractOrder = (name: string, frontmatter?: FrontMatter): number => {
    if (frontmatter?.order !== undefined) {
        return frontmatter.order;
    }

    // Extract order from names like "Module-1", "Project-2", "Sprint-3"
    const match = name.match(/(?:Module|Project|Sprint)-?(\d+)/i);
    if (match) {
        return parseInt(match[1], 10);
    }

    return 999; // Default high order for items without explicit ordering
};

async function readDirectory(dirPath: string): Promise<FileNode[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'assets') {
            continue; // Skip hidden files and assets folder
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
                    order: extractOrder(entry.name, frontmatter),
                });
            } catch (error) {
                console.warn(`Failed to read frontmatter from ${fullPath}:`, error);
                nodes.push({
                    name: entry.name,
                    path: fullPath,
                    isDirectory: false,
                    order: extractOrder(entry.name),
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

function printStructure(nodes: FileNode[], indent = ''): void {
    for (const node of nodes) {
        if (node.isDirectory) {
            console.log(`${indent}📚 COURSE: ${node.name} (order: ${node.order || 'auto'})`);
            if (node.children) {
                for (const child of node.children) {
                    if (child.isDirectory) {
                        console.log(`${indent}  📋 PROJECT: ${child.name} (order: ${child.order || 'auto'})`);
                        if (child.children) {
                            for (const lesson of child.children) {
                                if (!lesson.isDirectory && lesson.name.endsWith('.md')) {
                                    console.log(`${indent}    📝 LESSON: ${lesson.name} (order: ${lesson.order || 'auto'})`);
                                }
                            }
                        }
                    } else if (child.name.endsWith('.md')) {
                        console.log(`${indent}  📝 STANDALONE LESSON: ${child.name} (order: ${child.order || 'auto'})`);
                    }
                }
            }
        }
    }
}

async function main() {
    try {
        console.log('🔍 Analyzing LMS content structure...\n');

        // Read the content directory
        const contentPath = path.join(process.cwd(), 'content');
        const nodes = await readDirectory(contentPath);

        // Filter out non-course directories
        const courseNodes = nodes.filter(node =>
            node.isDirectory && !['assets', '.git'].includes(node.name)
        );

        console.log('📊 Import Preview:');
        console.log('==================\n');

        printStructure(courseNodes);

        console.log('\n📈 Summary:');
        console.log('===========');

        let totalCourses = 0;
        let totalProjects = 0;
        let totalLessons = 0;

        for (const course of courseNodes) {
            totalCourses++;
            if (course.children) {
                for (const child of course.children) {
                    if (child.isDirectory) {
                        totalProjects++;
                        if (child.children) {
                            totalLessons += child.children.filter(
                                lesson => !lesson.isDirectory && lesson.name.endsWith('.md')
                            ).length;
                        }
                    } else if (child.name.endsWith('.md')) {
                        totalLessons++; // Standalone lessons
                    }
                }
            }
        }

        console.log(`📚 Total Courses: ${totalCourses}`);
        console.log(`📋 Total Projects: ${totalProjects}`);
        console.log(`📝 Total Lessons: ${totalLessons}`);

        console.log('\n✅ Analysis complete!');
        console.log('💡 Run the actual import with: npm run import-lms-content');

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

export { main as testLMSImport }; 