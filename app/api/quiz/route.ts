import { NextResponse } from 'next/server';
import { getAvailableTopics, getAvailableDifficulties } from '@/data/quiz/get-quiz';

export async function GET() {
  try {
    const [topics, difficulties] = await Promise.all([
      getAvailableTopics(),
      getAvailableDifficulties(),
    ]);
    return NextResponse.json({ topics, difficulties });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch topics or difficulties' }, { status: 500 });
  }
} 