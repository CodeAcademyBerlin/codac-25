'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function enrollInCourse(courseId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });

        if (existingEnrollment) {
            return {
                success: false,
                error: 'Already enrolled in this course'
            };
        }

        // Check if course exists and is published
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, isPublished: true, title: true },
        });

        if (!course || !course.isPublished) {
            return {
                success: false,
                error: 'Course not found or not available'
            };
        }

        // Create enrollment
        await prisma.courseEnrollment.create({
            data: {
                userId: user.id,
                courseId: courseId,
            },
        });

        logger.info('User enrolled in course', {
            action: 'enroll',
            resource: 'course',
            resourceId: courseId,
            userId: user.id,
            metadata: { courseTitle: course.title }
        });

        // Revalidate relevant paths
        revalidatePath('/lms');
        revalidatePath(`/lms/courses/${courseId}`);

        return {
            success: true,
            message: `Successfully enrolled in ${course.title}`
        };

    } catch (error) {
        logger.error('Failed to enroll in course', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to enroll in course'
        };
    }
}

export async function unenrollFromCourse(courseId: string) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
            include: {
                course: {
                    select: { title: true },
                },
            },
        });

        if (!enrollment) {
            return {
                success: false,
                error: 'Not enrolled in this course'
            };
        }

        // Remove enrollment
        await prisma.courseEnrollment.delete({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });

        logger.info('User unenrolled from course', {
            action: 'unenroll',
            resource: 'course',
            resourceId: courseId,
            userId: user.id,
            metadata: { courseTitle: enrollment.course.title }
        });

        // Revalidate relevant paths
        revalidatePath('/lms');
        revalidatePath(`/lms/courses/${courseId}`);

        return {
            success: true,
            message: `Successfully unenrolled from ${enrollment.course.title}`
        };

    } catch (error) {
        logger.error('Failed to unenroll from course', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to unenroll from course'
        };
    }
} 