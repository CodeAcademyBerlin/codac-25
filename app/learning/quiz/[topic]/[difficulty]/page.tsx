"use client";
import { use } from "react";
import { useEffect, useState } from 'react';

type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
};

type Quiz = {
  id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
};

export default function QuizPage({
  params,
}: {
  params: Promise<{ topic: string; difficulty: string }>;
}) {
  const { topic, difficulty } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para el quiz interactivo
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

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
        // Parse options if needed
        const questions = data.questions.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options),
        }));
        setQuiz({ ...data, questions });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [topic, difficulty]);

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz || !quiz.questions.length) return <div>Quiz not found or has no questions.</div>;

  const question = quiz.questions[current];

  function handleSelect(option: string) {
    setSelected(option);
    setShowAnswer(true);
    if (option === question.correctAnswer) setScore(s => s + 1);
  }

  function handleNext() {
    setSelected(null);
    setShowAnswer(false);
    if (current + 1 < quiz.questions.length) {
      setCurrent(c => c + 1);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Quiz completed!</h1>
        <p className="text-center mb-4">Score: <span className="font-bold">{score} / {quiz.questions.length}</span></p>
        <ul className="mb-6">
          {quiz.questions.map((q, i) => (
            <li key={q.id} className="mb-2">
              <span className="font-medium">{i + 1}. {q.text}</span>
              <br />
              <span className="text-green-700">Correct answer: {q.correctAnswer}</span>
            </li>
          ))}
        </ul>
        <a href="/learning/quiz" className="block text-center text-blue-600 hover:underline">Back to quiz selection</a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-2">{quiz.topic} Quiz ({quiz.difficulty})</h1>
      <div className="mb-4">
        <span className="text-gray-600">Question {current + 1} of {quiz.questions.length}</span>
      </div>
      <div className="mb-4 font-medium">{question.text}</div>
      <div className="space-y-2 mb-4">
        {question.options.map(option => (
          <button
            key={option}
            className={`w-full text-left px-4 py-2 rounded border
              ${selected === option
                ? option === question.correctAnswer
                  ? 'bg-green-200 border-green-500'
                  : 'bg-red-200 border-red-500'
                : 'bg-white border-gray-300 hover:bg-gray-100'}
              ${showAnswer && option === question.correctAnswer ? 'font-bold' : ''}
            `}
            disabled={showAnswer}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="mb-4">
          {selected === question.correctAnswer ? (
            <div className="text-green-700 font-semibold">Correct!</div>
          ) : (
            <div className="text-red-700 font-semibold">Incorrect. The correct answer is: {question.correctAnswer}</div>
          )}
          {question.explanation && (
            <div className="text-gray-600 mt-2">{question.explanation}</div>
          )}
        </div>
      )}
      <button
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        onClick={handleNext}
        disabled={!showAnswer}
      >
        {current + 1 < quiz.questions.length ? 'Next' : 'View result'}
      </button>
    </div>
  );
} 