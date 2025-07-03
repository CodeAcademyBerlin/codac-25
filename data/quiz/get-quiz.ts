import { prisma } from '@/lib/db/prisma'; 

export async function getQuizzes(topic: string, difficulty: string) {
    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                topic,
                difficulty,
            },
            include: {
                questions: true,
            },
        });
        return quizzes;
    } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        return [];
    }
} 