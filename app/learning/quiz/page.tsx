"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = [
  'JavaScript',
  'Vanilla JavaScript',
  'HTML',
  'CSS',
  'React',
  // Agrega más categorías si tienes
];

const LEVELS = [
  'Beginner',
  'Medium',
  'Advanced',
];

interface Quiz {
  id: string;
  quizTitle: string;
}

export default function QuizSelectorPage() {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setQuizzes(null);
    try {
      const res = await fetch(`/api/quiz/${encodeURIComponent(category)}/${encodeURIComponent(level)}`);
      if (!res.ok) {
        throw new Error('No se encontraron quizzes para esta combinación.');
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Selecciona tu Quiz</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Categoría</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
          disabled={loading}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-6">
        <label className="block mb-1 font-medium">Nivel</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={level}
          onChange={e => setLevel(e.target.value)}
          disabled={loading}
        >
          {LEVELS.map(lvl => (
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
                  className="w-full text-left px-4 py-2 rounded border bg-blue-50 hover:bg-blue-100 border-blue-300 font-medium"
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
            Volver
          </button>
        </div>
      ) : (
        <button
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? 'Buscando quizzes...' : 'Empezar Quiz'}
        </button>
      )}
      {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
    </div>
  );
} 