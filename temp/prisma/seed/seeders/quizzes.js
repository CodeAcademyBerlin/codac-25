"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedQuizzes = seedQuizzes;
exports.seedQuizzesIncremental = seedQuizzesIncremental;
exports.cleanQuizzes = cleanQuizzes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const logger_1 = require("../../../lib/logger");
const prisma = new client_1.PrismaClient();
async function seedQuizzes() {
    try {
        logger_1.logger.info('📚 Starting quizzes seed...');
        // Load quiz data from JSON file
        const quizzesData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/quizzes.json'), 'utf-8'));
        logger_1.logger.info(`📋 Found ${quizzesData.length} quizzes to seed`);
        // Clean existing quiz data
        logger_1.logger.info('🧹 Cleaning existing quiz data...');
        await prisma.question.deleteMany();
        await prisma.quiz.deleteMany();
        // Create all quizzes with their questions
        logger_1.logger.info('📝 Creating quizzes and questions...');
        const quizzes = await Promise.all(quizzesData.map(async (quizData) => {
            const quiz = await prisma.quiz.create({
                data: {
                    quizTitle: quizData.quizTitle,
                    topic: quizData.topic,
                    difficulty: quizData.difficulty,
                    questions: {
                        create: quizData.questions.map((question) => ({
                            text: question.text,
                            options: JSON.stringify(question.options),
                            correctAnswer: question.correctAnswer,
                            explanation: question.explanation,
                        })),
                    },
                },
            });
            logger_1.logger.info(`✅ Created quiz: ${quiz.quizTitle} (${quiz.topic} - ${quiz.difficulty})`);
            return quiz;
        }));
        logger_1.logger.info('✅ Quizzes seed completed successfully!');
        logger_1.logger.info(`📚 Created ${quizzes.length} quizzes`);
        logger_1.logger.info(`❓ Total questions: ${quizzesData.reduce((sum, quiz) => sum + quiz.questions.length, 0)}`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Quizzes seed failed:', errorMessage);
        throw errorMessage;
    }
}
async function seedQuizzesIncremental() {
    try {
        logger_1.logger.info('📚 Starting incremental quizzes seed...');
        // Load quiz data from JSON file
        const quizzesData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'prisma/seed/data/quizzes.json'), 'utf-8'));
        logger_1.logger.info(`📋 Found ${quizzesData.length} quizzes to process`);
        for (const quizData of quizzesData) {
            // Check if quiz already exists
            const existingQuiz = await prisma.quiz.findFirst({
                where: {
                    topic: quizData.topic,
                    difficulty: quizData.difficulty,
                    quizTitle: quizData.quizTitle,
                },
            });
            if (existingQuiz) {
                // Add questions to existing quiz
                for (const question of quizData.questions) {
                    await prisma.question.create({
                        data: {
                            text: question.text,
                            options: JSON.stringify(question.options),
                            correctAnswer: question.correctAnswer,
                            explanation: question.explanation,
                            quizId: existingQuiz.id,
                        },
                    });
                }
                logger_1.logger.info(`✅ Added questions to existing quiz: ${existingQuiz.quizTitle}`);
            }
            else {
                // Create new quiz with questions
                const quiz = await prisma.quiz.create({
                    data: {
                        topic: quizData.topic,
                        difficulty: quizData.difficulty,
                        quizTitle: quizData.quizTitle,
                        questions: {
                            create: quizData.questions.map((question) => ({
                                text: question.text,
                                options: JSON.stringify(question.options),
                                correctAnswer: question.correctAnswer,
                                explanation: question.explanation,
                            })),
                        },
                    },
                });
                logger_1.logger.info(`✅ Created new quiz: ${quiz.quizTitle} (${quiz.topic} - ${quiz.difficulty})`);
            }
        }
        logger_1.logger.info('✅ Incremental quizzes seed completed successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Incremental quizzes seed failed:', errorMessage);
        throw errorMessage;
    }
}
async function cleanQuizzes() {
    try {
        logger_1.logger.info('🧹 Cleaning quizzes data...');
        await prisma.question.deleteMany();
        await prisma.quiz.deleteMany();
        logger_1.logger.info('✅ Quizzes data cleaned successfully!');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger_1.logger.error('❌ Failed to clean quizzes data:', errorMessage);
        throw errorMessage;
    }
}
