import fs from 'fs';
import path from 'path';

import { JobLevel, JobType, PrismaClient } from '@prisma/client';

import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

interface JobData {
    title: string;
    company: string;
    location: string;
    type: string;
    level: string;
    salary: string;
    description: string;
    requirements: string[];
    skills: string[];
    benefits: string[];
    remote: boolean;
    isActive: boolean;
}

export async function seedJobs() {
    try {
        logger.info('💼 Starting jobs seed...');

        // Load job data from JSON file
        const jobsData: JobData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/dev/jobs.json'), 'utf-8')
        );

        logger.info(`📋 Found ${jobsData.length} jobs to seed`);

        // Find admin user to post jobs
        const adminUser = await prisma.user.findFirst({
            where: {
                applicationRole: 'ADMIN'
            }
        });

        if (!adminUser) {
            logger.warn('⚠️ No admin user found. Jobs will be created without a poster.');
        }

        // Clean existing job data
        logger.info('🧹 Cleaning existing job data...');
        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();

        // Create all jobs
        logger.info('📝 Creating job postings...');
        const jobs = await Promise.all(
            jobsData.map(async (jobData) => {
                const job = await prisma.job.create({
                    data: {
                        title: jobData.title,
                        company: jobData.company,
                        location: jobData.location,
                        type: jobData.type as JobType,
                        level: jobData.level as JobLevel,
                        salary: jobData.salary,
                        description: jobData.description,
                        skills: jobData.skills,
                        remote: jobData.remote,
                        isActive: jobData.isActive,
                        postedById: adminUser?.id || null,
                    },
                });

                logger.info(`✅ Created job: ${job.title} at ${job.company}`);
                return job;
            })
        );

        logger.info('✅ Jobs seed completed successfully!');
        logger.info(`💼 Created ${jobs.length} job postings`);
        logger.info(`🏢 Companies: ${Array.from(new Set(jobs.map(j => j.company))).join(', ')}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Jobs seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function seedJobsWithPoster(posterEmail: string) {
    try {
        logger.info('💼 Starting jobs seed with specific poster...');

        // Load job data from JSON file
        const jobsData: JobData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/dev/jobs.json'), 'utf-8')
        );

        logger.info(`📋 Found ${jobsData.length} jobs to seed`);

        // Find the specific user to post jobs
        const posterUser = await prisma.user.findUnique({
            where: { email: posterEmail }
        });

        if (!posterUser) {
            throw new Error(`User with email ${posterEmail} not found`);
        }

        // Clean existing job data
        logger.info('🧹 Cleaning existing job data...');
        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();

        // Create all jobs
        logger.info('📝 Creating job postings...');
        const jobs = await Promise.all(
            jobsData.map(async (jobData) => {
                const job = await prisma.job.create({
                    data: {
                        title: jobData.title,
                        company: jobData.company,
                        location: jobData.location,
                        type: jobData.type as JobType,
                        level: jobData.level as JobLevel,
                        salary: jobData.salary,
                        description: jobData.description,
                        skills: jobData.skills,
                        remote: jobData.remote,
                        isActive: jobData.isActive,
                        postedById: posterUser.id,
                    },
                });

                logger.info(`✅ Created job: ${job.title} at ${job.company}`);
                return job;
            })
        );

        logger.info('✅ Jobs seed completed successfully!');
        logger.info(`💼 Created ${jobs.length} job postings`);
        logger.info(`👤 Posted by: ${posterUser.name} (${posterUser.email})`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Jobs seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanJobs() {
    try {
        logger.info('🧹 Cleaning jobs data...');

        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();

        logger.info('✅ Jobs data cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean jobs data:', errorMessage);
        throw errorMessage;
    }
} 