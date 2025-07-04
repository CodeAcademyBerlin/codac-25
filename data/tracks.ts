import { CourseCategory } from '@prisma/client';
import { cache } from 'react';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from "@/lib/db";

// Map track names to course categories
const TRACK_CATEGORY_MAP: Record<string, CourseCategory> = {
    'web': CourseCategory.WEB_DEVELOPMENT,
    'data': CourseCategory.DATA_SCIENCE,
    'career': CourseCategory.CAREER_DEVELOPMENT,
};

// Map track names to display information
const TRACK_INFO_MAP: Record<string, { title: string; description: string }> = {
    'web': {
        title: 'Web Development',
        description: 'Learn to build modern web applications with HTML, CSS, JavaScript, and React'
    },
    'data': {
        title: 'Data Science',
        description: 'Master data analysis, visualization, and machine learning with Python'
    },
    'career': {
        title: 'Career Services',
        description: 'Prepare for your job search with CV writing, interview skills, and networking'
    }
};

// Get a demo user for testing - in a real app, this would come from authentication
// async function getDemoUser() {
//     // Try to find a student user to use for demo purposes
//     let user = await prisma.user.findFirst({
//         where: {
//             role: 'STUDENT',
//             status: 'ACTIVE'
//         },
//     });

//     // If no student found, create a demo user
//     if (!user) {
//         user = await prisma.user.create({
//             data: {
//                 email: 'demo@example.com',
//                 name: 'Demo User',
//                 role: 'STUDENT',
//                 status: 'ACTIVE',
//             },
//         });
//     }

//     return user;
// }

export const getTrackProgress = cache(async (trackName: string) => {
    try {
        const user = await getCurrentUser();
        const category = TRACK_CATEGORY_MAP[trackName];
        const trackInfo = TRACK_INFO_MAP[trackName];

        if (!category || !trackInfo || !user) {
            return {
                ...trackInfo,
                progress: 0,
                currentLesson: 'Not enrolled',
                totalLessons: 0,
                completedLessons: 0,
                estimatedTime: '4 weeks',
                isEnrolled: false,
            };
        }

        // Get all courses for this track/category
        const courses = await prisma.course.findMany({
            where: {
                category,
                isPublished: true,
            },
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
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                enrollments: {
                    where: { userId: user.id },
                },
            },
            orderBy: { order: 'asc' },
        });

        if (courses.length === 0) {
            return {
                ...trackInfo,
                progress: 0,
                currentLesson: 'No lessons available',
                totalLessons: 0,
                completedLessons: 0,
                estimatedTime: '4 weeks',
                isEnrolled: false,
            };
        }

        // Calculate overall progress
        let totalLessons = 0;
        let completedLessons = 0;
        let totalDuration = 0;
        let currentLesson = 'Getting Started';
        let isEnrolled = false;
        let currentLessonFound = false;

        for (const course of courses) {
            // Check if user is enrolled in any course
            if (course.enrollments.length > 0) {
                isEnrolled = true;
            }

            totalDuration += course.duration || 0;

            for (const project of course.projects) {
                for (const lesson of project.lessons) {
                    totalLessons++;

                    if (lesson.progress.length > 0) {
                        const progress = lesson.progress[0];
                        if (progress.status === 'COMPLETED') {
                            completedLessons++;
                        } else if (progress.status === 'IN_PROGRESS' && !currentLessonFound) {
                            currentLesson = lesson.title;
                            currentLessonFound = true;
                        }
                    } else if (!currentLessonFound && isEnrolled) {
                        // First lesson without progress is the current one
                        currentLesson = lesson.title;
                        currentLessonFound = true;
                    }
                }
            }
        }

        // If enrolled but no current lesson found (all completed), show last lesson
        if (isEnrolled && !currentLessonFound && completedLessons === totalLessons && totalLessons > 0) {
            currentLesson = 'Track Completed!';
        }

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        const estimatedWeeks = Math.ceil(totalDuration / 40); // Assuming 40 hours per week
        const estimatedTime = estimatedWeeks > 0 ? `${estimatedWeeks} weeks` : '4 weeks';

        return {
            ...trackInfo,
            progress,
            currentLesson,
            totalLessons,
            completedLessons,
            estimatedTime,
            isEnrolled,
        };
    } catch (error) {
        console.error(`Error getting track progress for ${trackName}:`, error);
        const trackInfo = TRACK_INFO_MAP[trackName];
        return {
            ...trackInfo,
            progress: 0,
            currentLesson: 'Error loading',
            totalLessons: 0,
            completedLessons: 0,
            estimatedTime: '4 weeks',
            isEnrolled: false,
        };
    }
});

export const getAllTracks = cache(async () => {
    const tracks = await Promise.all([
        getTrackProgress('web'),
        getTrackProgress('data'),
        getTrackProgress('career'),
    ]);

    return tracks.filter(track => track !== null);
}); 