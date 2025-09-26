import { PrismaClient } from '@prisma/client';

export async function seedDocumentFolders(prisma: PrismaClient) {
    console.log('🌳 Seeding document folders...');

    // Get some users to create folders for
    const users = await prisma.user.findMany({
        take: 3,
        select: { id: true, name: true },
    });

    if (users.length === 0) {
        console.log('⚠️  No users found, skipping document folders seed');
        return;
    }

    const userId = users[0].id;

    // Create root-level folders
    const workFolder = await prisma.documentFolder.create({
        data: {
            name: 'Work Projects',
            description: 'All work-related documents and project files',
            color: '#3B82F6',
            icon: 'folder',
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const personalFolder = await prisma.documentFolder.create({
        data: {
            name: 'Personal',
            description: 'Personal documents and notes',
            color: '#10B981',
            icon: 'folder',
            ownerId: userId,
            sortOrder: 2,
        },
    });

    const learningFolder = await prisma.documentFolder.create({
        data: {
            name: 'Learning Resources',
            description: 'Educational materials and study notes',
            color: '#8B5CF6',
            icon: 'folder',
            ownerId: userId,
            sortOrder: 3,
        },
    });

    const _archiveFolder = await prisma.documentFolder.create({
        data: {
            name: 'Archive',
            description: 'Old and completed documents',
            color: '#6B7280',
            icon: 'folder',
            ownerId: userId,
            sortOrder: 4,
        },
    });

    // Create subfolders under Work Projects
    const frontendFolder = await prisma.documentFolder.create({
        data: {
            name: 'Frontend Development',
            description: 'React, Next.js, and UI components',
            color: '#F59E0B',
            icon: 'folder',
            parentId: workFolder.id,
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const backendFolder = await prisma.documentFolder.create({
        data: {
            name: 'Backend Development',
            description: 'API, database, and server-side code',
            color: '#EF4444',
            icon: 'folder',
            parentId: workFolder.id,
            ownerId: userId,
            sortOrder: 2,
        },
    });

    const docsFolder = await prisma.documentFolder.create({
        data: {
            name: 'Documentation',
            description: 'Project documentation and specifications',
            color: '#06B6D4',
            icon: 'folder',
            parentId: workFolder.id,
            ownerId: userId,
            sortOrder: 3,
        },
    });

    // Create subfolders under Learning Resources
    const tutorialsFolder = await prisma.documentFolder.create({
        data: {
            name: 'Tutorials',
            description: 'Step-by-step learning guides',
            color: '#EC4899',
            icon: 'folder',
            parentId: learningFolder.id,
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const notesFolder = await prisma.documentFolder.create({
        data: {
            name: 'Study Notes',
            description: 'Personal notes and summaries',
            color: '#84CC16',
            icon: 'folder',
            parentId: learningFolder.id,
            ownerId: userId,
            sortOrder: 2,
        },
    });

    // Create subfolders under Personal
    const ideasFolder = await prisma.documentFolder.create({
        data: {
            name: 'Ideas & Concepts',
            description: 'Random ideas and concept exploration',
            color: '#F97316',
            icon: 'folder',
            parentId: personalFolder.id,
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const _journalFolder = await prisma.documentFolder.create({
        data: {
            name: 'Journal',
            description: 'Daily thoughts and reflections',
            color: '#A855F7',
            icon: 'folder',
            parentId: personalFolder.id,
            ownerId: userId,
            sortOrder: 2,
        },
    });

    // Create a deep nested structure under Frontend Development
    const reactFolder = await prisma.documentFolder.create({
        data: {
            name: 'React Components',
            description: 'Reusable React components and hooks',
            color: '#61DAFB',
            icon: 'folder-open',
            parentId: frontendFolder.id,
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const _nextjsFolder = await prisma.documentFolder.create({
        data: {
            name: 'Next.js Projects',
            description: 'Next.js applications and configurations',
            color: '#000000',
            icon: 'folder',
            parentId: frontendFolder.id,
            ownerId: userId,
            sortOrder: 2,
        },
    });

    // Create another level under React Components
    const hooksFolder = await prisma.documentFolder.create({
        data: {
            name: 'Custom Hooks',
            description: 'Custom React hooks and utilities',
            color: '#4F46E5',
            icon: 'folder',
            parentId: reactFolder.id,
            ownerId: userId,
            sortOrder: 1,
        },
    });

    const componentsFolder = await prisma.documentFolder.create({
        data: {
            name: 'UI Components',
            description: 'Button, Input, Modal, and other UI components',
            color: '#059669',
            icon: 'folder',
            parentId: reactFolder.id,
            ownerId: userId,
            sortOrder: 2,
        },
    });

    console.log('✅ Document folders seeded successfully');

    // Now let's organize some existing documents into these folders
    await organizeExistingDocuments(prisma, userId, {
        workFolder,
        personalFolder,
        learningFolder,
        frontendFolder,
        backendFolder,
        docsFolder,
        tutorialsFolder,
        notesFolder,
        ideasFolder,
        reactFolder,
        hooksFolder,
        componentsFolder,
    });
}

async function organizeExistingDocuments(
    prisma: PrismaClient,
    userId: string,
    folders: Record<string, any>
) {
    console.log('📄 Organizing existing documents into folders...');

    // Get some existing documents for this user
    const documents = await prisma.document.findMany({
        where: {
            authorId: userId,
            isArchived: false,
        },
        take: 20, // Limit to avoid overwhelming
    });

    if (documents.length === 0) {
        console.log('⚠️  No documents found to organize');
        return;
    }

    // Organize documents based on their content and type
    const documentAssignments = [
        // Work-related documents
        { folder: folders.workFolder, count: Math.min(3, documents.length) },
        { folder: folders.frontendFolder, count: Math.min(2, documents.length) },
        { folder: folders.backendFolder, count: Math.min(2, documents.length) },
        { folder: folders.docsFolder, count: Math.min(2, documents.length) },
        { folder: folders.reactFolder, count: Math.min(2, documents.length) },
        { folder: folders.hooksFolder, count: Math.min(1, documents.length) },
        { folder: folders.componentsFolder, count: Math.min(1, documents.length) },

        // Learning documents
        { folder: folders.learningFolder, count: Math.min(2, documents.length) },
        { folder: folders.tutorialsFolder, count: Math.min(1, documents.length) },
        { folder: folders.notesFolder, count: Math.min(2, documents.length) },

        // Personal documents
        { folder: folders.personalFolder, count: Math.min(2, documents.length) },
        { folder: folders.ideasFolder, count: Math.min(1, documents.length) },
        { folder: folders.journalFolder, count: Math.min(1, documents.length) },
    ];

    let documentIndex = 0;

    for (const assignment of documentAssignments) {
        if (documentIndex >= documents.length) break;

        const documentsToMove = documents.slice(
            documentIndex,
            documentIndex + assignment.count
        );

        for (const document of documentsToMove) {
            await prisma.document.update({
                where: { id: document.id },
                data: { folderId: assignment.folder.id },
            });
        }

        documentIndex += assignment.count;
    }

    console.log(`✅ Organized ${documentIndex} documents into folders`);

    // Create some sample documents if we don't have enough
    if (documents.length < 10) {
        await createSampleDocuments(prisma, userId, folders);
    }
}

async function createSampleDocuments(
    prisma: PrismaClient,
    userId: string,
    folders: Record<string, any>
) {
    console.log('📝 Creating sample documents...');

    const sampleDocuments = [
        {
            title: 'React Hook Patterns',
            description: 'Common patterns and best practices for React hooks',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'React Hook Patterns' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'This document covers various patterns for using React hooks effectively.',
                        },
                    ],
                },
            ],
            documentType: 'lesson_content',
            folderId: folders.hooksFolder?.id,
        },
        {
            title: 'Button Component Design',
            description: 'Design system for button components across the application',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'Button Component Design' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Comprehensive guide to creating consistent button components.',
                        },
                    ],
                },
            ],
            documentType: 'project_summary',
            folderId: folders.componentsFolder?.id,
        },
        {
            title: 'API Architecture Notes',
            description: 'Notes on designing RESTful APIs',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'API Architecture' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Key principles for building scalable APIs.',
                        },
                    ],
                },
            ],
            documentType: 'lesson_content',
            folderId: folders.backendFolder?.id,
        },
        {
            title: 'Project Requirements',
            description: 'Detailed requirements for the current project',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'Project Requirements' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Comprehensive list of features and specifications.',
                        },
                    ],
                },
            ],
            documentType: 'project_summary',
            folderId: folders.docsFolder?.id,
        },
        {
            title: 'Learning JavaScript',
            description: 'My journey learning JavaScript fundamentals',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'JavaScript Learning Journey' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Notes and observations while learning JavaScript.',
                        },
                    ],
                },
            ],
            documentType: 'lesson_content',
            folderId: folders.notesFolder?.id,
        },
        {
            title: 'App Idea: Task Manager',
            description: 'Initial concept for a new task management application',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'Task Manager App Idea' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Brainstorming ideas for a new productivity app.',
                        },
                    ],
                },
            ],
            documentType: 'community_post',
            folderId: folders.ideasFolder?.id,
        },
        {
            title: 'Daily Reflection',
            description: 'Today\'s thoughts and learnings',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'Daily Reflection' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Reflecting on today\'s progress and challenges.',
                        },
                    ],
                },
            ],
            documentType: 'community_post',
            folderId: folders.journalFolder?.id,
        },
        {
            title: 'Next.js Tutorial',
            description: 'Step-by-step tutorial for building with Next.js',
            content: [
                {
                    type: 'h1',
                    children: [{ text: 'Next.js Tutorial' }],
                },
                {
                    type: 'p',
                    children: [
                        {
                            text: 'Comprehensive tutorial covering Next.js basics to advanced topics.',
                        },
                    ],
                },
            ],
            documentType: 'lesson_content',
            folderId: folders.tutorialsFolder?.id,
        },
    ];

    for (const docData of sampleDocuments) {
        try {
            // Skip documents with undefined folder IDs
            if (!docData.folderId) {
                console.log(`⚠️  Skipping document "${docData.title}" - no folder ID`);
                continue;
            }

            await prisma.document.create({
                data: {
                    ...docData,
                    authorId: userId,
                    isPublished: Math.random() > 0.5, // Randomly publish some documents
                },
            });
        } catch (error) {
            console.error(`❌ Failed to create document "${docData.title}":`, error);
        }
    }

    console.log(`✅ Created ${sampleDocuments.length} sample documents`);
}
