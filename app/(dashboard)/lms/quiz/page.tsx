"use client";

import { useRouter } from 'next/navigation';
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from 'react';

import { Quiz } from '@/types/server-action';

interface QuizListItem {
  id: string;
  quizTitle: string;
}

export default function QuizSelectorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [quizzes, setQuizzes] = useState<QuizListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<{ totalQuizzesTaken: number; averageScore: number; quizzesCompleted: number } | null>(null);
  const [kpisLoading, setKpisLoading] = useState(false);
  const [kpisError, setKpisError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/quiz');
        const data = await res.json();
        setCategories(data.topics || []);
        setLevels(data.difficulties || []);
        setCategory((data.topics && data.topics[0]) || '');
        setLevel((data.difficulties && data.difficulties[0]) || '');
      } catch {
        setError('Failed to load quiz options');
      }
    }
    fetchOptions();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    setKpisLoading(true);
    setKpisError(null);
    fetch(`/api/quiz/result?userId=${session.user.id}`)
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(() => setKpisError('Could not load your quiz stats.'))
      .finally(() => setKpisLoading(false));
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white/90 dark:bg-zinc-900/90">
        <div className="text-lg text-gray-700 dark:text-gray-200">Loading...</div>
      </div>
    );
  }
  if (!session?.user?.id) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-10 px-2" style={{ backgroundImage: 'url(/codacback.png)', backgroundSize: '77px 61px', backgroundRepeat: 'repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="max-w-md w-full p-6 bg-white/90 dark:bg-zinc-900/90 rounded shadow-lg z-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz Zone</h1>
          <p className="mb-6 text-gray-700 dark:text-gray-200">You need to be logged in to access quizzes and track your progress.</p>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            onClick={() => signIn()}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

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
      setQuizzes(quizzesList.map((q: Quiz) => ({ id: q.id, quizTitle: q.title || 'Untitled Quiz' })));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quizId: string) => {
    router.push(`/lms/quiz/${encodeURIComponent(category)}/${encodeURIComponent(level)}/${quizId}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 px-2" style={{ backgroundImage: 'url(/codacback.png)', backgroundSize: '77px 61px', backgroundRepeat: 'repeat', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="max-w-md w-full p-6 bg-white/90 dark:bg-zinc-900/90 rounded shadow-lg z-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Quiz Selection</h1>
        {session?.user?.id && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-center">Your Quiz Stats</h2>
            {kpisLoading ? (
              <div className="text-center text-gray-500">Loading stats...</div>
            ) : kpisError ? (
              <div className="text-center text-red-600">{kpisError}</div>
            ) : kpis ? (
              <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                <div><span className="font-bold">{kpis.totalQuizzesTaken}</span> taken</div>
                <div><span className="font-bold">{kpis.quizzesCompleted}</span> completed</div>
                <div>Avg. score: <span className="font-bold">{kpis.averageScore?.toFixed(2) ?? '-'}</span></div>
              </div>
            ) : null}
          </div>
        )}
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
    </div>
  );
} 