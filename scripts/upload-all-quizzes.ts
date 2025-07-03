import { prisma } from "@/lib/db/prisma";
import quizzes from "./quizzes-all.json"; // Asegúrate de que la ruta sea correcta

async function main() {
  for (const quiz of quizzes) {
    // Busca si ya existe un quiz con ese topic y difficulty
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        quizTitle: quiz.quizTitle,
      },
    });

    if (existingQuiz) {
      // Agrega preguntas nuevas al quiz existente
      for (const q of quiz.questions) {
        await prisma.question.create({
          data: {
            text: q.text,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            quizId: existingQuiz.id,
          },
        });
      }
      console.log(`Preguntas agregadas al quiz existente: ${existingQuiz.id} (${quiz.quizTitle})`);
    } else {
      // Crea el quiz y sus preguntas
      const createdQuiz = await prisma.quiz.create({
        data: {
          topic: quiz.topic,
          difficulty: quiz.difficulty,
          quizTitle: quiz.quizTitle,
          questions: {
            create: quiz.questions.map((q: any) => ({
              text: q.text,
              options: JSON.stringify(q.options),
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
            })),
          },
        },
      });
      console.log(`Quiz creado: ${createdQuiz.id} (${quiz.quizTitle})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());