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

// Course category mapping based on directory names
const getCourseCategory = (dirName: string): string => {
    const categoryMap: { [key: string]: string } = {
        'web': 'WEB_DEVELOPMENT',
        'data': 'DATA_SCIENCE',
        'career': 'CAREER_DEVELOPMENT',
        'ux': 'UX_UI_DESIGN',
        'marketing': 'DIGITAL_MARKETING',
    };

    return categoryMap[dirName.toLowerCase()] || 'WEB_DEVELOPMENT';
};

// Extract order from filename or frontmatter
const extractOrder = (name: string, frontmatter?: FrontMatter): number => {
    if (frontmatter?.order !== undefined) {
        return frontmatter.order;
    }

    // Extract order from names like "Module-1", "Project-2", "Sprint-3", "Step-1"
    const match = name.match(/(?:Module|Project|Sprint|Step|Task|Chapter)-?(\d+)/i);
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
            continue; // Skip hidden files and assets folder (handled separately)
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

async function createCourse(
    name: string,
    description: string = ''
): Promise<string> {
    try {
        const course = await (prisma as any).course.create({
            data: {
                title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
                description: description || `${name} course content`,
                category: getCourseCategory(name),
                isPublished: true,
                order: extractOrder(name),
            },
        });

        console.log(`📚 Created course: ${course.title} (${course.id})`);
        return course.id;
    } catch (error) {
        console.error(`❌ Failed to create course ${name}:`, error);
        throw error;
    }
}

async function createProject(
    name: string,
    courseId: string,
    description: string = ''
): Promise<string> {
    try {
        const project = await (prisma as any).project.create({
            data: {
                title: name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                description: description || `${name} project content`,
                courseId,
                isPublished: true,
                order: extractOrder(name),
            },
        });

        console.log(`📋 Created project: ${project.title} (${project.id})`);
        return project.id;
    } catch (error) {
        console.error(`❌ Failed to create project ${name}:`, error);
        throw error;
    }
}

async function createLesson(
    filePath: string,
    projectId: string
): Promise<string> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: markdownContent } = matter(content);
        const frontmatter = data as FrontMatter;

        // Convert markdown to PlateJS format
        const plateContent = markdownToPlateJS(markdownContent);

        // Determine lesson type based on content
        let lessonType = 'TEXT';
        if (markdownContent.includes('video') || markdownContent.includes('youtube')) {
            lessonType = 'VIDEO';
        } else if (markdownContent.includes('quiz') || markdownContent.includes('question')) {
            lessonType = 'QUIZ';
        } else if (markdownContent.includes('exercise') || markdownContent.includes('practice')) {
            lessonType = 'EXERCISE';
        }

        const fileName = path.basename(filePath, '.md');
        const lesson = await (prisma as any).lesson.create({
            data: {
                title: frontmatter.title || fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                description: frontmatter.metaDescription || `${fileName} lesson content`,
                content: plateContent,
                type: lessonType,
                projectId,
                isPublished: true,
                order: extractOrder(fileName, frontmatter),
            },
        });

        console.log(`📝 Created lesson: ${lesson.title} (${lesson.id})`);
        return lesson.id;
    } catch (error) {
        console.error(`❌ Failed to create lesson from ${filePath}:`, error);
        throw error;
    }
}

// TODO: Implement asset upload to uploadthing
async function handleAssets(assetsPath: string): Promise<void> {
    console.log(`📁 Found assets directory: ${assetsPath}`);
    console.log('⚠️  Asset upload to uploadthing not yet implemented');
    // Future implementation:
    // 1. Read all files in assets directory
    // 2. Upload each file to uploadthing using the configured file router
    // 3. Store the uploaded URLs for reference in lessons/projects
    // 4. Update markdown content to reference uploaded asset URLs
}

async function processCourse(courseNode: FileNode): Promise<void> {
    console.log(`\n🎓 Processing course: ${courseNode.name}`);

    // Read course description from main course markdown file if it exists
    let courseDescription = '';
    const courseMarkdownPath = path.join(path.dirname(courseNode.path), `${courseNode.name}.md`);
    try {
        const courseContent = await fs.readFile(courseMarkdownPath, 'utf-8');
        const { data, content } = matter(courseContent);
        courseDescription = (data as FrontMatter).metaDescription || content.substring(0, 200) + '...';
    } catch {
        // Course markdown doesn't exist, use default description
    }

    const courseId = await createCourse(courseNode.name, courseDescription);

    // Handle assets directory if it exists
    const assetsPath = path.join(courseNode.path, 'assets');
    try {
        await fs.access(assetsPath);
        await handleAssets(assetsPath);
    } catch {
        // No assets directory
    }

    // Process projects (direct subdirectories)
    if (courseNode.children) {
        for (const child of courseNode.children) {
            if (child.isDirectory) {
                await processProject(child, courseId);
            } else if (child.name.endsWith('.md')) {
                // Handle standalone lessons at course level (create a default project)
                const existingProject = await (prisma as any).project.findFirst({
                    where: {
                        courseId,
                        title: 'General Lessons'
                    }
                });
                let defaultProjectId = existingProject?.id;

                if (!defaultProjectId) {
                    defaultProjectId = await createProject('General Lessons', courseId, 'Standalone lessons for this course');
                }

                await createLesson(child.path, defaultProjectId);
            }
        }
    }
}

async function processProject(projectNode: FileNode, courseId: string): Promise<void> {
    console.log(`  📋 Processing project: ${projectNode.name}`);

    // Read project description from main project markdown file if it exists
    let projectDescription = '';
    const projectMarkdownPath = path.join(path.dirname(projectNode.path), `${projectNode.name}.md`);
    try {
        const projectContent = await fs.readFile(projectMarkdownPath, 'utf-8');
        const { data, content } = matter(projectContent);
        projectDescription = (data as FrontMatter).metaDescription || content.substring(0, 200) + '...';
    } catch {
        // Project markdown doesn't exist, use default description
    }

    const projectId = await createProject(projectNode.name, courseId, projectDescription);

    // Process lessons (markdown files in project directory)
    if (projectNode.children) {
        for (const child of projectNode.children) {
            if (!child.isDirectory && child.name.endsWith('.md')) {
                await createLesson(child.path, projectId);
            }
        }
    }
}

async function main() {
    try {
        console.log('🚀 Starting LMS content import...');

        // Check if the required models exist in the database
        try {
            await (prisma as any).course.findMany({ take: 1 });
        } catch {
            console.error('❌ Course model not found. Please run "npx prisma generate" and "npx prisma db push" first.');
            process.exit(1);
        }

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

        // Read the content directory
        const contentPath = path.join(process.cwd(), 'content');
        const nodes = await readDirectory(contentPath);

        // Process each top-level directory as a course
        for (const node of nodes) {
            if (node.isDirectory && !['assets', '.git'].includes(node.name)) {
                await processCourse(node);
            }
        }

        console.log('\n✅ LMS content import completed successfully!');
        console.log('📖 Courses, projects, and lessons have been imported to the database');
        console.log('⚠️  Note: Asset upload to uploadthing is not yet implemented');

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