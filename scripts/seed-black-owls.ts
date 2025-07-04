#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

import { PrismaClient, UserRole, UserStatus, CourseCategory, LessonProgressStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CourseEnrollment {
    courseSlug: string;
    progress: number;
    enrolledAt: string;
}

interface Student {
    name: string;
    email: string;
    role: string;
    status: string;
    bio: string;
    avatar: string;
    githubUrl: string;
    linkedinUrl: string;
    portfolioUrl: string;
    courseEnrollments: CourseEnrollment[];
}

interface BlackOwlsData {
    cohort: {
        name: string;
        slug: string;
        startDate: string;
        description: string;
        avatar: string;
        image: string;
    };
    students: Student[];
    sampleJobs: any[];
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

async function main() {
    console.log('🦉 Starting Black Owls Seed Script...');

    // Hash default password for all seeded users
    const defaultPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Default password for all users: password123');

    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.lessonProgress.deleteMany();
    await prisma.courseEnrollment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.project.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    await prisma.cohort.deleteMany();

    // Load seed data from JSON files
    console.log('📚 Loading seed data...');
    const blackOwlsData: BlackOwlsData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'prisma/seed/black-owls-demo.json'), 'utf-8')
    );
    const coursesData: CourseData[] = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'prisma/seed/courses.json'), 'utf-8')
    );

    // Create Black Owls cohort
    console.log('🏫 Creating Black Owls cohort...');
    const cohort = await prisma.cohort.create({
        data: {
            name: blackOwlsData.cohort.name,
            slug: blackOwlsData.cohort.slug,
            startDate: new Date(blackOwlsData.cohort.startDate),
            description: blackOwlsData.cohort.description,
            avatar: blackOwlsData.cohort.avatar,
            image: blackOwlsData.cohort.image,
        },
    });
    console.log(`✅ Created cohort: ${cohort.name}`);

    // Create courses from courses.json
    console.log('📖 Creating courses...');
    const courses = await Promise.all(
        coursesData.map(async (courseData) => {
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
            console.log(`✅ Created course: ${course.title}`);
            return { ...course, slug: courseData.slug };
        })
    );

    // Create projects and lessons for each course
    console.log('📋 Creating projects and lessons...');
    const courseWithProjects = await Promise.all(
        courses.map(async (course) => {
            // Create a default project for each course
            const project = await prisma.project.create({
                data: {
                    title: `${course.title} - Main Project`,
                    description: `Main project for ${course.title}`,
                    courseId: course.id,
                    duration: Math.floor(course.duration || 60),
                    isPublished: true,
                    order: 1,
                },
            });

            // Create sample lessons for each project
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

            console.log(`✅ Created project and lessons for: ${course.title}`);
            return { ...course, project, lessons };
        })
    );

    // Create Black Owls students
    console.log('👥 Creating Black Owls students...');
    const students = await Promise.all(
        blackOwlsData.students.map(async (studentData) => {
            const student = await prisma.user.create({
                data: {
                    name: studentData.name,
                    email: studentData.email,
                    password: defaultPassword,
                    role: studentData.role as UserRole,
                    status: studentData.status as UserStatus,
                    bio: studentData.bio,
                    image: studentData.avatar,
                    githubUrl: studentData.githubUrl,
                    linkedinUrl: studentData.linkedinUrl,
                    portfolioUrl: studentData.portfolioUrl,
                    cohortId: cohort.id,
                },
            });
            console.log(`✅ Created student: ${student.name}`);
            return { ...student, enrollments: studentData.courseEnrollments };
        })
    );

    // Create course enrollments and lesson progress
    console.log('📝 Creating course enrollments and progress...');
    for (const student of students) {
        for (const enrollment of student.enrollments) {
            // Find the course by slug
            const course = courseWithProjects.find(c => c.slug === enrollment.courseSlug);
            if (!course) {
                console.warn(`⚠️  Course not found for slug: ${enrollment.courseSlug}`);
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

            console.log(`✅ Created enrollment for ${student.name} in ${course.title} (${enrollment.progress}%)`);
        }
    }

    // Create admin user
    console.log('👨‍💼 Creating admin user...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@codac.academy',
            name: 'Admin User',
            password: defaultPassword,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            bio: 'System administrator for CODAC Academy',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RjMjYyNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUQ8L3RleHQ+PC9zdmc+',
        },
    });
    console.log(`✅ Created admin user: ${adminUser.name}`);

    // Summary
    console.log('\n🎉 Black Owls Seed Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`🏫 Cohort: ${cohort.name}`);
    console.log(`👥 Students: ${students.length}`);
    console.log(`📖 Courses: ${courses.length}`);
    console.log(`📋 Projects: ${courseWithProjects.length}`);
    console.log(`📝 Lessons: ${courseWithProjects.reduce((sum, c) => sum + c.lessons.length, 0)}`);
    console.log(`🎯 Enrollments: ${students.reduce((sum, s) => sum + s.enrollments.length, 0)}`);
    console.log('\n🔐 Login with any student email and password: password123');
    console.log('🔐 Admin login: admin@codac.academy / password123');
    console.log('\n📊 Student Progress Summary:');

    // Print student progress
    for (const student of students) {
        const avgProgress = student.enrollments.reduce((sum, e) => sum + e.progress, 0) / student.enrollments.length;
        const track = student.enrollments.some(e => e.courseSlug.includes('frontend') || e.courseSlug.includes('fullstack')) ? 'Web Dev' : 'Data Science';
        console.log(`   ${student.name} (${track}): ${Math.round(avgProgress)}% avg progress`);
    }

    console.log('\n✅ Ready for graduation day! 🎓');
}

if (require.main === module) {
    main()
        .catch((error) => {
            console.error('❌ Seed failed:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { main as seedBlackOwls }; 