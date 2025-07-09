import fs from 'fs';
import path from 'path';
import { PrismaClient, UserRole, UserStatus, CourseCategory, LessonProgressStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../../../lib/logger';
import { encodeSeedImageToBase64 } from '../../../lib/imaging/encode-image-to-base64';

const prisma = new PrismaClient();

interface CourseEnrollment {
    courseSlug: string;
    progress: number;
    enrolledAt: string;
}

interface BlackOwlsUser {
    name: string;
    email: string;
    role: string;
    status: string;
    cohort: string;
    bio: string;
    image: string;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    courseEnrollments: CourseEnrollment[];
}

interface BlackOwlsCohort {
    name: string;
    slug: string;
    startDate: string;
    description: string;
    avatar: string;
    image: string;
}

interface CourseData {
    id: number;
    name: string;
    description: string;
    slug: string;
    category: string;
    duration: number;
    isPublished: boolean;
    order: number;
}

export async function seedBlackOwls() {
    try {
        logger.info('🦉 Starting Black Owls seed...');

        // Hash default password
        const defaultPassword = await bcrypt.hash('password123', 10);

        // Load data from JSON files
        const cohortData: BlackOwlsCohort = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/black-owls-cohort.json'), 'utf-8')
        );
        const usersData: BlackOwlsUser[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/black-owls-users.json'), 'utf-8')
        );
        const coursesData: CourseData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/courses.json'), 'utf-8')
        );

        // Clean existing Black Owls data
        logger.info('🧹 Cleaning existing Black Owls data...');
        await prisma.lessonProgress.deleteMany({
            where: {
                user: {
                    email: { in: usersData.map(u => u.email) }
                }
            }
        });
        await prisma.courseEnrollment.deleteMany({
            where: {
                user: {
                    email: { in: usersData.map(u => u.email) }
                }
            }
        });
        await prisma.user.deleteMany({
            where: {
                email: { in: usersData.map(u => u.email) }
            }
        });
        await prisma.cohort.deleteMany({
            where: { slug: cohortData.slug }
        });

        // Create Black Owls cohort
        logger.info('🏫 Creating Black Owls cohort...');
        const cohortImageBase64 = await encodeSeedImageToBase64(cohortData.image);
        const cohort = await prisma.cohort.create({
            data: {
                name: cohortData.name,
                slug: cohortData.slug,
                startDate: new Date(cohortData.startDate),
                description: cohortData.description,
                image: cohortImageBase64,
            },
        });

        // Ensure courses exist
        logger.info('📖 Ensuring courses exist...');
        const courses = await Promise.all(
            coursesData.map(async (courseData) => {
                const existingCourse = await prisma.course.findFirst({
                    where: { title: courseData.name }
                });

                if (existingCourse) {
                    return { ...existingCourse, slug: courseData.slug };
                }

                const course = await prisma.course.create({
                    data: {
                        title: courseData.name,
                        description: courseData.description,
                        category: courseData.category as CourseCategory,
                        duration: courseData.duration,
                        isPublished: courseData.isPublished,
                        order: courseData.order,
                    },
                });
                return { ...course, slug: courseData.slug };
            })
        );

        // Create projects and lessons for each course
        logger.info('📋 Creating projects and lessons...');
        const courseWithProjects = await Promise.all(
            courses.map(async (course) => {
                // Check if project already exists
                const existingProject = await prisma.project.findFirst({
                    where: {
                        courseId: course.id,
                        title: `${course.title} - Main Project`
                    }
                });

                let project;
                if (existingProject) {
                    project = existingProject;
                } else {
                    project = await prisma.project.create({
                        data: {
                            title: `${course.title} - Main Project`,
                            description: `Main project for ${course.title}`,
                            courseId: course.id,
                            duration: Math.floor(course.duration || 60),
                            isPublished: true,
                            order: 1,
                        },
                    });
                }

                // Create sample lessons for each project
                const existingLessons = await prisma.lesson.findMany({
                    where: { projectId: project.id }
                });

                if (existingLessons.length === 0) {
                    const lessons = await Promise.all([
                        prisma.lesson.create({
                            data: {
                                title: `${course.title} - Introduction`,
                                description: `Introduction to ${course.title}`,
                                content: [
                                    {
                                        type: 'h1',
                                        children: [{ text: `Welcome to ${course.title}` }],
                                    },
                                    {
                                        type: 'p',
                                        children: [{ text: course.description }],
                                    },
                                ],
                                type: 'TEXT',
                                projectId: project.id,
                                duration: 30,
                                order: 1,
                                isPublished: true,
                            },
                        }),
                        prisma.lesson.create({
                            data: {
                                title: `${course.title} - Fundamentals`,
                                description: `Core concepts of ${course.title}`,
                                content: [
                                    {
                                        type: 'h1',
                                        children: [{ text: `${course.title} Fundamentals` }],
                                    },
                                    {
                                        type: 'p',
                                        children: [{ text: 'Learn the fundamental concepts and best practices.' }],
                                    },
                                ],
                                type: 'TEXT',
                                projectId: project.id,
                                duration: 60,
                                order: 2,
                                isPublished: true,
                            },
                        }),
                        prisma.lesson.create({
                            data: {
                                title: `${course.title} - Practical Application`,
                                description: `Hands-on practice with ${course.title}`,
                                content: [
                                    {
                                        type: 'h1',
                                        children: [{ text: `${course.title} in Practice` }],
                                    },
                                    {
                                        type: 'p',
                                        children: [{ text: 'Apply your knowledge through practical exercises and projects.' }],
                                    },
                                ],
                                type: 'EXERCISE',
                                projectId: project.id,
                                duration: 90,
                                order: 3,
                                isPublished: true,
                            },
                        }),
                    ]);
                    return { ...course, project, lessons };
                } else {
                    return { ...course, project, lessons: existingLessons };
                }
            })
        );

        // Create Black Owls students
        logger.info('👥 Creating Black Owls students...');
        const students = await Promise.all(
            usersData.map(async (userData) => {
                const userImageBase64 = await encodeSeedImageToBase64(userData.image);
                const student = await prisma.user.create({
                    data: {
                        name: userData.name,
                        email: userData.email,
                        password: defaultPassword,
                        role: userData.role as UserRole,
                        status: userData.status as UserStatus,
                        bio: userData.bio,
                        image: userImageBase64,
                        githubUrl: userData.githubUrl,
                        linkedinUrl: userData.linkedinUrl,
                        portfolioUrl: userData.portfolioUrl,
                        cohortId: cohort.id,
                    },
                });
                return { ...student, enrollments: userData.courseEnrollments };
            })
        );

        // Create course enrollments and lesson progress
        logger.info('📝 Creating course enrollments and progress...');
        for (const student of students) {
            for (const enrollment of student.enrollments) {
                // Find the course by slug
                const course = courseWithProjects.find(c => c.slug === enrollment.courseSlug);
                if (!course) {
                    logger.warn(`⚠️ Course not found for slug: ${enrollment.courseSlug}`);
                    continue;
                }

                // Create course enrollment
                await prisma.courseEnrollment.create({
                    data: {
                        userId: student.id,
                        courseId: course.id,
                        enrolledAt: new Date(enrollment.enrolledAt),
                        progress: enrollment.progress,
                    },
                });

                // Create lesson progress for each lesson based on overall progress
                for (const lesson of course.lessons) {
                    let lessonStatus: LessonProgressStatus = 'NOT_STARTED';

                    // Determine lesson status based on course progress and lesson order
                    if (enrollment.progress >= 90) {
                        lessonStatus = 'COMPLETED';
                    } else if (enrollment.progress >= 50 && lesson.order <= 2) {
                        lessonStatus = 'COMPLETED';
                    } else if (enrollment.progress >= 20 && lesson.order === 1) {
                        lessonStatus = 'COMPLETED';
                    } else if (enrollment.progress >= 10) {
                        lessonStatus = 'IN_PROGRESS';
                    }

                    await prisma.lessonProgress.create({
                        data: {
                            userId: student.id,
                            lessonId: lesson.id,
                            status: lessonStatus,
                            startedAt: lessonStatus !== 'NOT_STARTED' ? new Date(enrollment.enrolledAt) : null,
                            completedAt: lessonStatus === 'COMPLETED' ? new Date() : null,
                            timeSpent: lessonStatus === 'COMPLETED' ? lesson.duration || 30 : 0,
                        },
                    });
                }
            }
        }

        logger.info('✅ Black Owls seed completed successfully!');
        logger.info(`🏫 Cohort: ${cohort.name}`);
        logger.info(`👥 Students: ${students.length}`);
        logger.info(`📖 Courses: ${courses.length}`);
        logger.info(`📋 Projects: ${courseWithProjects.length}`);
        logger.info(`🎯 Enrollments: ${students.reduce((sum, s) => sum + s.enrollments.length, 0)}`);
        logger.info('🔐 Default password for all users: password123');

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Black Owls seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanBlackOwls() {
    try {
        logger.info('🧹 Cleaning Black Owls data...');

        const usersData: BlackOwlsUser[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/black-owls-users.json'), 'utf-8')
        );
        const cohortData: BlackOwlsCohort = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/black-owls-cohort.json'), 'utf-8')
        );

        await prisma.lessonProgress.deleteMany({
            where: {
                user: {
                    email: { in: usersData.map(u => u.email) }
                }
            }
        });
        await prisma.courseEnrollment.deleteMany({
            where: {
                user: {
                    email: { in: usersData.map(u => u.email) }
                }
            }
        });
        await prisma.user.deleteMany({
            where: {
                email: { in: usersData.map(u => u.email) }
            }
        });
        await prisma.cohort.deleteMany({
            where: { slug: cohortData.slug }
        });

        logger.info('✅ Black Owls data cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean Black Owls data:', errorMessage);
        throw errorMessage;
    }
} 