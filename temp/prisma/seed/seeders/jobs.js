"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedJobs = seedJobs;
exports.seedJobsWithPoster = seedJobsWithPoster;
exports.cleanJobs = cleanJobs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const logger_1 = require("../../../lib/logger");
const prisma = new client_1.PrismaClient();
async function seedJobs() {
    try {
        logger_1.logger.info('💼 Starting jobs seed...');
        // Load job data from JSON file
        const jobsData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/jobs.json'), 'utf-8'));
        logger_1.logger.info(`📋 Found ${jobsData.length} jobs to seed`);
        // Find admin user to post jobs
        const adminUser = await prisma.user.findFirst({
            where: {
                role: 'ADMIN'
            }
        });
        if (!adminUser) {
            logger_1.logger.warn('⚠️ No admin user found. Jobs will be created without a poster.');
        }
        // Clean existing job data
        logger_1.logger.info('🧹 Cleaning existing job data...');
        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();
        // Create all jobs
        logger_1.logger.info('📝 Creating job postings...');
        const jobs = await Promise.all(jobsData.map(async (jobData) => {
            const job = await prisma.job.create({
                data: {
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    type: jobData.type,
                    level: jobData.level,
                    salary: jobData.salary,
                    description: jobData.description,
                    skills: jobData.skills,
                    remote: jobData.remote,
                    isActive: jobData.isActive,
                    postedById: adminUser?.id || null,
                },
            });
            logger_1.logger.info(`✅ Created job: ${job.title} at ${job.company}`);
            return job;
        }));
        logger_1.logger.info('✅ Jobs seed completed successfully!');
        logger_1.logger.info(`💼 Created ${jobs.length} job postings`);
        logger_1.logger.info(`🏢 Companies: ${Array.from(new Set(jobs.map(j => j.company))).join(', ')}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Jobs seed failed:', errorMessage);
        throw errorMessage;
    }
}
async function seedJobsWithPoster(posterEmail) {
    try {
        logger_1.logger.info('💼 Starting jobs seed with specific poster...');
        // Load job data from JSON file
        const jobsData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/jobs.json'), 'utf-8'));
        logger_1.logger.info(`📋 Found ${jobsData.length} jobs to seed`);
        // Find the specific user to post jobs
        const posterUser = await prisma.user.findUnique({
            where: { email: posterEmail }
        });
        if (!posterUser) {
            throw new Error(`User with email ${posterEmail} not found`);
        }
        // Clean existing job data
        logger_1.logger.info('🧹 Cleaning existing job data...');
        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();
        // Create all jobs
        logger_1.logger.info('📝 Creating job postings...');
        const jobs = await Promise.all(jobsData.map(async (jobData) => {
            const job = await prisma.job.create({
                data: {
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    type: jobData.type,
                    level: jobData.level,
                    salary: jobData.salary,
                    description: jobData.description,
                    skills: jobData.skills,
                    remote: jobData.remote,
                    isActive: jobData.isActive,
                    postedById: posterUser.id,
                },
            });
            logger_1.logger.info(`✅ Created job: ${job.title} at ${job.company}`);
            return job;
        }));
        logger_1.logger.info('✅ Jobs seed completed successfully!');
        logger_1.logger.info(`💼 Created ${jobs.length} job postings`);
        logger_1.logger.info(`👤 Posted by: ${posterUser.name} (${posterUser.email})`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Jobs seed failed:', errorMessage);
        throw errorMessage;
    }
}
async function cleanJobs() {
    try {
        logger_1.logger.info('🧹 Cleaning jobs data...');
        await prisma.jobApplication.deleteMany();
        await prisma.job.deleteMany();
        logger_1.logger.info('✅ Jobs data cleaned successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Failed to clean jobs data:', errorMessage);
        throw errorMessage;
    }
}
