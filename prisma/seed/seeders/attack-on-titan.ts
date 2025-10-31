import fs from 'fs';
import path from 'path';

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import { encodeSeedImageToBase64 } from '../../../lib/imaging/encode-image-to-base64';
import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

interface AttackOnTitanUser {
    name: string;
    email: string;
    username: string;
    role: UserRole;
    status: UserStatus;
    cohort: string;
    bio: string;
    image: string;
    githubUrl: string;
    linkedinUrl: string;
    currentJob?: string;
    currentCompany?: string;
    portfolioUrl?: string;
    startDate?: string;
    endDate?: string;
}

interface AttackOnTitanCohort {
    name: string;
    slug: string;
    startDate: string;
    endDate: string;
    description: string;
    image: string;
    isActive: boolean;
}

export async function seedAttackOnTitan() {
    try {
        logger.info('🗡️ Starting Attack on Titan seed...');

        // Hash default password
        const defaultPassword = await bcrypt.hash('password123', 10);

        // Load data from JSON files
        const cohortsData: AttackOnTitanCohort[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/dev/attack-on-titan-cohorts.json'), 'utf-8')
        );
        const usersData: AttackOnTitanUser[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/dev/attack-on-titan-users.json'), 'utf-8')
        );

        // Clean existing data
        logger.info('🧹 Cleaning existing Attack on Titan data...');
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: { endsWith: '@codac.academy' } },
                    { email: { endsWith: '@alumni.codac.academy' } }
                ]
            }
        });
        await prisma.cohort.deleteMany({
            where: {
                slug: { in: cohortsData.map(c => c.slug) }
            }
        });

        // Create cohorts
        logger.info('🏫 Creating Attack on Titan cohorts...');
        const cohorts = await Promise.all(
            cohortsData.map(async (cohortData) => {
                const cohortImageBase64 = await encodeSeedImageToBase64(cohortData.image, 'prisma/seed/dev/');
                return prisma.cohort.create({
                    data: {
                        name: cohortData.name,
                        slug: cohortData.slug,
                        startDate: new Date(cohortData.startDate),
                        endDate: new Date(cohortData.endDate),
                        description: cohortData.description,
                        image: cohortImageBase64,
                    },
                });
            })
        );

        // Create users
        logger.info('👥 Creating Attack on Titan users...');
        const users = await Promise.all(
            usersData.map(async (userData) => {
                const cohort = cohorts.find(c => c.slug === userData.cohort);
                const userImageBase64 = await encodeSeedImageToBase64(userData.image, 'prisma/seed/dev/');
                return prisma.user.create({
                    data: {
                        id: nanoid(),
                        name: userData.name,
                        email: userData.email,
                        emailVerified: false,
                        password: defaultPassword,
                        applicationRole: userData.role as UserRole,
                        status: userData.status as UserStatus,
                        cohortId: cohort?.id,
                        username: userData.username,
                        bio: userData.bio,
                        image: userImageBase64,
                        githubUrl: userData.githubUrl,
                        linkedinUrl: userData.linkedinUrl,
                        currentJob: userData.currentJob,
                        currentCompany: userData.currentCompany,
                        portfolioUrl: userData.portfolioUrl,
                        startDate: userData.startDate ? new Date(userData.startDate) : null,
                        endDate: userData.endDate ? new Date(userData.endDate) : null,
                    },
                });
            })
        );

        // Create admin user
        await prisma.user.create({
            data: {
                id: nanoid(),
                username: 'admin',
                email: 'admin@codac.academy',
                name: 'Admin User',
                emailVerified: false,
                password: defaultPassword,
                applicationRole: 'ADMIN' as UserRole,
                status: 'ACTIVE' as UserStatus,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RjMjYyNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUQ8L3RleHQ+PC9zdmc+',
                bio: 'System administrator responsible for platform management and user oversight.',
                githubUrl: 'https://github.com/codac-admin',
                linkedinUrl: 'https://linkedin.com/company/codac-academy',
            },
        });

        logger.info('✅ Attack on Titan seed completed successfully!');
        logger.info(`🏫 Created ${cohorts.length} cohorts`);
        logger.info(`👥 Created ${users.length + 1} users`);
        logger.info('🔐 Default password for all users: password123');

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Attack on Titan seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanAttackOnTitan() {
    try {
        logger.info('🧹 Cleaning Attack on Titan data...');

        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: { endsWith: '@codac.academy' } },
                    { email: { endsWith: '@alumni.codac.academy' } }
                ]
            }
        });

        const cohortsData: AttackOnTitanCohort[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/dev/attack-on-titan-cohorts.json'), 'utf-8')
        );
        await prisma.cohort.deleteMany({
            where: {
                slug: { in: cohortsData.map(c => c.slug) }
            }
        });

        logger.info('✅ Attack on Titan data cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean Attack on Titan data:', errorMessage);
        throw errorMessage;
    }
} 