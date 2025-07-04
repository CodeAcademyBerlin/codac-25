'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreateCourseData {
    title: string;
    description: string;
    category: 'WEB_DEVELOPMENT' | 'DATA_SCIENCE' | 'UX_UI_DESIGN' | 'DIGITAL_MARKETING' | 'CAREER_DEVELOPMENT' | 'SOFT_SKILLS';
    thumbnail?: string;
    duration?: number;
    isPublished?: boolean;
}

export async function createCourse(data: CreateCourseData) {
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
                error: 'Course title is required'
            };
        }

        if (!data.description.trim()) {
            return {
                success: false,
                error: 'Course description is required'
            };
        }

        // Get the next order value
        const lastCourse = await prisma.course.findFirst({
            orderBy: { order: 'desc' }
        });

        const course = await prisma.course.create({
            data: {
                title: data.title.trim(),
                description: data.description.trim(),
                category: data.category,
                thumbnail: data.thumbnail,
                duration: data.duration,
                isPublished: data.isPublished || false,
                order: (lastCourse?.order || 0) + 1,
            },
        });

        logger.info('Course created', {
            action: 'create',
            resource: 'course',
            resourceId: course.id,
            userId: user.id,
            metadata: {
                title: course.title,
                category: course.category,
                isPublished: course.isPublished
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath('/lms');

        return {
            success: true,
            data: course,
            message: `Course "${course.title}" created successfully`
        };

    } catch (error) {
        logger.error('Failed to create course', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to create course'
        };
    }
}

export async function updateCourse(id: string, data: Partial<CreateCourseData>) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const existingCourse = await prisma.course.findUnique({
            where: { id }
        });

        if (!existingCourse) {
            return {
                success: false,
                error: 'Course not found'
            };
        }

        const updateData: any = {};

        if (data.title !== undefined) {
            if (!data.title.trim()) {
                return {
                    success: false,
                    error: 'Course title cannot be empty'
                };
            }
            updateData.title = data.title.trim();
        }

        if (data.description !== undefined) {
            if (!data.description.trim()) {
                return {
                    success: false,
                    error: 'Course description cannot be empty'
                };
            }
            updateData.description = data.description.trim();
        }

        if (data.category !== undefined) updateData.category = data.category;
        if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

        const course = await prisma.course.update({
            where: { id },
            data: updateData,
        });

        logger.info('Course updated', {
            action: 'update',
            resource: 'course',
            resourceId: course.id,
            userId: user.id,
            metadata: {
                title: course.title,
                changes: Object.keys(updateData)
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${id}`);
        revalidatePath(`/lms/courses/${id}`);
        revalidatePath('/lms');

        return {
            success: true,
            data: course,
            message: `Course "${course.title}" updated successfully`
        };

    } catch (error) {
        logger.error('Failed to update course', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to update course'
        };
    }
}

export async function deleteCourse(id: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { enrollments: true }
                }
            }
        });

        if (!course) {
            return {
                success: false,
                error: 'Course not found'
            };
        }

        if (course._count.enrollments > 0) {
            return {
                success: false,
                error: 'Cannot delete course with enrolled students'
            };
        }

        await prisma.course.delete({
            where: { id }
        });

        logger.info('Course deleted', {
            action: 'delete',
            resource: 'course',
            resourceId: id,
            userId: user.id,
            metadata: { title: course.title }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath('/lms');

        return {
            success: true,
            message: `Course "${course.title}" deleted successfully`
        };

    } catch (error) {
        logger.error('Failed to delete course', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to delete course'
        };
    }
} 