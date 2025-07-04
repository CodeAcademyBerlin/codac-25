import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, quizId, score, total } = await req.json();
    if (!userId || !quizId || typeof score !== 'number' || typeof total !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }
    const result = await prisma.quizResult.create({
      data: { userId, quizId, score, total },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const where = userId ? { userId } : {};
    const [count, avg, completed] = await Promise.all([
      prisma.quizResult.count({ where }),
      prisma.quizResult.aggregate({
        _avg: { score: true },
      }),
      prisma.quizResult.findMany({
        where,
        select: { quizId: true },
        distinct: ['quizId'],
      }),
    ]);
    return NextResponse.json({
      totalQuizzesTaken: count,
      averageScore: avg._avg.score,
      quizzesCompleted: completed.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quiz KPIs' }, { status: 500 });
  }
} 