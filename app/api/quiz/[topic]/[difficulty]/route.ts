import { NextResponse } from 'next/server';
import { getQuiz } from '@/data/quiz/get-quiz';

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
        const quiz = await getQuiz(topic, difficulty);

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Parse the options string back into an array for each question
        const quizWithParsedOptions = {
            ...quiz,
            questions: quiz.questions.map((q) => ({
                ...q,
                options: JSON.parse(q.options as string),
            })),
        };


        return NextResponse.json(quizWithParsedOptions);
    } catch (error) {
        console.error(`Failed to fetch quiz for topic ${topic}:`, error);
        return NextResponse.json(
            { error: 'An internal server error occurred' },
            { status: 500 }
        );
    }
} 