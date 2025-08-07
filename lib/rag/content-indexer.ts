import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { ContentChunk } from '@/types/rag';
import { createEmbeddingProvider } from './embedding-providers';
import { TextChunker } from './text-chunker';
import { VectorStore } from './vector-store';

export class ContentIndexer {
    private embeddingProvider;
    private textChunker;
    private vectorStore;

    constructor() {
        this.embeddingProvider = createEmbeddingProvider();
        this.textChunker = new TextChunker();
        this.vectorStore = new VectorStore();
    }

    /**
     * Index all LMS content (courses, projects, lessons, assignments, resources)
     */
    async indexAllContent(): Promise<{
        indexed: number;
        errors: string[];
    }> {
        logger.info('Starting full content indexing...');

        let totalIndexed = 0;
        const errors: string[] = [];

        try {
            // Index courses
            const courseResults = await this.indexCourses();
            totalIndexed += courseResults.indexed;
            errors.push(...courseResults.errors);

            // Index projects
            const projectResults = await this.indexProjects();
            totalIndexed += projectResults.indexed;
            errors.push(...projectResults.errors);

            // Index lessons
            const lessonResults = await this.indexLessons();
            totalIndexed += lessonResults.indexed;
            errors.push(...lessonResults.errors);

            // Index assignments
            const assignmentResults = await this.indexAssignments();
            totalIndexed += assignmentResults.indexed;
            errors.push(...assignmentResults.errors);

            // Index resources
            const resourceResults = await this.indexResources();
            totalIndexed += resourceResults.indexed;
            errors.push(...resourceResults.errors);

            logger.info(`Content indexing completed. Total indexed: ${totalIndexed}, Errors: ${errors.length}`);

            return { indexed: totalIndexed, errors };
        } catch (error) {
            logger.error('Failed to index content:', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * Index all courses
     */
    async indexCourses(): Promise<{ indexed: number; errors: string[] }> {
        logger.info('Indexing courses...');

        const courses = await prisma.course.findMany({
            where: { isPublished: true }
        });

        let indexed = 0;
        const errors: string[] = [];

        for (const course of courses) {
            try {
                const chunks = await this.createCourseChunks(course);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index course ${course.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        logger.info(`Indexed ${indexed} course chunks`);
        return { indexed, errors };
    }

    /**
     * Index all projects
     */
    async indexProjects(): Promise<{ indexed: number; errors: string[] }> {
        logger.info('Indexing projects...');

        const projects = await prisma.project.findMany({
            where: { isPublished: true },
            include: { course: true }
        });

        let indexed = 0;
        const errors: string[] = [];

        for (const project of projects) {
            try {
                const chunks = await this.createProjectChunks(project);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index project ${project.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        logger.info(`Indexed ${indexed} project chunks`);
        return { indexed, errors };
    }

    /**
     * Index all lessons
     */
    async indexLessons(): Promise<{ indexed: number; errors: string[] }> {
        logger.info('Indexing lessons...');

        const lessons = await prisma.lesson.findMany({
            where: { isPublished: true },
            include: {
                project: {
                    include: { course: true }
                }
            }
        });

        let indexed = 0;
        const errors: string[] = [];

        for (const lesson of lessons) {
            try {
                const chunks = await this.createLessonChunks(lesson);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index lesson ${lesson.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        logger.info(`Indexed ${indexed} lesson chunks`);
        return { indexed, errors };
    }

    /**
     * Index all assignments
     */
    async indexAssignments(): Promise<{ indexed: number; errors: string[] }> {
        logger.info('Indexing assignments...');

        const assignments = await prisma.assignment.findMany({
            where: { isPublished: true },
            include: {
                lesson: {
                    include: {
                        project: {
                            include: { course: true }
                        }
                    }
                }
            }
        });

        let indexed = 0;
        const errors: string[] = [];

        for (const assignment of assignments) {
            try {
                const chunks = await this.createAssignmentChunks(assignment);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index assignment ${assignment.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        logger.info(`Indexed ${indexed} assignment chunks`);
        return { indexed, errors };
    }

    /**
     * Index all resources (lesson and assignment resources)
     */
    async indexResources(): Promise<{ indexed: number; errors: string[] }> {
        logger.info('Indexing resources...');

        const [lessonResources, assignmentResources] = await Promise.all([
            prisma.lessonResource.findMany({
                include: {
                    lesson: {
                        include: {
                            project: {
                                include: { course: true }
                            }
                        }
                    }
                }
            }),
            prisma.assignmentResource.findMany({
                include: {
                    assignment: {
                        include: {
                            lesson: {
                                include: {
                                    project: {
                                        include: { course: true }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        ]);

        let indexed = 0;
        const errors: string[] = [];

        // Index lesson resources
        for (const resource of lessonResources) {
            try {
                const chunks = await this.createLessonResourceChunks(resource);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index lesson resource ${resource.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        // Index assignment resources
        for (const resource of assignmentResources) {
            try {
                const chunks = await this.createAssignmentResourceChunks(resource);
                if (chunks.length > 0) {
                    await this.storeChunks(chunks);
                    indexed += chunks.length;
                }
            } catch (error) {
                const errorMsg = `Failed to index assignment resource ${resource.id}: ${error}`;
                logger.error(errorMsg);
                errors.push(errorMsg);
            }
        }

        logger.info(`Indexed ${indexed} resource chunks`);
        return { indexed, errors };
    }

    /**
     * Create chunks for a course
     */
    private async createCourseChunks(course: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const hierarchicalChunks = this.textChunker.createHierarchicalChunks(
            course.title,
            course.description,
            null, // Courses don't have content field
            {
                courseId: course.id,
                category: course.category,
                difficulty: course.difficulty || 'BEGINNER',
                duration: course.duration
            }
        );

        const chunksWithEmbeddings: (ContentChunk & { embedding: number[] })[] = [];

        for (let i = 0; i < hierarchicalChunks.length; i++) {
            const chunk = hierarchicalChunks[i];
            const embeddingResult = await this.embeddingProvider.generateEmbedding(chunk.text);

            chunksWithEmbeddings.push({
                id: `course-${course.id}-${i}`,
                contentType: 'course',
                contentId: course.id,
                chunkIndex: i,
                chunkText: chunk.text,
                metadata: chunk.metadata,
                tokenCount: chunk.tokenCount,
                embedding: embeddingResult.embedding
            });
        }

        return chunksWithEmbeddings;
    }

    /**
     * Create chunks for a project
     */
    private async createProjectChunks(project: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const hierarchicalChunks = this.textChunker.createHierarchicalChunks(
            project.title,
            project.description,
            null, // Projects don't have content field
            {
                courseId: project.course.id,
                courseName: project.course.title,
                projectId: project.id,
                duration: project.duration
            }
        );

        const chunksWithEmbeddings: (ContentChunk & { embedding: number[] })[] = [];

        for (let i = 0; i < hierarchicalChunks.length; i++) {
            const chunk = hierarchicalChunks[i];
            const embeddingResult = await this.embeddingProvider.generateEmbedding(chunk.text);

            chunksWithEmbeddings.push({
                id: `project-${project.id}-${i}`,
                contentType: 'project',
                contentId: project.id,
                chunkIndex: i,
                chunkText: chunk.text,
                metadata: chunk.metadata,
                tokenCount: chunk.tokenCount,
                embedding: embeddingResult.embedding
            });
        }

        return chunksWithEmbeddings;
    }

    /**
     * Create chunks for a lesson
     */
    private async createLessonChunks(lesson: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const hierarchicalChunks = this.textChunker.createHierarchicalChunks(
            lesson.title,
            lesson.description,
            lesson.content, // Rich JSON content
            {
                courseId: lesson.project.course.id,
                courseName: lesson.project.course.title,
                projectId: lesson.project.id,
                projectName: lesson.project.title,
                lessonId: lesson.id,
                lessonType: lesson.type,
                duration: lesson.duration
            }
        );

        const chunksWithEmbeddings: (ContentChunk & { embedding: number[] })[] = [];

        for (let i = 0; i < hierarchicalChunks.length; i++) {
            const chunk = hierarchicalChunks[i];
            const embeddingResult = await this.embeddingProvider.generateEmbedding(chunk.text);

            chunksWithEmbeddings.push({
                id: `lesson-${lesson.id}-${i}`,
                contentType: 'lesson',
                contentId: lesson.id,
                chunkIndex: i,
                chunkText: chunk.text,
                metadata: chunk.metadata,
                tokenCount: chunk.tokenCount,
                embedding: embeddingResult.embedding
            });
        }

        return chunksWithEmbeddings;
    }

    /**
     * Create chunks for an assignment
     */
    private async createAssignmentChunks(assignment: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const hierarchicalChunks = this.textChunker.createHierarchicalChunks(
            assignment.title,
            assignment.description,
            assignment.instructions, // Rich JSON instructions
            {
                courseId: assignment.lesson?.project?.course?.id,
                courseName: assignment.lesson?.project?.course?.title,
                projectId: assignment.lesson?.project?.id,
                projectName: assignment.lesson?.project?.title,
                lessonId: assignment.lesson?.id,
                lessonName: assignment.lesson?.title,
                assignmentId: assignment.id,
                assignmentType: assignment.type,
                maxScore: assignment.maxScore,
                dueDate: assignment.dueDate?.toISOString()
            }
        );

        const chunksWithEmbeddings: (ContentChunk & { embedding: number[] })[] = [];

        for (let i = 0; i < hierarchicalChunks.length; i++) {
            const chunk = hierarchicalChunks[i];
            const embeddingResult = await this.embeddingProvider.generateEmbedding(chunk.text);

            chunksWithEmbeddings.push({
                id: `assignment-${assignment.id}-${i}`,
                contentType: 'assignment',
                contentId: assignment.id,
                chunkIndex: i,
                chunkText: chunk.text,
                metadata: chunk.metadata,
                tokenCount: chunk.tokenCount,
                embedding: embeddingResult.embedding
            });
        }

        return chunksWithEmbeddings;
    }

    /**
     * Create chunks for a lesson resource
     */
    private async createLessonResourceChunks(resource: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const text = `${resource.title}\nType: ${resource.type}\nURL: ${resource.url}`;
        const embeddingResult = await this.embeddingProvider.generateEmbedding(text);

        return [{
            id: `lesson-resource-${resource.id}-0`,
            contentType: 'resource',
            contentId: resource.id,
            chunkIndex: 0,
            chunkText: text,
            metadata: {
                courseId: resource.lesson.project.course.id,
                courseName: resource.lesson.project.course.title,
                projectId: resource.lesson.project.id,
                projectName: resource.lesson.project.title,
                lessonId: resource.lesson.id,
                lessonName: resource.lesson.title,
                resourceType: resource.type,
                resourceUrl: resource.url
            },
            tokenCount: Math.ceil(text.length / 4), // Rough token estimation
            embedding: embeddingResult.embedding
        }];
    }

    /**
     * Create chunks for an assignment resource
     */
    private async createAssignmentResourceChunks(resource: any): Promise<(ContentChunk & { embedding: number[] })[]> {
        const text = `${resource.title}\nType: ${resource.type}\nURL: ${resource.url}`;
        const embeddingResult = await this.embeddingProvider.generateEmbedding(text);

        return [{
            id: `assignment-resource-${resource.id}-0`,
            contentType: 'resource',
            contentId: resource.id,
            chunkIndex: 0,
            chunkText: text,
            metadata: {
                courseId: resource.assignment.lesson?.project?.course?.id,
                courseName: resource.assignment.lesson?.project?.course?.title,
                projectId: resource.assignment.lesson?.project?.id,
                projectName: resource.assignment.lesson?.project?.title,
                lessonId: resource.assignment.lesson?.id,
                lessonName: resource.assignment.lesson?.title,
                assignmentId: resource.assignment.id,
                assignmentName: resource.assignment.title,
                resourceType: resource.type,
                resourceUrl: resource.url
            },
            tokenCount: Math.ceil(text.length / 4), // Rough token estimation
            embedding: embeddingResult.embedding
        }];
    }

    /**
     * Store chunks in vector database
     */
    private async storeChunks(chunks: (ContentChunk & { embedding: number[] })[]): Promise<void> {
        await this.vectorStore.storeEmbeddings(chunks);
    }

    /**
     * Reindex specific content by type and ID
     */
    async reindexContent(contentType: string, contentId: string): Promise<void> {
        logger.info(`Reindexing ${contentType} ${contentId}...`);

        // Delete existing embeddings
        await this.vectorStore.deleteContentEmbeddings(contentType, contentId);

        // Reindex based on content type
        switch (contentType) {
            case 'course':
                const course = await prisma.course.findUnique({ where: { id: contentId } });
                if (course) {
                    const chunks = await this.createCourseChunks(course);
                    await this.storeChunks(chunks);
                }
                break;

            case 'project':
                const project = await prisma.project.findUnique({
                    where: { id: contentId },
                    include: { course: true }
                });
                if (project) {
                    const chunks = await this.createProjectChunks(project);
                    await this.storeChunks(chunks);
                }
                break;

            case 'lesson':
                const lesson = await prisma.lesson.findUnique({
                    where: { id: contentId },
                    include: {
                        project: {
                            include: { course: true }
                        }
                    }
                });
                if (lesson) {
                    const chunks = await this.createLessonChunks(lesson);
                    await this.storeChunks(chunks);
                }
                break;

            case 'assignment':
                const assignment = await prisma.assignment.findUnique({
                    where: { id: contentId },
                    include: {
                        lesson: {
                            include: {
                                project: {
                                    include: { course: true }
                                }
                            }
                        }
                    }
                });
                if (assignment) {
                    const chunks = await this.createAssignmentChunks(assignment);
                    await this.storeChunks(chunks);
                }
                break;

            default:
                throw new Error(`Unsupported content type: ${contentType}`);
        }

        logger.info(`Reindexing ${contentType} ${contentId} completed`);
    }

    /**
     * Get indexing statistics
     */
    async getIndexingStats(): Promise<{
        totalEmbeddings: number;
        byContentType: Record<string, number>;
        averageChunksPerContent: number;
        lastIndexed?: Date;
    }> {
        const stats = await this.vectorStore.getStats();

        // Get last indexed timestamp from most recent embedding
        const lastEmbedding = await prisma.contentEmbedding.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                createdAt: true
            }
        });

        return {
            ...stats,
            lastIndexed: lastEmbedding?.createdAt
        };
    }
}
