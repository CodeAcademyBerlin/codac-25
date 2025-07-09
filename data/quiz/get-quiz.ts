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

export async function getAvailableTopics() {
    try {
        const topics = await prisma.quiz.findMany({
            select: { topic: true },
            distinct: ['topic'],
        });
        return topics.map(t => t.topic);
    } catch (error) {
        console.error('Failed to fetch topics:', error);
        return [];
    }
}

export async function getAvailableDifficulties() {
    try {
        const difficulties = await prisma.quiz.findMany({
            select: { difficulty: true },
            distinct: ['difficulty'],
        });
        return difficulties.map(d => d.difficulty);
    } catch (error) {
        console.error('Failed to fetch difficulties:', error);
        return [];
    }
} 