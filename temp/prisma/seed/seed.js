#!/usr/bin/env tsx
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedOptions = void 0;
exports.seedAll = seedAll;
exports.cleanAll = cleanAll;
const client_1 = require("@prisma/client");
const readline = __importStar(require("readline"));
const logger_1 = require("../../lib/logger");
// Import all seeder modules
const attack_on_titan_1 = require("./seeders/attack-on-titan");
const lms_content_1 = require("./seeders/lms-content");
const quizzes_1 = require("./seeders/quizzes");
const jobs_1 = require("./seeders/jobs");
const projects_1 = require("./seeders/projects");
const prisma = new client_1.PrismaClient();
const seedOptions = [
    {
        id: 'attack-on-titan',
        name: 'Attack on Titan Theme',
        description: 'Users and cohorts with Attack on Titan theme',
        action: attack_on_titan_1.seedAttackOnTitan,
        cleanAction: attack_on_titan_1.cleanAttackOnTitan,
    },
    {
        id: 'lms-content',
        name: 'LMS Content',
        description: 'Import LMS content from markdown files',
        action: lms_content_1.seedLMSContent,
        cleanAction: lms_content_1.cleanLMSContent,
    },
    {
        id: 'quizzes',
        name: 'Quiz Data',
        description: 'Import quiz questions and answers',
        action: quizzes_1.seedQuizzes,
        cleanAction: quizzes_1.cleanQuizzes,
    },
    {
        id: 'quizzes-incremental',
        name: 'Quiz Data (Incremental)',
        description: 'Import quiz questions incrementally (preserves existing)',
        action: quizzes_1.seedQuizzesIncremental,
        cleanAction: quizzes_1.cleanQuizzes,
    },
    {
        id: 'jobs',
        name: 'Job Postings',
        description: 'Import job postings data',
        action: jobs_1.seedJobs,
        cleanAction: jobs_1.cleanJobs,
    },
    {
        id: 'projects',
        name: 'Demo Projects',
        description: 'Create demo project showcases with various tech stacks and features',
        action: projects_1.seedProjects,
        cleanAction: projects_1.cleanProjects,
    },
];
exports.seedOptions = seedOptions;
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
    logger_1.logger.info('🌱 Starting complete database seeding...');
    try {
        // Seed in order: courses -> users -> content -> quizzes -> jobs -> projects
        await (0, lms_content_1.seedLMSContent)();
        await (0, attack_on_titan_1.seedAttackOnTitan)();
        await (0, quizzes_1.seedQuizzes)();
        await (0, jobs_1.seedJobs)();
        await (0, projects_1.seedProjects)();
        logger_1.logger.info('✅ Complete seeding finished successfully!');
        console.log('\n🎉 All data seeded successfully!');
        console.log('═══════════════════════════════════════');
        console.log('📊 Summary:');
        console.log('  • Attack on Titan themed users and cohorts');
        console.log('  • Black Owls cohort with progress tracking');
        console.log('  • LMS content from markdown files');
        console.log('  • Quiz questions and answers');
        console.log('  • Job postings');
        console.log('  • Demo project showcases');
        console.log('\n🔐 Default login credentials:');
        console.log('  • Email: admin@codac.academy');
        console.log('  • Password: password123');
        console.log('\n📱 You can now start the application!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Complete seeding failed:', errorMessage);
        throw errorMessage;
    }
}
async function cleanAll() {
    logger_1.logger.info('🧹 Starting complete database cleanup...');
    try {
        // Clean in reverse order
        await (0, projects_1.cleanProjects)();
        await (0, jobs_1.cleanJobs)();
        await (0, quizzes_1.cleanQuizzes)();
        await (0, lms_content_1.cleanLMSContent)();
        await (0, attack_on_titan_1.cleanAttackOnTitan)();
        logger_1.logger.info('✅ Complete cleanup finished successfully!');
        console.log('\n🧹 All data cleaned successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Complete cleanup failed:', errorMessage);
        throw errorMessage;
    }
}
async function processSelection(input) {
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
            logger_1.logger.info(`🌱 Starting ${option.name}...`);
            console.log(`\n🌱 Seeding ${option.name}...`);
            try {
                await option.action();
                console.log(`✅ ${option.name} completed successfully!`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.error(`❌ ${option.name} failed:`, errorMessage);
                console.log(`❌ ${option.name} failed. Check logs for details.`);
            }
        }
        else {
            console.log(`❌ Invalid selection: ${selection}`);
        }
    }
}
async function interactiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    function askQuestion() {
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
            const continueAnswer = await new Promise((resolve) => {
                rl.question('\nContinue? (y/n): ', (answer) => {
                    resolve(answer);
                });
            });
            if (continueAnswer.toLowerCase() !== 'y') {
                console.log('\n👋 Goodbye!');
                break;
            }
        }
    }
    finally {
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
            }
            else if (command === 'clean') {
                await cleanAll();
            }
            else {
                // Try to process as selection
                await processSelection(command);
            }
        }
        else {
            // Interactive mode
            await interactiveMode();
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Seed script failed:', errorMessage);
        console.error('❌ Seed script failed:', errorMessage.message);
        process.exit(1);
    }
    finally {
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
