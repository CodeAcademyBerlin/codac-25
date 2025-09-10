"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAttackOnTitan = seedAttackOnTitan;
exports.cleanAttackOnTitan = cleanAttackOnTitan;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../../../lib/logger");
const encode_image_to_base64_1 = require("../../../lib/imaging/encode-image-to-base64");
const prisma = new client_1.PrismaClient();
async function seedAttackOnTitan() {
    try {
        logger_1.logger.info('🗡️ Starting Attack on Titan seed...');
        // Hash default password
        const defaultPassword = await bcryptjs_1.default.hash('password123', 10);
        // Load data from JSON files
        const cohortsData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/attack-on-titan-cohorts.json'), 'utf-8'));
        const usersData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/attack-on-titan-users.json'), 'utf-8'));
        // Clean existing data
        logger_1.logger.info('🧹 Cleaning existing Attack on Titan data...');
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
        logger_1.logger.info('🏫 Creating Attack on Titan cohorts...');
        const cohorts = await Promise.all(cohortsData.map(async (cohortData) => {
            const cohortImageBase64 = await (0, encode_image_to_base64_1.encodeSeedImageToBase64)(cohortData.image);
            return prisma.cohort.create({
                data: {
                    name: cohortData.name,
                    slug: cohortData.slug,
                    startDate: new Date(cohortData.startDate),
                    description: cohortData.description,
                    image: cohortImageBase64,
                },
            });
        }));
        // Create users
        logger_1.logger.info('👥 Creating Attack on Titan users...');
        const users = await Promise.all(usersData.map(async (userData) => {
            const cohort = cohorts.find(c => c.slug === userData.cohort);
            const userImageBase64 = await (0, encode_image_to_base64_1.encodeSeedImageToBase64)(userData.image);
            return prisma.user.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    password: defaultPassword,
                    role: userData.role,
                    status: userData.status,
                    cohortId: cohort?.id,
                    bio: userData.bio,
                    image: userImageBase64,
                    githubUrl: userData.githubUrl,
                    linkedinUrl: userData.linkedinUrl,
                    currentJob: userData.currentJob,
                    currentCompany: userData.currentCompany,
                    portfolioUrl: userData.portfolioUrl,
                    graduationDate: userData.graduationDate ? new Date(userData.graduationDate) : null,
                },
            });
        }));
        // Create admin user
        await prisma.user.create({
            data: {
                email: 'admin@codac.academy',
                name: 'Admin User',
                password: defaultPassword,
                role: client_1.UserRole.ADMIN,
                status: client_1.UserStatus.ACTIVE,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RjMjYyNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUQ8L3RleHQ+PC9zdmc+',
                bio: 'System administrator responsible for platform management and user oversight.',
                githubUrl: 'https://github.com/codac-admin',
                linkedinUrl: 'https://linkedin.com/company/codac-academy',
            },
        });
        logger_1.logger.info('✅ Attack on Titan seed completed successfully!');
        logger_1.logger.info(`🏫 Created ${cohorts.length} cohorts`);
        logger_1.logger.info(`👥 Created ${users.length + 1} users`);
        logger_1.logger.info('🔐 Default password for all users: password123');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Attack on Titan seed failed:', errorMessage);
        throw errorMessage;
    }
}
async function cleanAttackOnTitan() {
    try {
        logger_1.logger.info('🧹 Cleaning Attack on Titan data...');
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: { endsWith: '@codac.academy' } },
                    { email: { endsWith: '@alumni.codac.academy' } }
                ]
            }
        });
        const cohortsData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/attack-on-titan-cohorts.json'), 'utf-8'));
        await prisma.cohort.deleteMany({
            where: {
                slug: { in: cohortsData.map(c => c.slug) }
            }
        });
        logger_1.logger.info('✅ Attack on Titan data cleaned successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Failed to clean Attack on Titan data:', errorMessage);
        throw errorMessage;
    }
}
