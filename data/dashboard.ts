'use server';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface UserStats {
    coursesCompleted: number;
    coursesInProgress: number;
    totalEnrollments: number;
    averageProgress: number;
    studyStreak: number;
    monthlyStudyTime: number;
    documentsCount: number;
    achievementsCount: number;
}

export interface LearningProgressItem {
    id: string;
    name: string;
    progress: number;
    track: string;
    courseId: string;
    category: string;
}

export interface RecentActivityItem {
    id: string;
    type: 'course_enrollment' | 'lesson_completed' | 'course_completed';
    title: string;
    description: string;
    timestamp: Date;
    courseTitle?: string;
    lessonTitle?: string;
    progress?: number;
}

export async function getUserStats(): Promise<UserStats> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                coursesCompleted: 0,
                coursesInProgress: 0,
                totalEnrollments: 0,
                averageProgress: 0,
                studyStreak: 0,
                monthlyStudyTime: 0,
                documentsCount: 0,
                achievementsCount: 0,
            };
        }

        // Get course enrollments with progress
        const enrollments = await prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: {
                        projects: {
                            include: {
                                lessons: {
                                    include: {
                                        progress: {
                                            where: { userId: user.id },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Calculate stats
        const totalEnrollments = enrollments.length;
        const coursesCompleted = enrollments.filter(e => e.progress >= 100).length;
        const coursesInProgress = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;

        const averageProgress = totalEnrollments > 0
            ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrollments)
            : 0;

        // Calculate study time (approximate based on lesson progress)
        const monthlyStudyTime = enrollments.reduce((total, enrollment) => {
            return total + enrollment.course.projects.reduce((courseTotal, project) => {
                return courseTotal + project.lessons.reduce((lessonTotal, lesson) => {
                    const hasProgress = lesson.progress.length > 0;
                    return lessonTotal + (hasProgress ? (lesson.duration || 60) : 0);
                }, 0);
            }, 0);
        }, 0) / 60; // Convert minutes to hours

        // Get documents count
        const documentsCount = await prisma.document.count({
            where: { authorId: user.id },
        });

        // Get achievements count (if they exist)
        const achievementsCount = await prisma.userAchievement.count({
            where: { userId: user.id },
        });

        // Calculate study streak (simplified - consecutive days with lesson progress)
        const studyStreak = await calculateStudyStreak(user.id);

        return {
            coursesCompleted,
            coursesInProgress,
            totalEnrollments,
            averageProgress,
            studyStreak,
            monthlyStudyTime: Math.round(monthlyStudyTime),
            documentsCount,
            achievementsCount,
        };
    } catch (error) {
        logger.error('Failed to get user stats', error instanceof Error ? error : new Error(String(error)));
        return {
            coursesCompleted: 0,
            coursesInProgress: 0,
            totalEnrollments: 0,
            averageProgress: 0,
            studyStreak: 0,
            monthlyStudyTime: 0,
            documentsCount: 0,
            achievementsCount: 0,
        };
    }
}

export async function getLearningProgress(): Promise<LearningProgressItem[]> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return [];
        }

        const enrollments = await prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: {
                course: true,
            },
            orderBy: { enrolledAt: 'desc' },
            take: 4, // Show top 4 courses
        });

        return enrollments.map(enrollment => ({
            id: enrollment.id,
            name: enrollment.course.title,
            progress: enrollment.progress,
            track: getTrackSlug(enrollment.course.category),
            courseId: enrollment.course.id,
            category: enrollment.course.category,
        }));
    } catch (error) {
        logger.error('Failed to get learning progress', error instanceof Error ? error : new Error(String(error)));
        return [];
    }
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return [];
        }

        const activities: RecentActivityItem[] = [];

        // Get recent course enrollments
        const recentEnrollments = await prisma.courseEnrollment.findMany({
            where: { userId: user.id },
            include: { course: true },
            orderBy: { enrolledAt: 'desc' },
            take: 3,
        });

        recentEnrollments.forEach(enrollment => {
            activities.push({
                id: `enrollment-${enrollment.id}`,
                type: 'course_enrollment',
                title: `Enrolled in ${enrollment.course.title}`,
                description: `Started ${enrollment.course.category.replace('_', ' ').toLowerCase()} course`,
                timestamp: enrollment.enrolledAt,
                courseTitle: enrollment.course.title,
                progress: enrollment.progress,
            });
        });

        // Get recent lesson completions
        const recentLessonProgress = await prisma.lessonProgress.findMany({
            where: {
                userId: user.id,
                status: 'COMPLETED',
            },
            include: {
                lesson: {
                    include: {
                        project: {
                            include: {
                                course: true,
                            },
                        },
                    },
                },
            },
            orderBy: { completedAt: 'desc' },
            take: 5,
        });

        recentLessonProgress.forEach(progress => {
            if (progress.completedAt) {
                activities.push({
                    id: `lesson-${progress.id}`,
                    type: 'lesson_completed',
                    title: `Completed ${progress.lesson.title}`,
                    description: `Finished lesson in ${progress.lesson.project.course.title}`,
                    timestamp: progress.completedAt,
                    courseTitle: progress.lesson.project.course.title,
                    lessonTitle: progress.lesson.title,
                });
            }
        });

        // Sort all activities by timestamp and return most recent
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 6);
    } catch (error) {
        logger.error('Failed to get recent activity', error instanceof Error ? error : new Error(String(error)));
        return [];
    }
}

function getTrackSlug(category: string): string {
    switch (category) {
        case 'WEB_DEVELOPMENT':
            return 'web';
        case 'DATA_SCIENCE':
            return 'data';
        case 'CAREER_DEVELOPMENT':
            return 'career';
        default:
            return 'general';
    }
}

async function calculateStudyStreak(userId: string): Promise<number> {
    try {
        // Get lesson progress for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentProgress = await prisma.lessonProgress.findMany({
            where: {
                userId,
                startedAt: {
                    gte: thirtyDaysAgo,
                },
            },
            orderBy: { startedAt: 'desc' },
        });

        if (recentProgress.length === 0) return 0;

        // Group by date and count consecutive days
        const progressByDate = new Map<string, boolean>();
        recentProgress.forEach(progress => {
            if (progress.startedAt) {
                const dateKey = progress.startedAt.toDateString();
                progressByDate.set(dateKey, true);
            }
        });

        // Calculate streak
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateKey = checkDate.toDateString();

            if (progressByDate.has(dateKey)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    } catch (error) {
        logger.error('Failed to calculate study streak', error instanceof Error ? error : new Error(String(error)));
        return 0;
    }
} 