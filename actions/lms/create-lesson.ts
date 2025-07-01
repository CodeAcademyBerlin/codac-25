'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreateLessonData {
    title: string;
    description?: string;
    content?: any; // JSON content for the Plate editor
    type?: 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'QUIZ' | 'EXERCISE';
    duration?: number;
    isPublished?: boolean;
    projectId: string;
}

export async function createLesson(data: CreateLessonData) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        // Validate required fields
        if (!data.title.trim()) {
            return {
                success: false,
                error: 'Lesson title is required'
            };
        }

        // Verify project exists
        const project = await prisma.project.findUnique({
            where: { id: data.projectId },
            include: { course: true }
        });

        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            };
        }

        // Get the next order value for this project
        const lastLesson = await prisma.lesson.findFirst({
            where: { projectId: data.projectId },
            orderBy: { order: 'desc' }
        });

        const lesson = await prisma.lesson.create({
            data: {
                title: data.title.trim(),
                description: data.description?.trim(),
                content: data.content || [],
                type: data.type || 'TEXT',
                duration: data.duration,
                isPublished: data.isPublished || false,
                projectId: data.projectId,
                order: (lastLesson?.order || 0) + 1,
            },
        });

        logger.info('Lesson created', {
            action: 'create',
            resource: 'lesson',
            resourceId: lesson.id,
            userId: user.id,
            metadata: {
                title: lesson.title,
                projectId: data.projectId,
                courseId: project.courseId,
                type: lesson.type,
                isPublished: lesson.isPublished
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${project.courseId}`);
        revalidatePath(`/lms/courses/${project.courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            data: lesson,
            message: `Lesson "${lesson.title}" created successfully`
        };

    } catch (error) {
        logger.error('Failed to create lesson', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to create lesson'
        };
    }
}

export async function updateLessonDetails(id: string, data: Partial<CreateLessonData>) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const existingLesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                project: {
                    include: { course: true }
                }
            }
        });

        if (!existingLesson) {
            return {
                success: false,
                error: 'Lesson not found'
            };
        }

        const updateData: any = {};

        if (data.title !== undefined) {
            if (!data.title.trim()) {
                return {
                    success: false,
                    error: 'Lesson title cannot be empty'
                };
            }
            updateData.title = data.title.trim();
        }

        if (data.description !== undefined) {
            updateData.description = data.description?.trim();
        }

        if (data.type !== undefined) updateData.type = data.type;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

        const lesson = await prisma.lesson.update({
            where: { id },
            data: updateData,
        });

        logger.info('Lesson updated', {
            action: 'update',
            resource: 'lesson',
            resourceId: lesson.id,
            userId: user.id,
            metadata: {
                title: lesson.title,
                projectId: existingLesson.projectId,
                courseId: existingLesson.project.courseId,
                changes: Object.keys(updateData)
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${existingLesson.project.courseId}`);
        revalidatePath(`/lms/courses/${existingLesson.project.courseId}`);
        revalidatePath(`/lms/lessons/${id}`);
        revalidatePath('/lms');

        return {
            success: true,
            data: lesson,
            message: `Lesson "${lesson.title}" updated successfully`
        };

    } catch (error) {
        logger.error('Failed to update lesson', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to update lesson'
        };
    }
}

export async function deleteLesson(id: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                project: {
                    include: { course: true }
                },
                _count: {
                    select: { progress: true }
                }
            }
        });

        if (!lesson) {
            return {
                success: false,
                error: 'Lesson not found'
            };
        }

        // Allow deletion even if there's progress (admin decision)
        // But warn if there are student progress records
        let warningMessage = '';
        if (lesson._count.progress > 0) {
            warningMessage = ` Warning: ${lesson._count.progress} student progress records were also deleted.`;
        }

        await prisma.lesson.delete({
            where: { id }
        });

        logger.info('Lesson deleted', {
            action: 'delete',
            resource: 'lesson',
            resourceId: id,
            userId: user.id,
            metadata: {
                title: lesson.title,
                projectId: lesson.projectId,
                courseId: lesson.project.courseId,
                progressRecordsDeleted: lesson._count.progress
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${lesson.project.courseId}`);
        revalidatePath(`/lms/courses/${lesson.project.courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            message: `Lesson "${lesson.title}" deleted successfully.${warningMessage}`
        };

    } catch (error) {
        logger.error('Failed to delete lesson', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to delete lesson'
        };
    }
} 