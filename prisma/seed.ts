import { PrismaClient, UserRole, UserStatus, CourseDifficulty, CourseCategory, LessonType, AssignmentType, PostType, LessonProgressStatus, SubmissionStatus, DocumentType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CODAC seed...');

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
  await prisma.coursePrerequisite.deleteMany();
  await prisma.course.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.documentCollaborator.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const users = await Promise.all([
    // Students
    prisma.user.create({
      data: {
        email: 'alex.mueller@student.codeacademyberlin.com',
        name: 'Alex Müller',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '2024-Web-Dev-Bootcamp',
        bio: 'Passionate about web development and eager to build amazing applications.',
        githubUrl: 'https://github.com/alexmueller',
        linkedinUrl: 'https://linkedin.com/in/alexmueller',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah.miller@student.codeacademyberlin.com',
        name: 'Sarah Miller',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '2024-Web-Dev-Bootcamp',
        bio: 'Frontend developer with a passion for React and modern web technologies.',
        githubUrl: 'https://github.com/sarahmiller',
        linkedinUrl: 'https://linkedin.com/in/sarahmiller',
      },
    }),
    prisma.user.create({
      data: {
        email: 'tom.koenig@student.codeacademyberlin.com',
        name: 'Tom König',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '2024-Data-Science-Bootcamp',
        bio: 'Data science enthusiast with background in mathematics.',
        githubUrl: 'https://github.com/tomkoenig',
        linkedinUrl: 'https://linkedin.com/in/tomkoenig',
      },
    }),

    // Alumni
    prisma.user.create({
      data: {
        email: 'lisa.weber@alumni.codeacademyberlin.com',
        name: 'Lisa Weber',
        role: UserRole.ALUMNI,
        status: UserStatus.GRADUATED,
        cohort: '2023-Web-Dev-Bootcamp',
        graduationDate: new Date('2023-12-15'),
        currentJob: 'Frontend Developer',
        currentCompany: 'Tech Startup Berlin',
        bio: 'Web development graduate now working as a frontend developer. Happy to mentor current students!',
        githubUrl: 'https://github.com/lisaweber',
        linkedinUrl: 'https://linkedin.com/in/lisaweber',
        portfolioUrl: 'https://lisaweber.dev',
      },
    }),
    prisma.user.create({
      data: {
        email: 'max.schmidt@alumni.codeacademyberlin.com',
        name: 'Max Schmidt',
        role: UserRole.ALUMNI,
        status: UserStatus.GRADUATED,
        cohort: '2023-Data-Science-Bootcamp',
        graduationDate: new Date('2023-11-20'),
        currentJob: 'Data Analyst',
        currentCompany: 'Berlin Analytics GmbH',
        bio: 'Data science graduate working in business intelligence and analytics.',
        githubUrl: 'https://github.com/maxschmidt',
        linkedinUrl: 'https://linkedin.com/in/maxschmidt',
      },
    }),

    // Instructors
    prisma.user.create({
      data: {
        email: 'dr.anna.hoffmann@instructor.codeacademyberlin.com',
        name: 'Dr. Anna Hoffmann',
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        bio: 'Senior Web Development Instructor with 10+ years of industry experience.',
        githubUrl: 'https://github.com/annahoffmann',
        linkedinUrl: 'https://linkedin.com/in/annahoffmann',
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.michael.braun@instructor.codeacademyberlin.com',
        name: 'Prof. Michael Braun',
        role: UserRole.INSTRUCTOR,
        status: UserStatus.ACTIVE,
        bio: 'Data Science Lead Instructor and former Senior Data Scientist at major tech companies.',
        githubUrl: 'https://github.com/michaelbraun',
        linkedinUrl: 'https://linkedin.com/in/michaelbraun',
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'JavaScript Fundamentals',
        description: 'Master the fundamentals of JavaScript programming language, including variables, functions, objects, and modern ES6+ features.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 40,
        isPublished: true,
        order: 1,
      },
    }),
    prisma.course.create({
      data: {
        title: 'React Development',
        description: 'Build modern web applications with React, including hooks, state management, and component architecture.',
        difficulty: CourseDifficulty.INTERMEDIATE,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 50,
        isPublished: true,
        order: 2,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Backend Development with Node.js',
        description: 'Learn server-side development with Node.js, Express, databases, and RESTful API design.',
        difficulty: CourseDifficulty.INTERMEDIATE,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 45,
        isPublished: true,
        order: 3,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Python for Data Science',
        description: 'Introduction to data science using Python, pandas, numpy, and data visualization libraries.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.DATA_SCIENCE,
        duration: 60,
        isPublished: true,
        order: 1,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Machine Learning Fundamentals',
        description: 'Learn the basics of machine learning algorithms, model training, and evaluation techniques.',
        difficulty: CourseDifficulty.ADVANCED,
        category: CourseCategory.DATA_SCIENCE,
        duration: 70,
        isPublished: true,
        order: 2,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Career Development for Tech',
        description: 'Essential skills for landing your first tech job: resume writing, interview preparation, and networking.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.CAREER_DEVELOPMENT,
        duration: 20,
        isPublished: true,
        order: 1,
      },
    }),
  ]);

  console.log('✅ Created courses');

  // Create lessons for JavaScript Fundamentals course
  const jsLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Introduction to JavaScript',
        description: 'What is JavaScript and why is it important for web development?',
        type: LessonType.VIDEO,
        duration: 45,
        order: 1,
        isPublished: true,
        courseId: courses[0].id,
        content: {
          type: 'video',
          videoUrl: 'https://example.com/intro-to-js',
          transcript: 'Welcome to JavaScript fundamentals...',
        },
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Variables and Data Types',
        description: 'Learn about JavaScript variables, strings, numbers, booleans, and more.',
        type: LessonType.INTERACTIVE,
        duration: 60,
        order: 2,
        isPublished: true,
        courseId: courses[0].id,
        content: {
          type: 'interactive',
          exercises: [
            { question: 'Declare a variable named age and assign it the value 25', answer: 'let age = 25;' }
          ],
        },
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Functions and Scope',
        description: 'Understanding functions, parameters, return values, and scope in JavaScript.',
        type: LessonType.TEXT,
        duration: 50,
        order: 3,
        isPublished: true,
        courseId: courses[0].id,
        content: {
          type: 'text',
          markdown: '# Functions in JavaScript\n\nFunctions are reusable blocks of code...',
        },
      },
    }),
  ]);

  // Create assignments
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        title: 'Build a Calculator',
        description: 'Create a simple calculator application using HTML, CSS, and JavaScript.',
        type: AssignmentType.PROJECT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        isPublished: true,
        lessonId: jsLessons[2].id,
        instructions: {
          requirements: [
            'Basic arithmetic operations (+, -, *, /)',
            'Clear button functionality',
            'Responsive design',
            'Error handling for invalid inputs'
          ],
          deliverables: ['GitHub repository link', 'Live demo URL', 'README with setup instructions'],
        },
      },
    }),
    prisma.assignment.create({
      data: {
        title: 'JavaScript Quiz',
        description: 'Test your knowledge of JavaScript fundamentals.',
        type: AssignmentType.QUIZ,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        maxScore: 50,
        isPublished: true,
        lessonId: jsLessons[1].id,
        instructions: {
          questions: [
            { question: 'What is the difference between let and var?', type: 'short_answer' },
            { question: 'Explain function hoisting in JavaScript.', type: 'essay' }
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created lessons and assignments');

  // Create course enrollments
  await Promise.all([
    prisma.courseEnrollment.create({
      data: {
        userId: users[0].id, // Alex
        courseId: courses[0].id, // JavaScript Fundamentals
        progress: 89,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[0].id, // Alex
        courseId: courses[1].id, // React Development
        progress: 25,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[1].id, // Sarah
        courseId: courses[0].id, // JavaScript Fundamentals
        progress: 95,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[2].id, // Tom
        courseId: courses[3].id, // Python for Data Science
        progress: 60,
      },
    }),
  ]);

  // Create lesson progress
  await Promise.all([
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: jsLessons[0].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 45,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: jsLessons[1].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 60,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: jsLessons[2].id,
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        timeSpent: 25,
      },
    }),
  ]);

  console.log('✅ Created enrollments and progress');

  // Create community posts
  const posts = await Promise.all([
    prisma.communityPost.create({
      data: {
        title: 'My First Portfolio Project!',
        content: {
          type: 'rich_text',
          blocks: [
            { type: 'paragraph', content: 'Just finished my first portfolio website! Would love to get some feedback from the community.' },
            { type: 'link', url: 'https://sarah-portfolio.netlify.app', text: 'Check it out here' }
          ],
        },
        type: PostType.SHOWCASE,
        authorId: users[1].id, // Sarah
        isPinned: false,
      },
    }),
    prisma.communityPost.create({
      data: {
        title: 'Help with React State Management',
        content: {
          type: 'rich_text',
          blocks: [
            { type: 'paragraph', content: 'I\'m struggling with understanding when to use useState vs useReducer. Can someone explain the difference?' },
            { type: 'code', language: 'javascript', content: 'const [count, setCount] = useState(0);' }
          ],
        },
        type: PostType.QUESTION,
        authorId: users[2].id, // Tom
        isPinned: false,
      },
    }),
    prisma.communityPost.create({
      data: {
        title: 'Frontend Developer Position at Tech Startup',
        content: {
          type: 'rich_text',
          blocks: [
            { type: 'paragraph', content: 'We\'re looking for a Junior Frontend Developer to join our team. Great opportunity for recent graduates!' },
            { type: 'paragraph', content: 'Requirements: React, TypeScript, Git, willingness to learn' },
            { type: 'paragraph', content: 'Send your portfolio to jobs@techstartup.berlin' }
          ],
        },
        type: PostType.JOB_POSTING,
        authorId: users[3].id, // Lisa (Alumni)
        isPinned: true,
      },
    }),
  ]);

  // Create comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: {
          type: 'rich_text',
          blocks: [{ type: 'paragraph', content: 'Great work Sarah! The design looks really clean and professional.' }],
        },
        authorId: users[3].id, // Lisa
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: {
          type: 'rich_text',
          blocks: [{ type: 'paragraph', content: 'useState is for simple state, useReducer is better for complex state logic. I can explain more if needed!' }],
        },
        authorId: users[5].id, // Dr. Anna (Instructor)
        postId: posts[1].id,
      },
    }),
  ]);

  console.log('✅ Created community posts and comments');

  // Create mentorships
  await Promise.all([
    prisma.mentorship.create({
      data: {
        mentorId: users[3].id, // Lisa (Alumni)
        menteeId: users[0].id, // Alex (Student)
        status: 'ACTIVE',
        message: 'Looking forward to helping you with your career transition!',
        acceptedAt: new Date(),
      },
    }),
    prisma.mentorship.create({
      data: {
        mentorId: users[4].id, // Max (Alumni)
        menteeId: users[2].id, // Tom (Student)
        status: 'PENDING',
        message: 'Hi! I saw you\'re studying data science and would love to share my experience.',
      },
    }),
  ]);

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        type: 'COURSE_COMPLETION',
        points: 10,
        condition: { type: 'lesson_completed', count: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'JavaScript Master',
        description: 'Complete JavaScript Fundamentals course',
        icon: '🚀',
        type: 'COURSE_COMPLETION',
        points: 100,
        condition: { type: 'course_completed', courseId: courses[0].id },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Community Helper',
        description: 'Help 5 community members by answering questions',
        icon: '🤝',
        type: 'COMMUNITY_CONTRIBUTION',
        points: 50,
        condition: { type: 'comments_count', count: 5 },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Study Streak',
        description: 'Study for 7 days in a row',
        icon: '🔥',
        type: 'STREAK',
        points: 75,
        condition: { type: 'daily_streak', days: 7 },
      },
    }),
  ]);

  // Award some achievements
  await Promise.all([
    prisma.userAchievement.create({
      data: {
        userId: users[0].id, // Alex
        achievementId: achievements[0].id, // First Steps
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[0].id, // Alex
        achievementId: achievements[3].id, // Study Streak
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[1].id, // Sarah
        achievementId: achievements[1].id, // JavaScript Master
      },
    }),
  ]);

  console.log('✅ Created achievements');

  // Create some documents for course materials
  await Promise.all([
    prisma.document.create({
      data: {
        title: 'JavaScript Cheat Sheet',
        content: {
          type: 'rich_text',
          blocks: [
            { type: 'heading', level: 1, content: 'JavaScript Quick Reference' },
            { type: 'paragraph', content: 'Essential JavaScript syntax and concepts...' },
            { type: 'code', language: 'javascript', content: 'const greeting = "Hello, World!";' }
          ],
        },
        type: DocumentType.COURSE_MATERIAL,
        isPublished: true,
        authorId: users[5].id, // Dr. Anna
        icon: '📝',
      },
    }),
    prisma.document.create({
      data: {
        title: 'Career Preparation Guide',
        content: {
          type: 'rich_text',
          blocks: [
            { type: 'heading', level: 1, content: 'Getting Ready for Your First Tech Job' },
            { type: 'paragraph', content: 'A comprehensive guide to preparing for your career transition...' }
          ],
        },
        type: DocumentType.RESOURCE,
        isPublished: true,
        authorId: users[3].id, // Lisa
        icon: '💼',
      },
    }),
  ]);

  console.log('✅ Created documents');

  console.log('🎉 CODAC seed completed successfully!');
  console.log(`
📊 Created:
  👥 ${users.length} users (students, alumni, instructors)
  📚 ${courses.length} courses
  📖 ${jsLessons.length} lessons
  📝 ${assignments.length} assignments
  💬 ${posts.length} community posts
  🏆 ${achievements.length} achievements
  🤝 2 mentorship connections
  📄 2 resource documents

🚀 CODAC is ready to go!
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
