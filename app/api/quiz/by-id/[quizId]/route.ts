import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;
  if (!quizId) {
    return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
  }
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  return NextResponse.json(quiz);
} 