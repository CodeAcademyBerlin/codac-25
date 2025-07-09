import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../lib/logger';

const prisma = new PrismaClient();

interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizData {
    topic: string;
    difficulty: string;
    quizTitle: string;
    questions: QuizQuestion[];
}

export async function seedQuizzes() {
    try {
        logger.info('📚 Starting quizzes seed...');

        // Load quiz data from JSON file
        const quizzesData: QuizData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/quizzes.json'), 'utf-8')
        );

        logger.info(`📋 Found ${quizzesData.length} quizzes to seed`);

        // Clean existing quiz data
        logger.info('🧹 Cleaning existing quiz data...');
        await prisma.question.deleteMany();
        await prisma.quiz.deleteMany();

        // Create all quizzes with their questions
        logger.info('📝 Creating quizzes and questions...');
        const quizzes = await Promise.all(
            quizzesData.map(async (quizData) => {
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

                logger.info(`✅ Created quiz: ${quiz.quizTitle} (${quiz.topic} - ${quiz.difficulty})`);
                return quiz;
            })
        );

        logger.info('✅ Quizzes seed completed successfully!');
        logger.info(`📚 Created ${quizzes.length} quizzes`);
        logger.info(`❓ Total questions: ${quizzesData.reduce((sum, quiz) => sum + quiz.questions.length, 0)}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Quizzes seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function seedQuizzesIncremental() {
    try {
        logger.info('📚 Starting incremental quizzes seed...');

        // Load quiz data from JSON file
        const quizzesData: QuizData[] = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'prisma/seed/data/quizzes.json'), 'utf-8')
        );

        logger.info(`📋 Found ${quizzesData.length} quizzes to process`);

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
                logger.info(`✅ Added questions to existing quiz: ${existingQuiz.quizTitle}`);
            } else {
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
                logger.info(`✅ Created new quiz: ${quiz.quizTitle} (${quiz.topic} - ${quiz.difficulty})`);
            }
        }

        logger.info('✅ Incremental quizzes seed completed successfully!');

    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Incremental quizzes seed failed:', errorMessage);
        throw errorMessage;
    }
}

export async function cleanQuizzes() {
    try {
        logger.info('🧹 Cleaning quizzes data...');

        await prisma.question.deleteMany();
        await prisma.quiz.deleteMany();

        logger.info('✅ Quizzes data cleaned successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(String(error));
        logger.error('❌ Failed to clean quizzes data:', errorMessage);
        throw errorMessage;
    }
} 