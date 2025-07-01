'use server';

import { revalidatePath } from 'next/cache';
import { Value } from 'platejs';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function updateLessonContent(lessonId: string, content: Value) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check if user has permission to edit (admin/mentor only)
        if (!['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions'
            };
        }

        // Verify lesson exists
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                id: true,
                title: true,
                project: {
                    select: {
                        course: {
                            select: { title: true }
                        }
                    }
                }
            },
        });

        if (!lesson) {
            return {
                success: false,
                error: 'Lesson not found'
            };
        }

        // Update lesson content
        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                content: content as any,
                updatedAt: new Date(),
            },
        });

        logger.info('Lesson content updated', {
            action: 'update',
            resource: 'lesson',
            resourceId: lessonId,
            userId: user.id,
            metadata: {
                lessonTitle: lesson.title,
                courseTitle: lesson.project.course.title
            }
        });

        // Revalidate relevant paths
        revalidatePath(`/lms/lessons/${lessonId}`);

        return {
            success: true,
            message: 'Lesson updated successfully'
        };

    } catch (error) {
        logger.error('Failed to update lesson', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to update lesson'
        };
    }
}

export async function updateLessonProgress(lessonId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Verify lesson exists and user has access
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                project: {
                    include: {
                        course: {
                            include: {
                                enrollments: {
                                    where: { userId: user.id },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!lesson) {
            return {
                success: false,
                error: 'Lesson not found'
            };
        }

        // Check if user is enrolled or has admin/mentor access
        const isEnrolled = lesson.project.course.enrollments.length > 0;
        const hasAccess = isEnrolled || ['ADMIN', 'MENTOR'].includes(user.role);

        if (!hasAccess) {
            return {
                success: false,
                error: 'Access denied'
            };
        }

        // Update or create progress record
        await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId,
                },
            },
            update: {
                status,
                completedAt: status === 'COMPLETED' ? new Date() : null,
                startedAt: status === 'IN_PROGRESS' &&
                    !(await prisma.lessonProgress.findUnique({
                        where: { userId_lessonId: { userId: user.id, lessonId } },
                        select: { startedAt: true }
                    }))?.startedAt ? new Date() : undefined,
            },
            create: {
                userId: user.id,
                lessonId: lessonId,
                status,
                startedAt: status !== 'NOT_STARTED' ? new Date() : null,
                completedAt: status === 'COMPLETED' ? new Date() : null,
            },
        });

        logger.info('Lesson progress updated', {
            action: 'update',
            resource: 'lesson_progress',
            resourceId: lessonId,
            userId: user.id,
            metadata: { status }
        });

        // Revalidate relevant paths
        revalidatePath(`/lms/lessons/${lessonId}`);
        revalidatePath(`/lms/courses/${lesson.project.course.id}`);

        return {
            success: true,
            message: 'Progress updated successfully'
        };

    } catch (error) {
        logger.error('Failed to update lesson progress', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to update progress'
        };
    }
} 