#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../../lib/logger';
import * as readline from 'readline';

// Import all seeder modules
import { seedAttackOnTitan, cleanAttackOnTitan } from './seeders/attack-on-titan';
import { seedBlackOwls, cleanBlackOwls } from './seeders/black-owls';
import { seedLMSContent, cleanLMSContent } from './seeders/lms-content';
import { seedQuizzes, seedQuizzesIncremental, cleanQuizzes } from './seeders/quizzes';
import { seedJobs, cleanJobs } from './seeders/jobs';

const prisma = new PrismaClient();

interface SeedOption {
    id: string;
    name: string;
    description: string;
    action: () => Promise<void>;
    cleanAction?: () => Promise<void>;
}

const seedOptions: SeedOption[] = [
    {
        id: 'attack-on-titan',
        name: 'Attack on Titan Theme',
        description: 'Users and cohorts with Attack on Titan theme',
        action: seedAttackOnTitan,
        cleanAction: cleanAttackOnTitan,
    },
    {
        id: 'black-owls',
        name: 'Black Owls Cohort',
        description: 'Black Owls cohort with users and course progressions',
        action: seedBlackOwls,
        cleanAction: cleanBlackOwls,
    },
    {
        id: 'lms-content',
        name: 'LMS Content',
        description: 'Import LMS content from markdown files',
        action: seedLMSContent,
        cleanAction: cleanLMSContent,
    },
    {
        id: 'quizzes',
        name: 'Quiz Data',
        description: 'Import quiz questions and answers',
        action: seedQuizzes,
        cleanAction: cleanQuizzes,
    },
    {
        id: 'quizzes-incremental',
        name: 'Quiz Data (Incremental)',
        description: 'Import quiz questions incrementally (preserves existing)',
        action: seedQuizzesIncremental,
        cleanAction: cleanQuizzes,
    },
    {
        id: 'jobs',
        name: 'Job Postings',
        description: 'Import job postings data',
        action: seedJobs,
        cleanAction: cleanJobs,
    },
];

function displayMenu() {
    console.log('\n🌱 CODAC Seed Data Manager');
    console.log('═══════════════════════════════════════\n');
    console.log('Available seeding options:');

    seedOptions.forEach((option, index) => {
        console.log(`${index + 1}. ${option.name}`);
        console.log(`   ${option.description}`);
    });

    console.log('\nSpecial commands:');
    console.log('a. Seed ALL data');
    console.log('c. Clean ALL data');
    console.log('x. Exit');
    console.log('\nEnter your choice (number, letter, or comma-separated numbers):');
}

async function seedAll() {
    logger.info('🌱 Starting complete database seeding...');

    try {
        // Seed in order: courses -> users -> content -> quizzes -> jobs
        await seedLMSContent();
        await seedAttackOnTitan();
        await seedBlackOwls();
        await seedQuizzes();
        await seedJobs();

        logger.info('✅ Complete seeding finished successfully!');

        console.log('\n🎉 All data seeded successfully!');
        console.log('═══════════════════════════════════════');
        console.log('📊 Summary:');
        console.log('  • Attack on Titan themed users and cohorts');
        console.log('  • Black Owls cohort with progress tracking');
        console.log('  • LMS content from markdown files');
        console.log('  • Quiz questions and answers');
        console.log('  • Job postings');
        console.log('\n🔐 Default login credentials:');
        console.log('  • Email: admin@codac.academy');
        console.log('  • Password: password123');
        console.log('\n📱 You can now start the application!');

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Complete seeding failed:', errorMessage);
        throw errorMessage;
    }
}

async function cleanAll() {
    logger.info('🧹 Starting complete database cleanup...');

    try {
        // Clean in reverse order
        await cleanJobs();
        await cleanQuizzes();
        await cleanLMSContent();
        await cleanBlackOwls();
        await cleanAttackOnTitan();

        logger.info('✅ Complete cleanup finished successfully!');
        console.log('\n🧹 All data cleaned successfully!');

    } catch (error) {
        logger.error('❌ Complete cleanup failed:', error);
        throw error;
    }
}

async function processSelection(input: string) {
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'a') {
        await seedAll();
        return;
    }

    if (trimmed === 'c') {
        await cleanAll();
        return;
    }

    if (trimmed === 'x') {
        console.log('\n👋 Goodbye!');
        process.exit(0);
    }

    // Handle single number or comma-separated numbers
    const selections = trimmed.split(',').map(s => s.trim());

    for (const selection of selections) {
        const index = parseInt(selection) - 1;

        if (index >= 0 && index < seedOptions.length) {
            const option = seedOptions[index];
            logger.info(`🌱 Starting ${option.name}...`);
            console.log(`\n🌱 Seeding ${option.name}...`);

            try {
                await option.action();
                console.log(`✅ ${option.name} completed successfully!`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error : new Error(String(error));
                logger.error(`❌ ${option.name} failed:`, errorMessage);
                console.log(`❌ ${option.name} failed. Check logs for details.`);
            }
        } else {
            console.log(`❌ Invalid selection: ${selection}`);
        }
    }
}

async function interactiveMode() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function askQuestion(): Promise<string> {
        return new Promise((resolve) => {
            displayMenu();
            rl.question('> ', (answer) => {
                resolve(answer);
            });
        });
    }

    try {
        while (true) {
            const input = await askQuestion();

            if (input.trim().toLowerCase() === 'x') {
                console.log('\n👋 Goodbye!');
                break;
            }

            await processSelection(input);

            // Ask if user wants to continue
            const continueAnswer = await new Promise<string>((resolve) => {
                rl.question('\nContinue? (y/n): ', (answer) => {
                    resolve(answer);
                });
            });

            if (continueAnswer.toLowerCase() !== 'y') {
                console.log('\n👋 Goodbye!');
                break;
            }
        }
    } finally {
        rl.close();
    }
}

async function main() {
    try {
        // Check if running with command line arguments
        const args = process.argv.slice(2);

        if (args.length > 0) {
            // Non-interactive mode
            const command = args[0];

            if (command === 'all') {
                await seedAll();
            } else if (command === 'clean') {
                await cleanAll();
            } else {
                // Try to process as selection
                await processSelection(command);
            }
        } else {
            // Interactive mode
            await interactiveMode();
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Seed script failed:', errorMessage);
        console.error('❌ Seed script failed:', errorMessage.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Help function
function showHelp() {
    console.log(`
🌱 CODAC Seed Data Manager

Usage:
  tsx prisma/seed/seed.ts                    # Interactive mode
  tsx prisma/seed/seed.ts all                # Seed all data
  tsx prisma/seed/seed.ts clean              # Clean all data
  tsx prisma/seed/seed.ts 1                  # Seed Attack on Titan theme
  tsx prisma/seed/seed.ts 1,2,3              # Seed multiple options
  tsx prisma/seed/seed.ts --help             # Show this help

Available options:
${seedOptions.map((opt, i) => `  ${i + 1}. ${opt.name} - ${opt.description}`).join('\n')}

Examples:
  tsx prisma/seed/seed.ts all                # Seed everything
  tsx prisma/seed/seed.ts 1,4                # Seed Attack on Titan + Quizzes
  tsx prisma/seed/seed.ts 2                  # Seed only Black Owls
`);
}

// Handle help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Run the main function
if (require.main === module) {
    main();
}

export { seedAll, cleanAll, seedOptions }; 