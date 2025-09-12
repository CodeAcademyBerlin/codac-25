import fs from 'fs/promises';
import path from 'path';

import { MarkdownPlugin } from '@platejs/markdown';
import { CourseCategory, LessonType, PrismaClient } from '@prisma/client';
import matter from 'gray-matter';
import { createPlateEditor } from 'platejs/react';

import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

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

const getCourseCategory = (dirName: string) => {
    const categoryMap: { [key: string]: string } = {
        'web': 'WEB_DEVELOPMENT',
        'data': 'DATA_SCIENCE',
        'career': 'CAREER_DEVELOPMENT',
        'ux': 'UX_UI_DESIGN',
        'marketing': 'DIGITAL_MARKETING',
    };

    return categoryMap[dirName.toLowerCase()] || 'WEB_DEVELOPMENT';
};

const extractOrder = (name: string, frontmatter?: FrontMatter): number => {
    if (frontmatter?.order !== undefined) {
        return frontmatter.order;
    }

    const match = name.match(/(?:Module|Project|Sprint|Step|Task|Chapter)-?(\d+)/i);
    if (match) {
        return parseInt(match[1], 10);
    }

    return 999;
};

async function readDirectory(dirPath: string): Promise<FileNode[]> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const nodes: FileNode[] = [];

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'assets') {
                continue;
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
                    logger.warn(`Failed to read frontmatter from ${fullPath}:`);
                    nodes.push({
                        name: entry.name,
                        path: fullPath,
                        isDirectory: false,
                        order: extractOrder(entry.name),
                    });
                }
            }
        }

        return nodes.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
            }
            if (a.order !== undefined) return -1;
            if (b.order !== undefined) return 1;

            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;

            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        logger.warn(`Failed to read directory ${dirPath}:`);
        return [];
    }
}

function markdownToPlateJS(markdown: string): any[] {
    try {
        const api = serverEditor.getApi(MarkdownPlugin);
        return api.markdown.deserialize(markdown) || [];
    } catch (error) {
        logger.warn('Failed to convert markdown to PlateJS:');
        return [
            {
                type: 'p',
                children: [{ text: markdown }],
            },
        ];
    }
}

async function createCourse(name: string, description: string = ''): Promise<string> {
    try {
        const existingCourse = await prisma.course.findFirst({
            where: { title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ') }
        });

        if (existingCourse) {
            logger.info(`📚 Course already exists: ${existingCourse.title} (${existingCourse.id})`);
            return existingCourse.id;
        }

        const course = await prisma.course.create({
            data: {
                title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
                description: description || `${name} course content`,
                category: getCourseCategory(name) as CourseCategory,
                isPublished: true,
                order: extractOrder(name),
            },
        });

        logger.info(`📚 Created course: ${course.title} (${course.id})`);
        return course.id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error(`❌ Failed to create course ${name}:`, errorMessage);
        throw errorMessage;
    }
}

async function createProject(name: string, courseId: string, description: string = ''): Promise<string> {
    try {
        const projectTitle = name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const existingProject = await prisma.project.findFirst({
            where: {
                courseId,
                title: projectTitle
            }
        });

        if (existingProject) {
            logger.info(`📋 Project already exists: ${existingProject.title} (${existingProject.id})`);
            return existingProject.id;
        }

        const project = await prisma.project.create({
            data: {
                title: projectTitle,
                description: description || `${name} project content`,
                courseId,
                isPublished: true,
                order: extractOrder(name),
            },
        });

        logger.info(`📋 Created project: ${project.title} (${project.id})`);
        return project.id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error(`❌ Failed to create project ${name}:`, errorMessage);
        throw errorMessage;
    }
}

async function createLesson(filePath: string, projectId: string): Promise<string> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data, content: markdownContent } = matter(content);
        const frontmatter = data as FrontMatter;

        const plateContent = markdownToPlateJS(markdownContent);

        let lessonType: string = 'TEXT';
        if (markdownContent.includes('video') || markdownContent.includes('youtube')) {
            lessonType = 'VIDEO';
        } else if (markdownContent.includes('quiz') || markdownContent.includes('question')) {
            lessonType = 'QUIZ';
        } else if (markdownContent.includes('exercise') || markdownContent.includes('practice')) {
            lessonType = 'EXERCISE';
        }

        const fileName = path.basename(filePath, '.md');
        const lessonTitle = frontmatter.title || fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

        const existingLesson = await prisma.lesson.findFirst({
            where: {
                projectId,
                title: lessonTitle
            }
        });

        if (existingLesson) {
            logger.info(`📝 Lesson already exists: ${existingLesson.title} (${existingLesson.id})`);
            return existingLesson.id;
        }

        const lesson = await prisma.lesson.create({
            data: {
                title: lessonTitle,
                description: frontmatter.metaDescription || `${fileName} lesson content`,
                content: plateContent,
                type: lessonType as LessonType,
                projectId,
                isPublished: true,
                order: extractOrder(fileName, frontmatter),
            },
        });

        logger.info(`📝 Created lesson: ${lesson.title} (${lesson.id})`);
        return lesson.id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error(`❌ Failed to create lesson from ${filePath}:`, errorMessage);
        throw errorMessage;
    }
}

async function processCourse(courseNode: FileNode): Promise<void> {
    logger.info(`\n🎓 Processing course: ${courseNode.name}`);

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

    if (courseNode.children) {
        for (const child of courseNode.children) {
            if (child.isDirectory) {
                await processProject(child, courseId);
            } else if (child.name.endsWith('.md')) {
                const existingProject = await prisma.project.findFirst({
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
    logger.info(`  📋 Processing project: ${projectNode.name}`);

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

    if (projectNode.children) {
        for (const child of projectNode.children) {
            if (!child.isDirectory && child.name.endsWith('.md')) {
                await createLesson(child.path, projectId);
            }
        }
    }
}

export async function seedLMSContent() {
    try {
        logger.info('🚀 Starting LMS content import...');

        const contentPath = path.join(process.cwd(), 'content');

        // Check if content directory exists
        try {
            await fs.access(contentPath);
        } catch {
            logger.warn('⚠️ Content directory not found. Skipping LMS content import.');
            return;
        }

        const nodes = await readDirectory(contentPath);

        for (const node of nodes) {
            if (node.isDirectory && !['assets', '.git'].includes(node.name)) {
                await processCourse(node);
            }
        }

        logger.info('✅ LMS content import completed successfully!');
        logger.info('📖 Courses, projects, and lessons have been imported to the database');

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ LMS content import failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanLMSContent() {
    try {
        logger.info('🧹 Cleaning LMS content...');

        // This is a more conservative approach - we'll only clean lessons/projects/courses
        // that were created from markdown content
        await prisma.lesson.deleteMany({
            where: {
                description: { contains: 'lesson content' }
            }
        });

        await prisma.project.deleteMany({
            where: {
                description: { contains: 'project content' }
            }
        });

        await prisma.course.deleteMany({
            where: {
                description: { contains: 'course content' }
            }
        });

        logger.info('✅ LMS content cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean LMS content:', errorMessage);
        throw errorMessage;
    }
} 