import { db } from '@/lib/db/prisma';

export async function getQuiz(topic: string, difficulty: string) {
    try {
        const quiz = await db.quiz.findUnique({
            where: {
                topic_difficulty: {
                    topic,
                    difficulty,
                },
            },
            include: {
                questions: true,
            },
        });

        return quiz;
    } catch (error) {
        console.error('Failed to fetch quiz:', error);
        return null;
    }
} 