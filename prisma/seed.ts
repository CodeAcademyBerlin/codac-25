import fs from 'fs';

import { PrismaClient, UserRole, UserStatus, CourseCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('Database seeding started (Quiz Only).');

    // Hash default password for all seeded users
    const defaultPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Default password for all users: password123');

    // Ensure required directories exist
    const requiredDirs = ['docs', 'public', 'uploads'];

    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created missing directory: ${dir}`);
      }
    });

    // Clean existing data
    await prisma.userAchievement.deleteMany();
    await prisma.achievement.deleteMany();
    await prisma.assignmentSubmission.deleteMany();
    await prisma.lessonProgress.deleteMany();
    await prisma.courseEnrollment.deleteMany();
    await prisma.mentorship.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.communityPost.deleteMany();
    await prisma.assignmentResource.deleteMany();
    await prisma.lessonResource.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.project.deleteMany();
    await prisma.coursePrerequisite.deleteMany();
    await prisma.course.deleteMany();
    await prisma.documentVersion.deleteMany();
    await prisma.documentCollaborator.deleteMany();
    await prisma.suggestion.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.document.deleteMany();
    await prisma.jobApplication.deleteMany();
    await prisma.job.deleteMany();
    await prisma.user.deleteMany();
    await prisma.cohort.deleteMany();

    // Load seed data from JSON files
    const cohortsData = JSON.parse(fs.readFileSync('prisma/seed/cohorts.json', 'utf-8'));
    const studentsData = JSON.parse(fs.readFileSync('prisma/seed/students.json', 'utf-8'));
    const coursesData = JSON.parse(fs.readFileSync('prisma/seed/courses.json', 'utf-8'));
    const mentorsData = JSON.parse(fs.readFileSync('prisma/seed/mentors.json', 'utf-8'));
    // Create cohorts first
    const cohorts = await Promise.all(
      cohortsData.map((cohortData: any) =>
        prisma.cohort.create({
          data: {
            name: cohortData.name,
            startDate: new Date(cohortData.startDate),
            description: cohortData.description,
            image: cohortData.image,
            slug: cohortData.slug,
          },
        })
      )
    );

    console.log('✅ Created cohorts');


    // Create users from students JSON data
    const studentUsers = await Promise.all(
      studentsData.map((student: any) => {
        const cohort = cohorts.find(c => c.slug === student.cohort);
        return prisma.user.create({
          data: {
            email: `${student.name.toLowerCase().replace(' ', '.')}@codac.academy`,
            name: student.name,
            password: defaultPassword,
            role: UserRole.STUDENT,
            status: UserStatus.ACTIVE,
            cohortId: cohorts.find(c => c.slug === student.cohort)?.id,
            image: student.avatar,
            bio: `Coding academy student specializing in ${cohort?.name || 'software development'}.`,
            githubUrl: `https://github.com/${student.name.toLowerCase().replace(' ', '')}`,
            linkedinUrl: `https://linkedin.com/in/${student.name.toLowerCase().replace(' ', '-')}`,
          },
        });
      })
    );


    const mentorsCohort = cohorts.find(c => c.slug === 'mentors');
    const mentorUsers = await Promise.all(
      mentorsData.map((mentor: any) =>
        prisma.user.create({
          data: {
            email: `${mentor.name.toLowerCase().replace(' ', '.')}@codac.academy`,
            name: mentor.name,
            password: defaultPassword,
            role: UserRole.MENTOR,
            status: UserStatus.ACTIVE,
            cohortId: mentorsCohort?.id,
            image: mentor.avatar,
            bio: mentor.bio,
            githubUrl: `https://github.com/${mentor.name.toLowerCase().replace(' ', '')}`,
            linkedinUrl: `https://linkedin.com/in/${mentor.name.toLowerCase().replace(' ', '-')}`,
          },
        })
      )
    );

    // Create admin users
    const adminUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@codac.academy',
          name: 'Admin User',
          password: defaultPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RjMjYyNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUQ8L3RleHQ+PC9zdmc+',
          bio: 'System administrator responsible for platform management and user oversight.',
          githubUrl: 'https://github.com/codac-admin',
          linkedinUrl: 'https://linkedin.com/company/codac-academy',
        },
      }),
      prisma.user.create({
        data: {
          email: 'kenny.ackerman@codac.academy',
          name: 'Kenny Ackerman',
          password: defaultPassword,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+S0E8L3RleHQ+PC9zdmc+',
          bio: 'The Underground King turned academy administrator. Expert in anti-personnel combat and database management.',
          githubUrl: 'https://github.com/kenny-underground',
          linkedinUrl: 'https://linkedin.com/in/kenny-ackerman',
        },
      }),
    ]);

    // Create alumni users
    const alumniUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'marco.bott@alumni.codac.academy',
          name: 'Marco Bott',
          password: defaultPassword,
          role: UserRole.ALUMNI,
          status: UserStatus.GRADUATED,
          graduationDate: new Date('2023-12-15'),
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzE2YTM0YSIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUI8L3RleHQ+PC9zdmc+',
          bio: 'Full-stack developer at a leading tech company. CODAC graduate specializing in React and Node.js.',
          githubUrl: 'https://github.com/marco-dev',
          linkedinUrl: 'https://linkedin.com/in/marco-bott',
          currentJob: 'Senior Full-Stack Developer',
          currentCompany: 'TechCorp Inc.',
          portfolioUrl: 'https://marco-portfolio.dev',
        },
      }),
      prisma.user.create({
        data: {
          email: 'annie.leonhart@alumni.codac.academy',
          name: 'Annie Leonhart',
          password: defaultPassword,
          role: UserRole.ALUMNI,
          status: UserStatus.GRADUATED,
          graduationDate: new Date('2023-08-30'),
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUw8L3RleHQ+PC9zdmc+',
          bio: 'Data scientist and machine learning engineer. CODAC graduate now working in AI research.',
          githubUrl: 'https://github.com/annie-ml',
          linkedinUrl: 'https://linkedin.com/in/annie-leonhart',
          currentJob: 'Machine Learning Engineer',
          currentCompany: 'AI Research Labs',
          portfolioUrl: 'https://annie-ml.com',
        },
      }),
    ]);

    const users = [...studentUsers, ...mentorUsers, ...adminUsers, ...alumniUsers];

    console.log('✅ Created users');

    // Assign users to cohorts
    await Promise.all(
      users.map((user) => {
        return prisma.user.update({
          where: { id: user.id },
          data: { cohortId: user.cohortId },
        });
      })
    );
    console.log('✅ Assigned users to cohorts');

    // Create courses based on JSON seed data
    const courses = await Promise.all(
      coursesData.map((courseData: any) =>
        prisma.course.create({
          data: {
            title: courseData.name,
            description: courseData.description,
            category: courseData.category as CourseCategory,
            duration: courseData.duration,
            isPublished: courseData.isPublished,
            order: courseData.order,
          },
        })
      )
    );

    console.log('✅ Created courses');
    console.log('📊 Course details:', courses.map(c => ({ id: c.id, title: c.title })));

    // Skip project and lesson creation for now - focus on quiz seeding
    console.log('⏭️  Skipping project and lesson creation to focus on quiz seeding...');

    console.log('📚 Starting quiz seeding process...');

    // Load and seed all quizzes from JSON file
    console.log('📖 Loading quiz data from JSON file...');
    const quizzesData = JSON.parse(fs.readFileSync('scripts/quizzes-all.json', 'utf-8'));

    console.log(`📋 Found ${quizzesData.length} quizzes to seed`);
    logger.info(`Starting to seed ${quizzesData.length} quizzes...`);

    try {
      // Clean existing quiz data
      console.log('🧹 Cleaning existing quiz data...');
      await prisma.question.deleteMany();
      await prisma.quiz.deleteMany();
      console.log('✅ Cleaned existing quiz data');

      // Create all quizzes with their questions
      console.log('📝 Creating quizzes and questions...');
      const quizzes = await Promise.all(
        quizzesData.map((quizData: any) =>
          prisma.quiz.create({
            data: {
              quizTitle: quizData.quizTitle,
              topic: quizData.topic,
              difficulty: quizData.difficulty,
              questions: {
                create: quizData.questions.map((question: any) => ({
                  text: question.text,
                  options: JSON.stringify(question.options),
                  correctAnswer: question.correctAnswer,
                  explanation: question.explanation,
                })),
              },
            },
          })
        )
      );

      console.log(`✅ Successfully seeded ${quizzes.length} quizzes with questions`);
      logger.info(`✅ Successfully seeded ${quizzes.length} quizzes with questions`);
    } catch (error) {
      const quizError = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error during quiz seeding:', quizError);
      logger.error('❌ Quiz seeding failed:', quizError);
      throw quizError;
    }
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