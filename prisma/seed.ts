import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('Database seeding started (Quiz Only).');

    // Seed a sample quiz
    logger.info('Seeding sample quiz...');
    await prisma.quiz.create({
      data: {
        topic: 'JavaScript',
        difficulty: 'Beginner',
        questions: {
          create: [
            {
              text: 'What keyword is used to declare a variable in JavaScript?',
              options: JSON.stringify(['var', 'let', 'const', 'all of the above']),
              correctAnswer: 'all of the above',
              explanation: '`var` is the oldest keyword. `let` and `const` were introduced in ES6. `let` allows reassignment, while `const` does not.',
            },
            {
              text: 'Which of the following is NOT a primitive data type in JavaScript?',
              options: JSON.stringify(['String', 'Number', 'Object', 'Boolean']),
              correctAnswer: 'Object',
              explanation: 'In JavaScript, primitive data types are String, Number, Boolean, Null, Undefined, Symbol, and BigInt. Object is a complex data type.',
            },
            {
              text: 'What does the `===` operator do?',
              options: JSON.stringify(['Compares for equality without type conversion', 'Compares for equality with type conversion', 'Assigns a value', 'None of the above']),
              correctAnswer: 'Compares for equality without type conversion',
              explanation: 'The strict equality operator `===` checks if two operands are equal, returning a Boolean result. Unlike the abstract equality operator (`==`), it does not perform type conversion.',
            },
            {
                text: 'How do you write a single-line comment in JavaScript?',
                options: JSON.stringify(['// This is a comment', '<!-- This is a comment -->', '/* This is a comment */', '# This is a comment']),
                correctAnswer: '// This is a comment',
                explanation: 'Single-line comments in JavaScript start with `//`. Multi-line comments start with `/*` and end with `*/`.',
            },
            {
                text: 'Which function is used to print content to the console?',
                options: JSON.stringify(['console.log()', 'print()', 'log.console()', 'debug.print()']),
                correctAnswer: 'console.log()',
                explanation: 'The `console.log()` method is used to output messages to the web console.',
            },
          ],
        },
      },
    });
    logger.info('Sample quiz seeded successfully.');

  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error('❌ Simplified Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    logger.info('✅ Simplified Seed completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error('❌ Simplified Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });