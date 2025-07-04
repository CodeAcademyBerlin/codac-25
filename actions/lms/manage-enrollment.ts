'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function enrollStudent(userId: string, courseId: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        // Verify student exists
        const student = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!student) {
            return {
                success: false,
                error: 'Student not found'
            };
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, isPublished: true }
        });

        if (!course) {
            return {
                success: false,
                error: 'Course not found'
            };
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: userId,
                    courseId: courseId,
                },
            },
        });

        if (existingEnrollment) {
            return {
                success: false,
                error: `${student.name || student.email} is already enrolled in this course`
            };
        }

        // Create enrollment
        await prisma.courseEnrollment.create({
            data: {
                userId: userId,
                courseId: courseId,
            },
        });

        logger.info('Student enrolled by admin', {
            action: 'admin_enroll',
            resource: 'course',
            resourceId: courseId,
            userId: user.id,
            metadata: { 
                studentId: userId,
                studentName: student.name,
                courseTitle: course.title 
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath('/lms/admin/enrollments');
        revalidatePath(`/lms/admin/courses/${courseId}`);
        revalidatePath(`/lms/courses/${courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            message: `Successfully enrolled ${student.name || student.email} in ${course.title}`
        };

    } catch (error) {
        logger.error('Failed to enroll student', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to enroll student'
        };
    }
}

export async function unenrollStudent(userId: string, courseId: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const enrollment = await prisma.courseEnrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: userId,
                    courseId: courseId,
                },
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                course: {
                    select: { title: true }
                }
            }
        });

        if (!enrollment) {
            return {
                success: false,
                error: 'Enrollment not found'
            };
        }

        // Remove enrollment (this will also cascade delete progress records)
        await prisma.courseEnrollment.delete({
            where: {
                userId_courseId: {
                    userId: userId,
                    courseId: courseId,
                },
            },
        });

        logger.info('Student unenrolled by admin', {
            action: 'admin_unenroll',
            resource: 'course',
            resourceId: courseId,
            userId: user.id,
            metadata: { 
                studentId: userId,
                studentName: enrollment.user.name,
                courseTitle: enrollment.course.title 
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath('/lms/admin/enrollments');
        revalidatePath(`/lms/admin/courses/${courseId}`);
        revalidatePath(`/lms/courses/${courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            message: `Successfully unenrolled ${enrollment.user.name || enrollment.user.email} from ${enrollment.course.title}`
        };

    } catch (error) {
        logger.error('Failed to unenroll student', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to unenroll student'
        };
    }
}

export async function bulkEnrollStudents(userIds: string[], courseId: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true }
        });

        if (!course) {
            return {
                success: false,
                error: 'Course not found'
            };
        }

        // Get existing enrollments to avoid duplicates
        const existingEnrollments = await prisma.courseEnrollment.findMany({
            where: {
                courseId: courseId,
                userId: { in: userIds }
            },
            select: { userId: true }
        });

        const existingUserIds = new Set(existingEnrollments.map(e => e.userId));
        const newUserIds = userIds.filter(id => !existingUserIds.has(id));

        if (newUserIds.length === 0) {
            return {
                success: false,
                error: 'All selected students are already enrolled'
            };
        }

        // Verify all users exist
        const users = await prisma.user.findMany({
            where: { id: { in: newUserIds } },
            select: { id: true, name: true, email: true }
        });

        if (users.length !== newUserIds.length) {
            return {
                success: false,
                error: 'Some users were not found'
            };
        }

        // Create bulk enrollments
        await prisma.courseEnrollment.createMany({
            data: newUserIds.map(userId => ({
                userId,
                courseId
            }))
        });

        logger.info('Bulk student enrollment', {
            action: 'bulk_enroll',
            resource: 'course',
            resourceId: courseId,
            userId: user.id,
            metadata: { 
                courseTitle: course.title,
                enrolledCount: newUserIds.length,
                skippedCount: userIds.length - newUserIds.length
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath('/lms/admin/enrollments');
        revalidatePath(`/lms/admin/courses/${courseId}`);
        revalidatePath(`/lms/courses/${courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            message: `Successfully enrolled ${newUserIds.length} students in ${course.title}${
                userIds.length - newUserIds.length > 0 
                    ? ` (${userIds.length - newUserIds.length} were already enrolled)` 
                    : ''
            }`
        };

    } catch (error) {
        logger.error('Failed to bulk enroll students', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to enroll students'
        };
    }
}

export async function getEnrollmentStats() {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions'
            };
        }

        const [totalEnrollments, courseStats, recentEnrollments] = await Promise.all([
            prisma.courseEnrollment.count(),
            prisma.course.findMany({
                select: {
                    id: true,
                    title: true,
                    _count: {
                        select: { enrollments: true }
                    }
                },
                orderBy: {
                    enrollments: {
                        _count: 'desc'
                    }
                }
            }),
            prisma.courseEnrollment.findMany({
                take: 10,
                orderBy: { enrolledAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true, avatar: true }
                    },
                    course: {
                        select: { title: true }
                    }
                }
            })
        ]);

        return {
            success: true,
            data: {
                totalEnrollments,
                courseStats,
                recentEnrollments
            }
        };

    } catch (error) {
        logger.error('Failed to get enrollment stats', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to get enrollment statistics'
        };
    }
} 