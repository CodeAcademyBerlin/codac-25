import { NextResponse } from 'next/server';
import { getQuizzes } from '@/data/quiz/get-quiz';

export async function GET(
    request: Request,
    { params }: { params: { topic: string; difficulty: string } }
) {
    const { topic, difficulty } = params;

    if (!topic || !difficulty) {
        return NextResponse.json(
            { error: 'Topic and difficulty are required' },
            { status: 400 }
        );
    }

    try {
        const quizzes = await getQuizzes(topic, difficulty);
        if (!quizzes.length) {
            return NextResponse.json({ error: 'No quizzes found' }, { status: 404 });
        }
        // Parse options for each quiz/question
        const quizzesWithParsedOptions = quizzes.map((quiz) => ({
            ...quiz,
            questions: quiz.questions.map((q: any) => ({
                ...q,
                options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
            })),
        }));
        return NextResponse.json(quizzesWithParsedOptions);
    } catch (error) {
        console.error(`Failed to fetch quiz for topic ${topic}:`, error);
        return NextResponse.json(
            { error: 'An internal server error occurred' },
            { status: 500 }
        );
    }
} 