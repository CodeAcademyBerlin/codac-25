"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  quizTitle: string;
}

export default function QuizSelectorPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        setCategories(data.topics || []);
        setLevels(data.difficulties || []);
        setCategory((data.topics && data.topics[0]) || '');
        setLevel((data.difficulties && data.difficulties[0]) || '');
      } catch (err) {
        setError('Failed to load quiz options');
      }
    }
    fetchOptions();
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setQuizzes(null);
    try {
      const res = await fetch(`/api/quiz/${encodeURIComponent(category)}/${encodeURIComponent(level)}`);
      if (!res.ok) {
        throw new Error('No quizzes found for this combination.');
      }
      const data = await res.json();
      // Si el endpoint devuelve un array de quizzes:
      const quizzesList = Array.isArray(data) ? data : (data.quizzes || [data]);
      if (!quizzesList.length) throw new Error('No hay quizzes disponibles.');
      setQuizzes(quizzesList.map((q: any) => ({ id: q.id, quizTitle: q.quizTitle })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quizId: string) => {
    router.push(`/learning/quiz/${encodeURIComponent(category)}/${encodeURIComponent(level)}/${quizId}`);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-zinc-900 rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Quiz Selection</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Category</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={loading || categories.length === 0}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Level</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={level}
          onChange={e => setLevel(e.target.value)}
          disabled={loading || levels.length === 0}
        >
          {levels.map(lvl => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>
      {quizzes ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Elige un quiz:</h2>
          <ul className="space-y-2 mb-4">
            {quizzes.map(q => (
              <li key={q.id}>
                <button
                  className="w-full text-left text-zinc-900 dark:text-zinc-100 px-4 py-2 rounded border bg-blue-50 hover:bg-blue-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border-blue-300 font-medium"
                  onClick={() => handleQuizSelect(q.id)}
                >
                  {q.quizTitle}
                </button>
              </li>
            ))}
          </ul>
          <button
            className="w-full bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300 transition"
            onClick={() => setQuizzes(null)}
          >
            Back
          </button>
        </div>
      ) : (
        <button
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? 'Searching quizzes...' : 'Start Quiz'}
        </button>
      )}
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
    </div>
  );
} 