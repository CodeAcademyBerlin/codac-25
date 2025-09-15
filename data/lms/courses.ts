'use server';

import { Prisma } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

// Type definitions
export type CourseWithProgress = Prisma.CourseGetPayload<{
    include: {
        projects: {
            include: {
                lessons: {
                    include: {
                        progress: true;
                    };
                };
            };
        };
        enrollments: {
            include: {
                user: {
                    select: {
                        id: true;
                        name: true;
                        avatar: true;
                    };
                };
            };
        };
        _count: {
            select: {
                enrollments: true;
                projects: true;
            };
        };
    };
}>;

export type LessonWithProgress = Prisma.LessonGetPayload<{
    include: {
        project: {
            include: {
                course: true;
            };
        };
        progress: true;
        assignments: {
            include: {
                submissions: true;
            };
        };
        resources: true;
    };
}>;

// Get all courses with enrollment status for current user
export async function getCourses(category?: string) {
    try {
        const user = await getCurrentUser();

        const where: Prisma.CourseWhereInput = {
            isPublished: true,
        };

        if (category) {
            where.category = category as any;
        }

        const courses = await prisma.course.findMany({
            where,
            include: {
                projects: {
                    where: { isPublished: true },
                    include: {
                        lessons: {
                            where: { isPublished: true },
                            include: {
                                progress: user ? {
                                    where: { userId: user.id },
                                } : false,
                            },
                        },
                    },
                },
                enrollments: user ? {
                    where: { userId: user.id },
                } : false,
                _count: {
                    select: {
                        enrollments: true,
                        projects: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        return courses;
    } catch (error) {
        logger.error('Failed to get courses', error instanceof Error ? error : new Error(String(error)));
        return [];
    }
}

// Get single course with detailed information
export async function getCourse(id: string): Promise<CourseWithProgress | null> {
    try {
        const user = await getCurrentUser();

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                projects: {
                    where: { isPublished: true },
                    include: {
                        lessons: {
                            where: { isPublished: true },
                            include: {
                                progress: user ? {
                                    where: { userId: user.id },
                                } : false,
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                enrollments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        enrollments: true,
                        projects: true,
                    },
                },
            },
        });

        // Check if user has access to this course
        if (course && user) {
            const isEnrolled = course.enrollments.some(e => e.userId === user.id);
            const canAccess = isEnrolled || ['ADMIN', 'MENTOR'].includes(user.role);

            if (!canAccess) {
                return null;
            }
        }

        return course as CourseWithProgress;
    } catch (error) {
        logger.error('Failed to get course', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

// Get single lesson with full details
export async function getLesson(id: string): Promise<LessonWithProgress | null> {
    try {
        const user = await getCurrentUser();

        const lesson = await prisma.lesson.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        course: {
                            include: {
                                enrollments: user ? {
                                    where: { userId: user.id },
                                } : false,
                            },
                        },
                    },
                },
                progress: user ? {
                    where: { userId: user.id },
                } : false,
                assignments: {
                    include: {
                        submissions: user ? {
                            where: { userId: user.id },
                        } : false,
                    },
                },
                resources: true,
            },
        });

        // Check if user has access to this lesson
        if (lesson && user) {
            const isEnrolled = lesson.project.course.enrollments.length > 0;
            const canAccess = isEnrolled || ['ADMIN', 'MENTOR'].includes(user.role);

            if (!canAccess) {
                return null;
            }
        }

        return lesson as LessonWithProgress;
    } catch (error) {
        logger.error('Failed to get lesson', error instanceof Error ? error : new Error(String(error)));
        return null;
    }
}

// Check if user can edit course content (admin/mentor only)
export async function canEditCourse(_courseId: string): Promise<boolean> {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Failed to check edit permissions', error instanceof Error ? error : new Error(String(error)));
        return false;
    }
}

// Get previous and next lessons for navigation
export async function getLessonNavigation(lessonId: string) {
    try {
        const user = await getCurrentUser();

        // Get the current lesson with its project
        const currentLesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                project: {
                    include: {
                        course: {
                            include: {
                                enrollments: user ? {
                                    where: { userId: user.id },
                                } : false,
                            },
                        },
                    },
                },
            },
        });

        if (!currentLesson) {
            return { previousLesson: null, nextLesson: null };
        }

        // Check if user has access to this lesson
        if (user) {
            const isEnrolled = currentLesson.project.course.enrollments.length > 0;
            const canAccess = isEnrolled || ['ADMIN', 'MENTOR'].includes(user.role);

            if (!canAccess) {
                return { previousLesson: null, nextLesson: null };
            }
        }

        // Get all lessons in the same project, ordered by order field
        const allLessons = await prisma.lesson.findMany({
            where: {
                projectId: currentLesson.projectId,
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                order: true,
            },
            orderBy: { order: 'asc' },
        });

        // Find current lesson index
        const currentIndex = allLessons.findIndex(lesson => lesson.id === lessonId);

        if (currentIndex === -1) {
            return { previousLesson: null, nextLesson: null };
        }

        // Get previous and next lessons
        const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        return { previousLesson, nextLesson };
    } catch (error) {
        logger.error('Failed to get lesson navigation', error instanceof Error ? error : new Error(String(error)));
        return { previousLesson: null, nextLesson: null };
    }
}

// Get user's enrolled courses
export async function getEnrolledCourses() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return [];
        }

        const enrollments = await prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: {
                        projects: {
                            where: { isPublished: true },
                            include: {
                                lessons: {
                                    where: { isPublished: true },
                                    include: {
                                        progress: {
                                            where: { userId: user.id },
                                        },
                                    },
                                },
                            },
                        },
                        _count: {
                            select: {
                                enrollments: true,
                                projects: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });

        return enrollments.map(enrollment => enrollment.course);
    } catch (error) {
        logger.error('Failed to get enrolled courses', error instanceof Error ? error : new Error(String(error)));
        return [];
    }
} 