import fs from 'fs/promises';
import path from 'path';

import { MarkdownPlugin } from '@platejs/markdown';
import { CourseCategory, LessonType, PrismaClient } from '@prisma/client';
import matter from 'gray-matter';
import { createPlateEditor } from 'platejs/react';
import remarkGfm from 'remark-gfm';

import { logger } from '../../../lib/logger';
import { STORAGE_BUCKETS } from '../../../lib/supabase/storage';
import { ensureBucketForSeed, uploadFileFromPathForSeed } from '../../../lib/supabase/storage-seed';

const prisma = new PrismaClient();

// Server-side PlateJS editor for markdown conversion
const serverEditor = createPlateEditor({
    plugins: [
        MarkdownPlugin.configure({
            options: {
                remarkPlugins: [remarkGfm],
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
    tags?: string[];
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
        'career': 'CAREER_DEVELOPMENT'
    };

    return categoryMap[dirName.toLowerCase()] || 'WEB_DEVELOPMENT';
};

// Asset upload and URL mapping - GLOBAL map to persist across function calls
let assetUrlMap = new Map<string, string>();

const isAssetFile = (filePath: string): boolean => {
    const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.mp4', '.mov', '.avi', '.mp3', '.wav'];
    const ext = path.extname(filePath).toLowerCase();
    return assetExtensions.includes(ext);
};

const getContentType = (filePath: string): string => {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap: { [key: string]: string } = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
    };
    return typeMap[ext] || 'application/octet-stream';
};

async function uploadAssets(assetsPath: string, stats: { assetsProcessed: number; errors: number }): Promise<void> {
    logger.info('🖼️ Starting asset upload process...');

    try {
        // Ensure LMS bucket exists
        await ensureBucketForSeed(STORAGE_BUCKETS.LMS);

        await processAssetsDirectory(assetsPath, '', stats);

        logger.info(`✅ Asset upload completed! ${stats.assetsProcessed} files uploaded`);
        logger.info(`🗺️ Created ${assetUrlMap.size} asset URL mappings:`);
        for (const [localPath, publicUrl] of assetUrlMap.entries()) {
            logger.info(`   ${localPath} -> ${publicUrl.substring(0, 50)}...`);
        }

        // Test the mapping with German-Brands specifically
        const germanBrandsKey = 'staticAsset/career/German-Brands.jpg';
        if (assetUrlMap.has(germanBrandsKey)) {
            logger.info(`✅ German-Brands mapping confirmed: ${germanBrandsKey} -> ${assetUrlMap.get(germanBrandsKey)}`);
        } else {
            logger.error(`❌ German-Brands mapping missing! Available career mappings:`);
            for (const [key, value] of assetUrlMap.entries()) {
                if (key.includes('career')) {
                    logger.error(`   - ${key} -> ${value}`);
                }
            }
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Asset upload failed: ${errorMessage}`);
        stats.errors++;
    }
}

async function processAssetsDirectory(dirPath: string, relativePath: string, stats: { assetsProcessed: number; errors: number }): Promise<void> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.name.startsWith('.') || entry.name === 'gitkeep') {
                continue;
            }

            const fullPath = path.join(dirPath, entry.name);
            const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                await processAssetsDirectory(fullPath, entryRelativePath, stats);
            } else if (isAssetFile(fullPath)) {
                try {
                    // Create storage path that mirrors the content structure
                    const storageFilePath = entryRelativePath;
                    const contentType = getContentType(fullPath);

                    // Upload to Supabase
                    const { publicUrl } = await uploadFileFromPathForSeed(
                        fullPath,
                        storageFilePath,
                        STORAGE_BUCKETS.LMS,
                        contentType
                    );

                    // Map the local path to the public URL
                    const localAssetPath = `staticAsset/${entryRelativePath}`;
                    assetUrlMap.set(localAssetPath, publicUrl);

                    stats.assetsProcessed++;
                    logger.info(`📎 Uploaded asset: ${entry.name} -> ${storageFilePath}`);
                    logger.info(`🔗 Asset mapping: ${localAssetPath} -> ${publicUrl}`);
                } catch (error) {
                    stats.errors++;
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error(`❌ Failed to upload asset ${fullPath}: ${errorMessage}`);
                }
            }
        }
    } catch {
        logger.warn(`Failed to read assets directory ${dirPath}:`);
        stats.errors++;
    }
}

function updateMarkdownAssetReferences(markdownContent: string): string {
    let updatedContent = markdownContent;
    let replacementsMade = 0;

    // Debug: Log if we have any asset mappings
    if (assetUrlMap.size === 0) {
        logger.warn('🔍 No asset URL mappings found - assets may not have been uploaded yet');
        return updatedContent;
    }

    logger.info(`🔗 Processing content with ${assetUrlMap.size} asset mappings`);

    // Show what staticAsset references exist in this content BEFORE processing
    const staticAssetMatches = markdownContent.match(/staticAsset\/[^\s)'"]+/g);
    if (staticAssetMatches) {
        logger.info('📋 Found staticAsset references in content:');
        staticAssetMatches.forEach(ref => logger.info(`   - ${ref}`));
    }

    // Update asset references in markdown
    // Look for patterns like: ![alt](staticAsset/path/to/image.png)
    // or: [link text](staticAsset/path/to/file.pdf)
    // or: <img src="staticAsset/path/to/image.png" />

    for (const [localPath, publicUrl] of assetUrlMap.entries()) {
        logger.info(`🔍 Looking for: "${localPath}"`);

        // Simple string replacement approach (more reliable than complex regex)
        if (updatedContent.includes(localPath)) {
            logger.info(`✅ Found "${localPath}" in content`);

            // Replace all occurrences with a simple string replace
            const beforeReplace = updatedContent;
            updatedContent = updatedContent.replaceAll(localPath, publicUrl);

            if (beforeReplace !== updatedContent) {
                replacementsMade++;
                logger.info(`📎 Replaced all instances of: ${localPath} -> ${publicUrl}`);
            }
        } else {
            logger.warn(`❌ Could not find "${localPath}" in content`);
        }
    }

    // Final validation - check if any staticAsset references remain
    const finalStaticAssetMatches = updatedContent.match(/staticAsset\/[^\s)'"]+/g);
    if (finalStaticAssetMatches) {
        logger.error('❌ FAILED: staticAsset references still remain after processing:');
        finalStaticAssetMatches.forEach(ref => logger.error(`   - ${ref}`));
        logger.error('Available asset mappings were:');
        for (const [key] of assetUrlMap.entries()) {
            logger.error(`   - ${key}`);
        }
    } else if (replacementsMade > 0) {
        logger.info('✅ SUCCESS: All staticAsset references replaced with Supabase URLs');
    }

    return updatedContent;
}

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
                } catch {
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
    } catch {
        logger.warn(`Failed to read directory ${dirPath}:`);
        return [];
    }
}

function markdownToPlateJS(markdown: string): unknown[] {
    try {
        if (!markdown || markdown.trim().length === 0) {
            return [
                {
                    type: 'p',
                    children: [{ text: 'No content available' }],
                },
            ];
        }

        const api = serverEditor.getApi(MarkdownPlugin);
        const plateValue = api.markdown.deserialize(markdown);

        // Validate that the conversion produced valid PlateJS content
        if (!plateValue || !Array.isArray(plateValue) || plateValue.length === 0) {
            logger.warn('Markdown conversion returned empty or invalid result, using fallback');
            return [
                {
                    type: 'p',
                    children: [{ text: markdown }],
                },
            ];
        }

        // CRITICAL: Update asset URLs in the PlateJS structure
        logger.info(`📋 PlateJS structure before asset URL update: ${JSON.stringify(plateValue, null, 2).substring(0, 500)}...`);
        logger.info(`🗺️ Available asset mappings for replacement: ${assetUrlMap.size} mappings`);
        for (const [key, value] of assetUrlMap.entries()) {
            logger.info(`   - ${key} -> ${value.substring(0, 60)}...`);
        }

        const updatedPlateValue = updateAssetUrlsInPlateJS(plateValue);

        logger.info(`📋 PlateJS structure after asset URL update: ${JSON.stringify(updatedPlateValue, null, 2).substring(0, 500)}...`);
        return updatedPlateValue;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.warn(`Failed to convert markdown to PlateJS: ${errorMessage}`);

        // Enhanced fallback: try to preserve basic structure
        const lines = markdown.split('\n').filter(line => line.trim().length > 0);
        return lines.map(line => ({
            type: line.startsWith('#') ? 'h1' : 'p',
            children: [{ text: line.replace(/^#+\s*/, '') }],
        }));
    }
}

function updateAssetUrlsInPlateJS(plateValue: unknown[]): unknown[] {
    if (!Array.isArray(plateValue)) return plateValue;

    logger.info(`🔄 Processing ${plateValue.length} PlateJS elements for asset URLs`);

    // Test our replacement logic with a simple example
    if (assetUrlMap.size > 0) {
        const [testLocalPath] = Array.from(assetUrlMap.entries())[0];
        const testElement = { type: 'img', url: testLocalPath, children: [{ text: '' }] };
        logger.info(`🧪 TEST: Before replacement: ${JSON.stringify(testElement)}`);
        const testUpdated = updateElementAssetUrls(testElement);
        logger.info(`🧪 TEST: After replacement: ${JSON.stringify(testUpdated)}`);
    }

    return plateValue.map((element: unknown) => updateElementAssetUrls(element));
}

function updateElementAssetUrls(element: unknown): unknown {
    if (!element || typeof element !== 'object') return element;

    // Cast to a more specific type for property access
    const el = element as Record<string, unknown>;
    let updated = false;

    // COMPREHENSIVE APPROACH: Search all string properties for staticAsset references
    for (const [key, value] of Object.entries(el)) {
        if (typeof value === 'string' && value.includes('staticAsset/')) {
            logger.info(`🔍 Found staticAsset reference in property '${key}': ${value}`);

            // Try to replace with any matching asset mapping
            for (const [localPath, publicUrl] of assetUrlMap.entries()) {
                if (value.includes(localPath)) {
                    logger.info(`📎 Replacing in '${key}': ${localPath} -> ${publicUrl}`);
                    el[key] = value.replaceAll(localPath, publicUrl);
                    updated = true;
                    break;
                }
            }
        }
    }

    // Recursively process children and any nested objects/arrays
    for (const [key, value] of Object.entries(el)) {
        if (Array.isArray(value)) {
            el[key] = value.map((item: unknown) => updateElementAssetUrls(item));
        } else if (value && typeof value === 'object') {
            el[key] = updateElementAssetUrls(value);
        }
    }

    if (updated) {
        logger.info(`✅ Successfully updated element with asset URLs`);
    }

    return el;
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

        // Update asset references in markdown content before processing
        logger.info(`🔄 Processing lesson content for asset references: ${path.basename(filePath)}`);
        const updatedMarkdownContent = updateMarkdownAssetReferences(markdownContent);
        const plateContent = markdownToPlateJS(updatedMarkdownContent);
        const fileName = path.basename(filePath, '.md');

        // Enhanced lesson type detection based on content patterns
        let lessonType: string = 'TEXT';
        const contentLower = markdownContent.toLowerCase();
        const titleLower = frontmatter.title?.toLowerCase() || fileName.toLowerCase();

        if (contentLower.includes('video') ||
            contentLower.includes('youtube') ||
            contentLower.includes('vimeo') ||
            contentLower.includes('watch') ||
            titleLower.includes('video')) {
            lessonType = 'VIDEO';
        } else if (contentLower.includes('quiz') ||
            contentLower.includes('question') ||
            contentLower.includes('test') ||
            contentLower.includes('assessment') ||
            titleLower.includes('quiz')) {
            lessonType = 'QUIZ';
        } else if (contentLower.includes('exercise') ||
            contentLower.includes('practice') ||
            contentLower.includes('assignment') ||
            contentLower.includes('task') ||
            contentLower.includes('sprint') ||
            titleLower.includes('exercise') ||
            titleLower.includes('sprint') ||
            titleLower.includes('task')) {
            lessonType = 'EXERCISE';
        }

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

        logger.info(`💾 About to store lesson content in database:`);
        logger.info(`   Title: ${lessonTitle}`);
        logger.info(`   Content preview: ${JSON.stringify(plateContent, null, 2).substring(0, 300)}...`);

        const lesson = await prisma.lesson.create({
            data: {
                title: lessonTitle,
                description: frontmatter.metaDescription || `${fileName} lesson content`,
                content: plateContent as any, // PlateJS content is a complex object structure
                type: lessonType as LessonType,
                projectId,
                isPublished: true,
                order: extractOrder(fileName, frontmatter),
            },
        });

        logger.info(`📝 Created lesson: ${lesson.title} (${lesson.id})`);

        // Verify what was actually stored
        const storedLesson = await prisma.lesson.findUnique({
            where: { id: lesson.id },
            select: { id: true, title: true, content: true }
        });

        if (storedLesson) {
            logger.info(`✅ Verified stored content: ${JSON.stringify(storedLesson.content, null, 2).substring(0, 300)}...`);
        }

        return lesson.id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error(`❌ Failed to create lesson from ${filePath}:`, errorMessage);
        throw errorMessage;
    }
}

async function processCourse(courseNode: FileNode, stats: { coursesProcessed: number; projectsProcessed: number; lessonsProcessed: number; assetsProcessed: number; errors: number }): Promise<void> {
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
                await processProject(child, courseId, stats);
                stats.projectsProcessed++;
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
                    stats.projectsProcessed++;
                }

                await createLesson(child.path, defaultProjectId);
                stats.lessonsProcessed++;
            }
        }
    }
}

async function processProject(projectNode: FileNode, courseId: string, stats: { coursesProcessed: number; projectsProcessed: number; lessonsProcessed: number; assetsProcessed: number; errors: number }): Promise<void> {
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
                // Direct lesson files in the project directory
                await createLesson(child.path, projectId);
                stats.lessonsProcessed++;
            } else if (child.isDirectory && child.children) {
                // Handle subdirectories (like Sprint folders) within projects
                logger.info(`    📂 Processing project subdirectory: ${child.name}`);
                await processProjectSubdirectory(child, projectId, stats);
            }
        }
    }
}

async function processProjectSubdirectory(subdirNode: FileNode, projectId: string, stats: { coursesProcessed: number; projectsProcessed: number; lessonsProcessed: number; assetsProcessed: number; errors: number }): Promise<void> {
    if (subdirNode.children) {
        for (const child of subdirNode.children) {
            if (!child.isDirectory && child.name.endsWith('.md')) {
                // Sprint files, Resources, etc. - treat as lessons under the parent project
                await createLesson(child.path, projectId);
                stats.lessonsProcessed++;
            } else if (child.isDirectory && child.children) {
                // Handle even deeper nesting if it exists
                logger.info(`      📁 Processing deeper subdirectory: ${child.name}`);
                await processProjectSubdirectory(child, projectId, stats);
            }
        }
    }
}

export async function seedLMSContent() {
    const stats = {
        coursesProcessed: 0,
        projectsProcessed: 0,
        lessonsProcessed: 0,
        assetsProcessed: 0,
        errors: 0
    };

    try {
        logger.info('🚀 Starting LMS content import...');

        const contentPath = path.join(process.cwd(), 'content');
        const assetsPath = path.join(contentPath, 'assets');

        // Check if content directory exists
        try {
            await fs.access(contentPath);
        } catch {
            logger.warn('⚠️ Content directory not found. Skipping LMS content import.');
            return;
        }

        // Upload assets first (before processing content that references them)
        try {
            await fs.access(assetsPath);
            await uploadAssets(assetsPath, stats);
        } catch {
            logger.warn('⚠️ Assets directory not found. Skipping asset upload.');
        }

        const nodes = await readDirectory(contentPath);

        if (nodes.length === 0) {
            logger.warn('⚠️ No content directories found to process.');
            return;
        }

        logger.info(`📂 Found ${nodes.length} directories to process`);

        for (const node of nodes) {
            if (node.isDirectory && !['assets', '.git'].includes(node.name)) {
                try {
                    await processCourse(node, stats);
                    stats.coursesProcessed++;
                } catch (error) {
                    stats.errors++;
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error(`❌ Failed to process course ${node.name}: ${errorMessage}`);
                    // Continue processing other courses instead of failing entirely
                }
            }
        }

        logger.info('✅ LMS content import completed!');
        logger.info(`📊 Statistics: ${stats.coursesProcessed} courses, ${stats.projectsProcessed} projects, ${stats.lessonsProcessed} lessons, ${stats.assetsProcessed} assets processed`);
        if (stats.errors > 0) {
            logger.warn(`⚠️ ${stats.errors} errors occurred during import`);
        }

        // Verify asset replacement worked
        await verifyAssetReplacement();

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ LMS content import failed catastrophically:', errorMessage);
        throw errorMessage;
    }
}

async function verifyAssetReplacement(): Promise<void> {
    try {
        logger.info('🔍 Verifying asset replacement in database...');

        // Check lessons that might contain staticAsset references
        const lessonsWithAssets = await prisma.lesson.findMany({
            select: {
                id: true,
                title: true,
                content: true
            }
        });

        let totalStaticAssetRefs = 0;
        let totalSupabaseRefs = 0;

        for (const lesson of lessonsWithAssets) {
            const contentStr = JSON.stringify(lesson.content);

            const staticAssetMatches = contentStr.match(/staticAsset\/[^"'\s)]+/g);
            const supabaseMatches = contentStr.match(/https:\/\/[^"'\s)]*supabase\.co[^"'\s)]*/g);

            if (staticAssetMatches) {
                totalStaticAssetRefs += staticAssetMatches.length;
                logger.error(`❌ Lesson "${lesson.title}" still has staticAsset references:`);
                staticAssetMatches.forEach(match => logger.error(`   - ${match}`));
            }

            if (supabaseMatches) {
                totalSupabaseRefs += supabaseMatches.length;
                logger.info(`✅ Lesson "${lesson.title}" has Supabase URLs:`);
                supabaseMatches.forEach(match => logger.info(`   - ${match.substring(0, 80)}...`));
            }
        }

        logger.info(`📊 Verification results:`);
        logger.info(`   - ${totalStaticAssetRefs} staticAsset references remaining`);
        logger.info(`   - ${totalSupabaseRefs} Supabase URLs found`);
        logger.info(`   - ${assetUrlMap.size} asset mappings available`);

        if (totalStaticAssetRefs > 0) {
            logger.error('❌ Asset replacement FAILED - staticAsset references still exist in database');
        } else if (totalSupabaseRefs > 0) {
            logger.info('✅ Asset replacement SUCCESS - all references converted to Supabase URLs');
        } else {
            logger.warn('⚠️ No asset references found in content - may not have processed files with assets');
        }

    } catch (error) {
        logger.error('Failed to verify asset replacement:');
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