import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, quizId, score, total } = await req.json();

    // Validate required fields
    if (!userId || !quizId || typeof score !== 'number' || typeof total !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true }
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Create quiz result
    const result = await prisma.quizResult.create({
      data: { userId, quizId, score, total },
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Quiz result creation error:', error);

    // More detailed error handling
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to save quiz result',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to save quiz result',
      details: String(error)
    }, { status: 500 });
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
    console.error('Quiz KPI fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz KPIs' }, { status: 500 });
  }
} 