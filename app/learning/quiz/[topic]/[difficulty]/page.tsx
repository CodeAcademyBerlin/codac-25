'use client';

import { useEffect, useState } from 'react';
import { Quiz, Question } from '@prisma/client';

type QuestionWithOptions = Question & {
    options: string[];
};

type QuizWithQuestions = Quiz & {
    questions: QuestionWithOptions[];
};

export default function QuizPage({
    params,
}: {
    params: { topic: string; difficulty: string };
}) {
    const { topic, difficulty } = params;
    const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuiz() {
            try {
                setLoading(true);
                const response = await fetch(`/api/quiz/${topic}/${difficulty}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch quiz');
                }
                const data = await response.json();
                setQuiz(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchQuiz();
    }, [topic, difficulty]);

    if (loading) {
        return <div>Loading quiz...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!quiz) {
        return <div>Quiz not found.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                {quiz.topic} Quiz ({quiz.difficulty})
            </h1>
            <pre className="bg-gray-100 p-4 rounded-lg">
                {JSON.stringify(quiz, null, 2)}
            </pre>
        </div>
    );
} 