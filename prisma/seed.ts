import fs from 'fs';

import { PrismaClient, UserRole, UserStatus, CourseCategory, LessonType, AssignmentType, PostType, LessonProgressStatus, DocumentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

    // Create projects for Full Stack Web Development course
    const fullStackProjects = await Promise.all([
      prisma.project.create({
        data: {
          title: 'Frontend Fundamentals',
          description: 'Building responsive web interfaces with HTML, CSS, and JavaScript',
          duration: 80,
          order: 1,
          isPublished: true,
          courseId: courses[0].id,
        },
      }),
      prisma.project.create({
        data: {
          title: 'React Development',
          description: 'Building modern single-page applications with React and state management',
          duration: 120,
          order: 2,
          isPublished: true,
          courseId: courses[0].id,
        },
      }),
      prisma.project.create({
        data: {
          title: 'Backend Development',
          description: 'Server-side development with Node.js, Express, and database integration',
          duration: 100,
          order: 3,
          isPublished: true,
          courseId: courses[0].id,
        },
      }),
      prisma.project.create({
        data: {
          title: 'Full Stack Project',
          description: 'Complete web application from design to deployment',
          duration: 160,
          order: 4,
          isPublished: true,
          courseId: courses[0].id,
        },
      }),
    ]);

    // Create projects for Data Science course
    const dataScienceProjects = await Promise.all([
      prisma.project.create({
        data: {
          title: 'Python for Data Science',
          description: 'Python fundamentals and data manipulation with pandas',
          duration: 60,
          order: 1,
          isPublished: true,
          courseId: courses[1].id,
        },
      }),
      prisma.project.create({
        data: {
          title: 'Data Visualization',
          description: 'Creating compelling visualizations with matplotlib and seaborn',
          duration: 40,
          order: 2,
          isPublished: true,
          courseId: courses[1].id,
        },
      }),
      prisma.project.create({
        data: {
          title: 'Machine Learning Basics',
          description: 'Introduction to supervised and unsupervised learning algorithms',
          duration: 80,
          order: 3,
          isPublished: true,
          courseId: courses[1].id,
        },
      }),
    ]);

    // Create lessons for Frontend Fundamentals project
    const frontendLessons = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'HTML Semantics and Structure',
          description: 'Building accessible and semantic HTML documents',
          type: LessonType.VIDEO,
          duration: 45,
          order: 1,
          isPublished: true,
          projectId: fullStackProjects[0].id,
          content: {
            type: 'video',
            videoUrl: 'https://example.com/html-semantics',
            transcript: 'Welcome to Frontend Development. Today we\'ll learn about semantic HTML and document structure...',
          },
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'CSS Flexbox and Grid',
          description: 'Modern CSS layout techniques for responsive design',
          type: LessonType.INTERACTIVE,
          duration: 60,
          order: 2,
          isPublished: true,
          projectId: fullStackProjects[0].id,
          content: {
            type: 'interactive',
            exercises: [
              { question: 'What is the difference between Flexbox and CSS Grid?', answer: 'Flexbox is one-dimensional, Grid is two-dimensional' }
            ],
          },
        },
      });
    logger.info('Sample quiz seeded successfully.');
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