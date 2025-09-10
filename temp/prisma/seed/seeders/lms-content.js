"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedLMSContent = seedLMSContent;
exports.cleanLMSContent = cleanLMSContent;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const markdown_1 = require("@platejs/markdown");
const gray_matter_1 = __importDefault(require("gray-matter"));
const react_1 = require("platejs/react");
const logger_1 = require("../../../lib/logger");
const prisma = new client_1.PrismaClient();
// Server-side PlateJS editor for markdown conversion
const serverEditor = (0, react_1.createPlateEditor)({
    plugins: [
        markdown_1.MarkdownPlugin.configure({
            options: {
                remarkPlugins: [],
            },
        }),
    ],
});
const getCourseCategory = (dirName) => {
    const categoryMap = {
        'web': 'WEB_DEVELOPMENT',
        'data': 'DATA_SCIENCE',
        'career': 'CAREER_DEVELOPMENT',
        'ux': 'UX_UI_DESIGN',
        'marketing': 'DIGITAL_MARKETING',
    };
    return categoryMap[dirName.toLowerCase()] || 'WEB_DEVELOPMENT';
};
const extractOrder = (name, frontmatter) => {
    if (frontmatter?.order !== undefined) {
        return frontmatter.order;
    }
    const match = name.match(/(?:Module|Project|Sprint|Step|Task|Chapter)-?(\d+)/i);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 999;
};
async function readDirectory(dirPath) {
    try {
        const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
        const nodes = [];
        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'assets') {
                continue;
            }
            const fullPath = path_1.default.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                const children = await readDirectory(fullPath);
                nodes.push({
                    name: entry.name,
                    path: fullPath,
                    isDirectory: true,
                    children: children.length > 0 ? children : undefined,
                });
            }
            else if (entry.name.endsWith('.md')) {
                try {
                    const content = await promises_1.default.readFile(fullPath, 'utf-8');
                    const { data } = (0, gray_matter_1.default)(content);
                    const frontmatter = data;
                    nodes.push({
                        name: entry.name,
                        path: fullPath,
                        isDirectory: false,
                        order: extractOrder(entry.name, frontmatter),
                    });
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to read frontmatter from ${fullPath}:`);
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
            if (a.order !== undefined)
                return -1;
            if (b.order !== undefined)
                return 1;
            if (a.isDirectory && !b.isDirectory)
                return -1;
            if (!a.isDirectory && b.isDirectory)
                return 1;
            return a.name.localeCompare(b.name);
        });
    }
    catch (error) {
        logger_1.logger.warn(`Failed to read directory ${dirPath}:`);
        return [];
    }
}
function markdownToPlateJS(markdown) {
    try {
        const api = serverEditor.getApi(markdown_1.MarkdownPlugin);
        return api.markdown.deserialize(markdown) || [];
    }
    catch (error) {
        logger_1.logger.warn('Failed to convert markdown to PlateJS:');
        return [
            {
                type: 'p',
                children: [{ text: markdown }],
            },
        ];
    }
}
async function createCourse(name, description = '') {
    try {
        const existingCourse = await prisma.course.findFirst({
            where: { title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ') }
        });
        if (existingCourse) {
            logger_1.logger.info(`📚 Course already exists: ${existingCourse.title} (${existingCourse.id})`);
            return existingCourse.id;
        }
        const course = await prisma.course.create({
            data: {
                title: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
                description: description || `${name} course content`,
                category: getCourseCategory(name),
                isPublished: true,
                order: extractOrder(name),
            },
        });
        logger_1.logger.info(`📚 Created course: ${course.title} (${course.id})`);
        return course.id;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error(`❌ Failed to create course ${name}:`, errorMessage);
        throw errorMessage;
    }
}
async function createProject(name, courseId, description = '') {
    try {
        const projectTitle = name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const existingProject = await prisma.project.findFirst({
            where: {
                courseId,
                title: projectTitle
            }
        });
        if (existingProject) {
            logger_1.logger.info(`📋 Project already exists: ${existingProject.title} (${existingProject.id})`);
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
        logger_1.logger.info(`📋 Created project: ${project.title} (${project.id})`);
        return project.id;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error(`❌ Failed to create project ${name}:`, errorMessage);
        throw errorMessage;
    }
}
async function createLesson(filePath, projectId) {
    try {
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const { data, content: markdownContent } = (0, gray_matter_1.default)(content);
        const frontmatter = data;
        const plateContent = markdownToPlateJS(markdownContent);
        let lessonType = 'TEXT';
        if (markdownContent.includes('video') || markdownContent.includes('youtube')) {
            lessonType = 'VIDEO';
        }
        else if (markdownContent.includes('quiz') || markdownContent.includes('question')) {
            lessonType = 'QUIZ';
        }
        else if (markdownContent.includes('exercise') || markdownContent.includes('practice')) {
            lessonType = 'EXERCISE';
        }
        const fileName = path_1.default.basename(filePath, '.md');
        const lessonTitle = frontmatter.title || fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const existingLesson = await prisma.lesson.findFirst({
            where: {
                projectId,
                title: lessonTitle
            }
        });
        if (existingLesson) {
            logger_1.logger.info(`📝 Lesson already exists: ${existingLesson.title} (${existingLesson.id})`);
            return existingLesson.id;
        }
        const lesson = await prisma.lesson.create({
            data: {
                title: lessonTitle,
                description: frontmatter.metaDescription || `${fileName} lesson content`,
                content: plateContent,
                type: lessonType,
                projectId,
                isPublished: true,
                order: extractOrder(fileName, frontmatter),
            },
        });
        logger_1.logger.info(`📝 Created lesson: ${lesson.title} (${lesson.id})`);
        return lesson.id;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error(`❌ Failed to create lesson from ${filePath}:`, errorMessage);
        throw errorMessage;
    }
}
async function processCourse(courseNode) {
    logger_1.logger.info(`\n🎓 Processing course: ${courseNode.name}`);
    let courseDescription = '';
    const courseMarkdownPath = path_1.default.join(path_1.default.dirname(courseNode.path), `${courseNode.name}.md`);
    try {
        const courseContent = await promises_1.default.readFile(courseMarkdownPath, 'utf-8');
        const { data, content } = (0, gray_matter_1.default)(courseContent);
        courseDescription = data.metaDescription || content.substring(0, 200) + '...';
    }
    catch {
        // Course markdown doesn't exist, use default description
    }
    const courseId = await createCourse(courseNode.name, courseDescription);
    if (courseNode.children) {
        for (const child of courseNode.children) {
            if (child.isDirectory) {
                await processProject(child, courseId);
            }
            else if (child.name.endsWith('.md')) {
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
async function processProject(projectNode, courseId) {
    logger_1.logger.info(`  📋 Processing project: ${projectNode.name}`);
    let projectDescription = '';
    const projectMarkdownPath = path_1.default.join(path_1.default.dirname(projectNode.path), `${projectNode.name}.md`);
    try {
        const projectContent = await promises_1.default.readFile(projectMarkdownPath, 'utf-8');
        const { data, content } = (0, gray_matter_1.default)(projectContent);
        projectDescription = data.metaDescription || content.substring(0, 200) + '...';
    }
    catch {
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
async function seedLMSContent() {
    try {
        logger_1.logger.info('🚀 Starting LMS content import...');
        const contentPath = path_1.default.join(process.cwd(), 'content');
        // Check if content directory exists
        try {
            await promises_1.default.access(contentPath);
        }
        catch {
            logger_1.logger.warn('⚠️ Content directory not found. Skipping LMS content import.');
            return;
        }
        const nodes = await readDirectory(contentPath);
        for (const node of nodes) {
            if (node.isDirectory && !['assets', '.git'].includes(node.name)) {
                await processCourse(node);
            }
        }
        logger_1.logger.info('✅ LMS content import completed successfully!');
        logger_1.logger.info('📖 Courses, projects, and lessons have been imported to the database');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ LMS content import failed:', errorMessage);
        throw errorMessage;
    }
}
async function cleanLMSContent() {
    try {
        logger_1.logger.info('🧹 Cleaning LMS content...');
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
        logger_1.logger.info('✅ LMS content cleaned successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Failed to clean LMS content:', errorMessage);
        throw errorMessage;
    }
}
