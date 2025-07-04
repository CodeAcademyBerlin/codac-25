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

    // Create portfolio documents with visualizations for all students
    console.log('📊 Creating portfolio documents with visualizations...');

    const portfolioTemplates = [
        {
            title: 'Climate Data Analysis Portfolio',
            content: [
                {
                    type: 'h1',
                    children: [{ text: '🌡️ Climate Data Analysis Portfolio' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'A comprehensive analysis of global temperature trends using machine learning and data visualization techniques.' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Project Overview' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'This project analyzes 150+ years of climate data to identify patterns and predict future temperature trends using LSTM neural networks.' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Key Findings' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Our analysis reveals significant temperature trends over the past century:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'line',
                    title: 'Global Temperature Trends (1880-2023)',
                    width: 500,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Technical Skills Applied' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'This project showcases proficiency in various data science tools and techniques:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'bar',
                    title: 'Technical Skills Proficiency',
                    width: 450,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Model Performance' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'The LSTM model achieved excellent performance metrics across different validation datasets:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'scatter',
                    title: 'Machine Learning Model Performance',
                    width: 450,
                    height: 300,
                    children: [{ text: '' }],
                },
            ],
        },
        {
            title: 'AI-Powered E-Commerce Platform',
            content: [
                {
                    type: 'h1',
                    children: [{ text: '🛍️ AI-Powered E-Commerce Platform' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'A modern shopping platform built with React and Node.js, featuring ML-based product recommendations and real-time analytics.' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Technical Stack' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Frontend: ' },
                        { code: true, text: 'React' },
                        { text: ', ' },
                        { code: true, text: 'TypeScript' },
                        { text: ', ' },
                        { code: true, text: 'Tailwind CSS' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'User Engagement Analytics' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Real-time analytics dashboard showing user behavior patterns and conversion metrics:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'line',
                    title: 'User Engagement Over Time',
                    width: 500,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Development Skills' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'This project demonstrates proficiency in modern web development technologies:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'bar',
                    title: 'Frontend Development Skills',
                    width: 450,
                    height: 300,
                    children: [{ text: '' }],
                },
            ],
        },
        {
            title: 'Financial Analytics Dashboard',
            content: [
                {
                    type: 'h1',
                    children: [{ text: '💰 Financial Analytics Dashboard' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'A comprehensive financial analysis tool built with Python and React, featuring real-time market data visualization and predictive modeling.' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Market Performance Analysis' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Track and analyze market performance across different sectors:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'line',
                    title: 'Market Performance Trends',
                    width: 500,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Portfolio Allocation' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Optimal portfolio allocation based on risk assessment and return projections:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'doughnut',
                    title: 'Portfolio Asset Allocation',
                    width: 400,
                    height: 400,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Risk vs Return Analysis' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Comprehensive risk-return analysis for investment decision making:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'scatter',
                    title: 'Risk vs Return Analysis',
                    width: 450,
                    height: 300,
                    children: [{ text: '' }],
                },
            ],
        },
        {
            title: 'Social Media Analytics Platform',
            content: [
                {
                    type: 'h1',
                    children: [{ text: '📱 Social Media Analytics Platform' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'A powerful social media analytics tool that tracks engagement, sentiment, and growth metrics across multiple platforms.' },
                    ],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Engagement Metrics' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Track engagement rates and user interaction patterns:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'area',
                    title: 'Social Media Engagement Over Time',
                    width: 500,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Platform Comparison' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Compare performance across different social media platforms:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'bar',
                    title: 'Platform Performance Comparison',
                    width: 450,
                    height: 300,
                    children: [{ text: '' }],
                },
                {
                    type: 'h2',
                    children: [{ text: 'Sentiment Analysis' }],
                },
                {
                    type: 'p',
                    children: [
                        { text: 'Real-time sentiment analysis of social media mentions and interactions:' },
                    ],
                },
                {
                    type: 'chart',
                    chartType: 'radar',
                    title: 'Sentiment Analysis Breakdown',
                    width: 400,
                    height: 400,
                    children: [{ text: '' }],
                },
            ],
        },
    ];

    // Create portfolio documents for each student
    for (const student of students) {
        // Determine which portfolios to create based on student's course enrollments
        const hasDataScience = student.enrollments.some(e =>
            e.courseSlug.includes('data-science') ||
            e.courseSlug.includes('python') ||
            e.courseSlug.includes('ml')
        );
        const hasWebDev = student.enrollments.some(e =>
            e.courseSlug.includes('frontend') ||
            e.courseSlug.includes('fullstack') ||
            e.courseSlug.includes('react')
        );

        const selectedTemplates = [];

        if (hasDataScience) {
            selectedTemplates.push(portfolioTemplates[0]); // Climate Data Analysis
            selectedTemplates.push(portfolioTemplates[2]); // Financial Analytics
        }

        if (hasWebDev) {
            selectedTemplates.push(portfolioTemplates[1]); // E-Commerce Platform
            selectedTemplates.push(portfolioTemplates[3]); // Social Media Analytics
        }

        // If no specific track, give them a mix
        if (selectedTemplates.length === 0) {
            selectedTemplates.push(portfolioTemplates[0], portfolioTemplates[1]);
        }

        // Create documents for this student
        for (const template of selectedTemplates) {
            const firstName = student.name?.split(' ')[0] || 'Student';
            await prisma.document.create({
                data: {
                    title: `${firstName}'s ${template.title}`,
                    content: JSON.stringify(template.content),
                    isPublished: true,
                    authorId: student.id,
                },
            });
        }

        console.log(`✅ Created ${selectedTemplates.length} portfolio document(s) for ${student.name || 'Student'}`);
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
    console.log(`📊 Portfolio Documents: ${students.length * 2} (with interactive visualizations)`);
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