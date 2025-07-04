'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

interface MoveLessonInput {
    lessonId: string;
    targetProjectId: string;
    position?: 'before' | 'after';
    targetLessonId?: string; // For positioning relative to another lesson
}

export async function moveLesson(data: MoveLessonInput) {
    const startTime = Date.now();

    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const { lessonId, targetProjectId, position, targetLessonId } = data;

        // Get the lesson to move
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                project: {
                    include: { course: true }
                }
            }
        });

        if (!lesson) {
            return {
                success: false,
                error: 'Lesson not found'
            };
        }

        // Get the target project
        const targetProject = await prisma.project.findUnique({
            where: { id: targetProjectId },
            include: {
                course: true,
                lessons: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!targetProject) {
            return {
                success: false,
                error: 'Target project not found'
            };
        }

        // Calculate new order
        let newOrder = 1;

        if (targetLessonId && position) {
            const targetLesson = targetProject.lessons.find(l => l.id === targetLessonId);
            if (targetLesson) {
                if (position === 'before') {
                    newOrder = targetLesson.order;
                    // Update orders of lessons that need to shift down
                    await prisma.lesson.updateMany({
                        where: {
                            projectId: targetProjectId,
                            order: { gte: newOrder }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                } else { // after
                    newOrder = targetLesson.order + 1;
                    // Update orders of lessons that need to shift down
                    await prisma.lesson.updateMany({
                        where: {
                            projectId: targetProjectId,
                            order: { gte: newOrder }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                }
            }
        } else {
            // Move to end of target project
            const maxOrder = targetProject.lessons.reduce((max, lesson) =>
                Math.max(max, lesson.order), 0
            );
            newOrder = maxOrder + 1;
        }

        // Update the lesson
        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                projectId: targetProjectId,
                order: newOrder,
                updatedAt: new Date()
            }
        });

        // Reorder lessons in the original project to fill the gap
        if (lesson.projectId !== targetProjectId) {
            await prisma.lesson.updateMany({
                where: {
                    projectId: lesson.projectId,
                    order: { gt: lesson.order }
                },
                data: {
                    order: { decrement: 1 }
                }
            });
        }

        logger.info('Lesson moved successfully', {
            action: 'move',
            resource: 'lesson',
            resourceId: lessonId,
            userId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                fromProject: lesson.projectId,
                toProject: targetProjectId,
                newOrder,
                position
            }
        });

        // Revalidate relevant paths
        revalidatePath('/lms');
        revalidatePath(`/lms/courses/${lesson.project.courseId}`);
        revalidatePath(`/lms/courses/${targetProject.courseId}`);
        revalidatePath(`/lms/lessons/${lessonId}`);
        revalidatePath('/lms/admin');

        return {
            success: true,
            message: `Lesson "${lesson.title}" moved successfully`
        };

    } catch (error) {
        logger.error('Failed to move lesson', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                duration: Date.now() - startTime,
                lessonId: data.lessonId,
                targetProjectId: data.targetProjectId
            }
        });

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2003':
                    return {
                        success: false,
                        error: 'Invalid lesson or project reference'
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred'
                    };
            }
        }

        return {
            success: false,
            error: 'Failed to move lesson'
        };
    }
} 