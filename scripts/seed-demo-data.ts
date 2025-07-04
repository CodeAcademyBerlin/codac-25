import { PrismaClient, UserRole, UserStatus, AchievementType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🦉 Seeding Black Owls Demo Data...');

    // Load demo data
    const demoData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'prisma/seed/black-owls-demo.json'), 'utf-8')
    );

    const defaultPassword = await bcrypt.hash('password123', 10);

    try {
        // Create Black Owls cohort
        console.log('Creating Black Owls cohort...');
        const blackOwlsCohort = await prisma.cohort.upsert({
            where: { slug: demoData.cohort.slug },
            update: demoData.cohort,
            create: demoData.cohort,
        });

        console.log(`✅ Created cohort: ${blackOwlsCohort.name}`);

        // Create students
        console.log('Creating Black Owls students...');
        const createdStudents = [];

        for (const studentData of demoData.students) {
            const student = await prisma.user.upsert({
                where: { email: studentData.email },
                update: {
                    name: studentData.name,
                    email: studentData.email,
                    bio: studentData.bio,
                    avatar: studentData.avatar,
                    role: studentData.role,
                    status: studentData.status,
                    githubUrl: studentData.githubUrl,
                    linkedinUrl: studentData.linkedinUrl,
                    portfolioUrl: studentData.portfolioUrl,
                    currentJob: studentData.currentJob,
                    currentCompany: studentData.currentCompany,
                    graduationDate: new Date(studentData.graduationDate),
                    password: defaultPassword,
                    cohortId: blackOwlsCohort.id,
                },
                create: {
                    name: studentData.name,
                    email: studentData.email,
                    bio: studentData.bio,
                    avatar: studentData.avatar,
                    role: UserRole.STUDENT,
                    status: UserStatus.GRADUATED,
                    githubUrl: studentData.githubUrl,
                    linkedinUrl: studentData.linkedinUrl,
                    portfolioUrl: studentData.portfolioUrl,
                    currentJob: studentData.currentJob,
                    currentCompany: studentData.currentCompany,
                    graduationDate: new Date(studentData.graduationDate),
                    password: defaultPassword,
                    cohortId: blackOwlsCohort.id,
                },
            });
            createdStudents.push(student);
            console.log(`  ✅ Created student: ${student.name}`);
        }

        // Create sample jobs for demo
        console.log('Creating sample job postings...');
        for (const jobData of demoData.sampleJobs) {
            // Find a random student to be the poster
            const randomStudent = createdStudents[Math.floor(Math.random() * createdStudents.length)];

            await prisma.job.create({
                data: {
                    ...jobData,
                    postedById: randomStudent.id,
                },
            });
            console.log(`  ✅ Created job: ${jobData.title} at ${jobData.company}`);
        }

        // Create sample documents for portfolio demo
        console.log('Creating portfolio documents...');

        // Climate Analysis Portfolio for Alex Chen
        const alexChen = createdStudents.find(s => s.name === 'Alex Chen');
        if (alexChen) {
            await prisma.document.create({
                data: {
                    title: 'Climate Data Analysis Portfolio',
                    content: JSON.stringify([
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
                    ]),
                    isPublished: true,
                    authorId: alexChen.id,
                },
            });
        }

        // E-commerce Portfolio for Maya Rodriguez
        const mayaRodriguez = createdStudents.find(s => s.name === 'Maya Rodriguez');
        if (mayaRodriguez) {
            await prisma.document.create({
                data: {
                    title: 'AI-Powered E-Commerce Platform',
                    content: JSON.stringify([
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
                    ]),
                    isPublished: true,
                    authorId: mayaRodriguez.id,
                },
            });
        }

        // Create community posts for engagement
        console.log('Creating community posts...');
        const communityPosts = [
            {
                title: 'Just graduated from Code Academy Berlin! 🎓',
                content: JSON.stringify([
                    {
                        type: 'p',
                        children: [
                            { text: 'What an incredible journey! From knowing nothing about programming to building full-stack applications with AI integration. Thank you to all my Black Owls cohort mates!' },
                        ],
                    },
                ]),
                authorId: alexChen?.id,
            },
            {
                title: 'Portfolio Review Session - Data Science Projects',
                content: JSON.stringify([
                    {
                        type: 'p',
                        children: [
                            { text: 'Looking for feedback on my climate analysis project. Would love to hear from fellow data scientists about improving the visualization techniques.' },
                        ],
                    },
                ]),
                authorId: createdStudents[2]?.id,
            },
            {
                title: 'Job Search Success! 🚀',
                content: JSON.stringify([
                    {
                        type: 'p',
                        children: [
                            { text: 'Happy to announce I just landed my first role as a Frontend Developer! The skills learned at Code Academy Berlin really made the difference.' },
                        ],
                    },
                ]),
                authorId: mayaRodriguez?.id,
            },
        ];

        for (const postData of communityPosts) {
            if (postData.authorId) {
                await prisma.communityPost.create({
                    data: {
                        title: postData.title,
                        content: postData.content,
                        authorId: postData.authorId,
                    },
                });
            }
        }

        // Create some achievements for students
        console.log('Creating achievements...');
        const achievements = [
            {
                title: 'First Neural Network',
                description: 'Successfully implemented your first neural network',
                icon: '🧠',
                type: AchievementType.SKILL_MASTERY,
                condition: { requirement: 'create_neural_network', count: 1 },
                points: 100,
            },
            {
                title: 'Portfolio Master',
                description: 'Created an outstanding portfolio showcasing multiple projects',
                icon: '📁',
                type: AchievementType.SKILL_MASTERY,
                condition: { requirement: 'create_portfolio', count: 1 },
                points: 150,
            },
            {
                title: 'Code Review Champion',
                description: 'Provided excellent code reviews to fellow students',
                icon: '👁️',
                type: AchievementType.COMMUNITY_CONTRIBUTION,
                condition: { requirement: 'code_reviews', count: 5 },
                points: 75,
            },
        ];

        for (const achievementData of achievements) {
            const achievement = await prisma.achievement.create({
                data: achievementData,
            });

            // Award to random students
            const randomStudents = createdStudents
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);

            for (const student of randomStudents) {
                await prisma.userAchievement.create({
                    data: {
                        userId: student.id,
                        achievementId: achievement.id,
                    },
                });
            }
        }

        console.log('\n🎉 Demo data seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`  👥 Created 1 cohort: ${blackOwlsCohort.name}`);
        console.log(`  🎓 Created ${createdStudents.length} students`);
        console.log(`  💼 Created ${demoData.sampleJobs.length} job postings`);
        console.log(`  📝 Created portfolio documents`);
        console.log(`  💬 Created community posts`);
        console.log(`  🏆 Created achievements`);

        console.log('\n🔑 Demo Login Credentials:');
        console.log('  Email: alex.chen@blackowls.codeacademyberlin.com');
        console.log('  Password: password123');
        console.log('\n🦉 Ready for Black Owls graduation demo!');

    } catch (error) {
        console.error('❌ Error seeding demo data:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 