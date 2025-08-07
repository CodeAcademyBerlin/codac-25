import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

/**
 * Data access functions for RAG content indexing
 * These functions don't require user authentication as they're used for system indexing
 */

export async function getAllPublishedCourses() {
    try {
        return await prisma.course.findMany({
            where: { isPublished: true },
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        logger.error('Failed to get published courses:', error instanceof Error ? error : undefined);
        return [];
    }
}

export async function getAllPublishedProjects() {
    try {
        return await prisma.project.findMany({
            where: { isPublished: true },
            include: { course: true },
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        logger.error('Failed to get published projects:', error instanceof Error ? error : undefined);
        return [];
    }
}

export async function getAllPublishedLessons() {
    try {
        return await prisma.lesson.findMany({
            where: { isPublished: true },
            include: {
                project: {
                    include: { course: true }
                }
            },
            orderBy: { order: 'asc' }
        });
    } catch (error) {
        logger.error('Failed to get published lessons:', error instanceof Error ? error : undefined);
        return [];
    }
}

export async function getAllPublishedAssignments() {
    try {
        return await prisma.assignment.findMany({
            where: { isPublished: true },
            include: {
                lesson: {
                    include: {
                        project: {
                            include: { course: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    } catch (error) {
        logger.error('Failed to get published assignments:', error instanceof Error ? error : undefined);
        return [];
    }
}

export async function getAllLessonResources() {
    try {
        return await prisma.lessonResource.findMany({
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
    } catch (error) {
        logger.error('Failed to get lesson resources:', error instanceof Error ? error : undefined);
        return [];
    }
}

export async function getAllAssignmentResources() {
    try {
        return await prisma.assignmentResource.findMany({
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
        });
    } catch (error) {
        logger.error('Failed to get assignment resources:', error instanceof Error ? error : undefined);
        return [];
    }
}

/**
 * Get content by type and ID for reindexing
 */
export async function getContentById(contentType: string, contentId: string) {
    try {
        switch (contentType) {
            case 'course':
                return await prisma.course.findUnique({
                    where: { id: contentId }
                });

            case 'project':
                return await prisma.project.findUnique({
                    where: { id: contentId },
                    include: { course: true }
                });

            case 'lesson':
                return await prisma.lesson.findUnique({
                    where: { id: contentId },
                    include: {
                        project: {
                            include: { course: true }
                        }
                    }
                });

            case 'assignment':
                return await prisma.assignment.findUnique({
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

            case 'lesson-resource':
                return await prisma.lessonResource.findUnique({
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

            case 'assignment-resource':
                return await prisma.assignmentResource.findUnique({
                    where: { id: contentId },
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
                });

            default:
                throw new Error(`Unsupported content type: ${contentType}`);
        }
    } catch (error) {
        logger.error(`Failed to get ${contentType} ${contentId}:`, error instanceof Error ? error : undefined);
        return null;
    }
}

/**
 * Get content statistics for indexing overview
 */
export async function getContentCounts() {
    try {
        const [
            courseCount,
            projectCount,
            lessonCount,
            assignmentCount,
            lessonResourceCount,
            assignmentResourceCount
        ] = await Promise.all([
            prisma.course.count({ where: { isPublished: true } }),
            prisma.project.count({ where: { isPublished: true } }),
            prisma.lesson.count({ where: { isPublished: true } }),
            prisma.assignment.count({ where: { isPublished: true } }),
            prisma.lessonResource.count(),
            prisma.assignmentResource.count()
        ]);

        return {
            courses: courseCount,
            projects: projectCount,
            lessons: lessonCount,
            assignments: assignmentCount,
            lessonResources: lessonResourceCount,
            assignmentResources: assignmentResourceCount,
            total: courseCount + projectCount + lessonCount + assignmentCount + lessonResourceCount + assignmentResourceCount
        };
    } catch (error) {
        logger.error('Failed to get content counts:', error instanceof Error ? error : undefined);
        return {
            courses: 0,
            projects: 0,
            lessons: 0,
            assignments: 0,
            lessonResources: 0,
            assignmentResources: 0,
            total: 0
        };
    }
}
