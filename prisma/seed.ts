import fs from 'fs';

import { PrismaClient, UserRole, UserStatus, CourseCategory, LessonType, AssignmentType, PostType, LessonProgressStatus, DocumentType } from '@prisma/client';

const prisma = new PrismaClient();

// Note: JSON seed files in ./seed/ folder are available for future enhancements

async function main() {
  console.log('🌱 Starting CODAC Attack on Titan seed...');

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
          avatar: cohortData.image || cohortData.avatar,
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
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          cohortId: cohorts.find(c => c.slug === student.cohort)?.id,
          avatar: student.avatar,
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
          role: UserRole.MENTOR,
          status: UserStatus.ACTIVE,
          cohortId: mentorsCohort?.id,
          avatar: mentor.avatar,
          bio: mentor.bio,
          githubUrl: `https://github.com/${mentor.name.toLowerCase().replace(' ', '')}`,
          linkedinUrl: `https://linkedin.com/in/${mentor.name.toLowerCase().replace(' ', '-')}`,
        },
      })
    )
  );

  const users = [...studentUsers, ...mentorUsers];

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
    }),
    prisma.lesson.create({
      data: {
        title: 'JavaScript DOM Manipulation',
        description: 'Interacting with web pages using JavaScript',
        type: LessonType.TEXT,
        duration: 50,
        order: 3,
        isPublished: true,
        projectId: fullStackProjects[0].id,
        content: {
          type: 'text',
          markdown: '# DOM Manipulation\n\nThe Document Object Model (DOM) is the programming interface for web documents...',
        },
      },
    }),
  ]);

  // Create assignments
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        title: 'Build Personal Portfolio Website',
        description: 'Create a responsive portfolio website showcasing your projects and skills.',
        type: AssignmentType.PROJECT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        isPublished: true,
        lessonId: frontendLessons[2].id,
        instructions: {
          requirements: [
            'Responsive design using CSS Grid/Flexbox',
            'Interactive JavaScript features',
            'Semantic HTML structure',
            'Accessible design principles'
          ],
          deliverables: ['GitHub repository link', 'Live deployed URL', 'Design documentation'],
        },
      },
    }),
    prisma.assignment.create({
      data: {
        title: 'Frontend Fundamentals Quiz',
        description: 'Test your knowledge of HTML, CSS, and JavaScript fundamentals.',
        type: AssignmentType.QUIZ,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        maxScore: 50,
        isPublished: true,
        lessonId: frontendLessons[1].id,
        instructions: {
          questions: [
            { question: 'What is the difference between semantic and non-semantic HTML elements?', type: 'short_answer' },
            { question: 'Explain how CSS Grid differs from Flexbox and when to use each.', type: 'essay' }
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created projects, lessons and assignments');

  // Create course enrollments
  await Promise.all([
    prisma.courseEnrollment.create({
      data: {
        userId: users[0].id, // Eren
        courseId: courses[0].id, // Titan Combat Tactics
        progress: 89,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[0].id, // Eren
        courseId: courses[1].id, // ODM Gear Mastery
        progress: 25,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[1].id, // Mikasa
        courseId: courses[0].id, // Titan Combat Tactics
        progress: 95,
      },
    }),
    prisma.courseEnrollment.create({
      data: {
        userId: users[2].id, // Armin
        courseId: courses[3].id, // Titan Research & Analysis
        progress: 60,
      },
    }),
  ]);

  // Create lesson progress
  await Promise.all([
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: frontendLessons[0].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 45,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: frontendLessons[1].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 60,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Alex
        lessonId: frontendLessons[2].id,
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
        title: 'My First ODM Gear Training Results!',
        content: [
          {
            type: 'p',
            children: [{ text: 'Just completed my first ODM gear simulation training! My nape strike accuracy improved by 40%.' }],
          },
          {
            type: 'p',
            children: [
              { text: 'Check out my training stats: ' },
              { text: 'https://odm-simulator.paradis.military/mikasa', link: true },
            ],
          },
        ],
        type: PostType.SHOWCASE,
        authorId: users[1].id, // Mikasa
        isPinned: false,
      },
    }),
    prisma.communityPost.create({
      data: {
        title: 'Help with Abnormal Titan Behavior Analysis',
        content: [
          {
            type: 'p',
            children: [{ text: 'I\'m struggling with predicting Abnormal Titan movement patterns. Any tips from experienced scouts?' }],
          },
          {
            type: 'code_block',
            lang: 'javascript',
            children: [{ text: 'if (titan.type === "abnormal") {\n  // How to predict next move?\n}' }],
          },
        ],
        type: PostType.QUESTION,
        authorId: users[3].id, // Jean
        isPinned: false,
      },
    }),
    prisma.communityPost.create({
      data: {
        title: 'Scout Regiment Recruitment - Elite Squad Position',
        content: [
          {
            type: 'p',
            children: [{ text: 'Special Operations Squad is looking for exceptional graduates to join our elite unit.' }],
          },
          {
            type: 'p',
            children: [{ text: 'Requirements: Top 10 graduate ranking, ODM gear mastery, proven Titan kills' }],
          },
          {
            type: 'p',
            children: [{ text: 'Apply to: recruitment@scouts.paradis.military' }],
          },
        ],
        type: PostType.JOB_POSTING,
        authorId: users[5].id, // Hange (Alumni)
        isPinned: true,
      },
    }),
  ]);

  // Create comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: [
          {
            type: 'p',
            children: [{ text: 'Excellent work Mikasa! Your ODM gear skills are truly exceptional. Keep pushing your limits!' }],
          },
        ],
        authorId: users[7].id, // Levi
        postId: posts[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        content: [
          {
            type: 'p',
            children: [{ text: 'Abnormal Titans often target humans instead of wandering aimlessly. Study their eye movements - they\'re more focused!' }],
          },
        ],
        authorId: users[5].id, // Hange
        postId: posts[1].id,
      },
    }),
  ]);

  console.log('✅ Created community posts and comments');

  // Create mentorships
  await Promise.all([
    prisma.mentorship.create({
      data: {
        mentorId: users[7].id, // Levi (Mentor)
        menteeId: users[0].id, // Eren (Student)
        status: 'ACTIVE',
        message: 'I\'ll help you become a better soldier. Training starts at dawn.',
        acceptedAt: new Date(),
      },
    }),
    prisma.mentorship.create({
      data: {
        mentorId: users[8].id, // Erwin (Mentor)
        menteeId: users[2].id, // Armin (Student)
        status: 'PENDING',
        message: 'Your strategic thinking shows great promise. I\'d like to guide your development.',
      },
    }),
  ]);

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        title: 'First Titan Kill',
        description: 'Successfully eliminate your first Titan',
        icon: '⚔️',
        type: 'COURSE_COMPLETION',
        points: 10,
        condition: { type: 'lesson_completed', count: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Titan Slayer',
        description: 'Complete Titan Combat Tactics course',
        icon: '🏆',
        type: 'COURSE_COMPLETION',
        points: 100,
        condition: { type: 'course_completed', courseId: courses[0].id },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Squad Leader',
        description: 'Help 5 fellow soldiers with combat techniques',
        icon: '👥',
        type: 'COMMUNITY_CONTRIBUTION',
        points: 50,
        condition: { type: 'comments_count', count: 5 },
      },
    }),
    prisma.achievement.create({
      data: {
        title: 'Dedication to Humanity',
        description: 'Train consistently for 7 days in a row',
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
        userId: users[0].id, // Eren
        achievementId: achievements[0].id, // First Titan Kill
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[0].id, // Eren
        achievementId: achievements[3].id, // Dedication to Humanity
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[1].id, // Mikasa
        achievementId: achievements[1].id, // Titan Slayer
      },
    }),
  ]);

  console.log('✅ Created achievements');

  // Create some documents for military training materials
  await Promise.all([
    prisma.document.create({
      data: {
        title: 'ODM Gear Operation Manual',
        content: [
          {
            type: 'h1',
            children: [{ text: 'Vertical Maneuvering Equipment - Complete Guide' }],
          },
          {
            type: 'p',
            children: [{ text: 'Essential techniques and safety protocols for ODM gear operation in Titan combat scenarios.' }],
          },
          {
            type: 'h2',
            children: [{ text: 'Equipment Overview' }],
          },
          {
            type: 'p',
            children: [{ text: 'The ODM gear consists of a harness system, gas-powered grappling hooks, and retractable steel cables for three-dimensional movement.' }],
          },
          {
            type: 'h2',
            children: [{ text: 'Basic Maneuvers' }],
          },
          {
            type: 'ul',
            children: [
              { type: 'li', children: [{ text: 'Hook placement for maximum momentum' }] },
              { type: 'li', children: [{ text: 'Gas conservation techniques' }] },
              { type: 'li', children: [{ text: 'Emergency blade replacement' }] },
              { type: 'li', children: [{ text: 'Aerial combat positioning' }] },
            ],
          },
        ],
        type: DocumentType.COURSE_MATERIAL,
        isPublished: true,
        authorId: users[7].id, // Levi
        icon: '⚙️',
      },
    }),
    prisma.document.create({
      data: {
        title: 'Military Career Advancement Guide',
        content: [
          {
            type: 'h1',
            children: [{ text: 'Rising Through the Ranks - A Soldier\'s Guide' }],
          },
          {
            type: 'p',
            children: [{ text: 'Strategic advice for advancing your military career and joining elite units like the Scout Regiment.' }],
          },
          {
            type: 'h2',
            children: [{ text: 'Training Corps Excellence' }],
          },
          {
            type: 'p',
            children: [{ text: 'Focus on graduating in the top 10 of your training class. This opens doors to all three military branches.' }],
          },
          {
            type: 'ul',
            children: [
              { type: 'li', children: [{ text: 'Master all forms of combat training' }] },
              { type: 'li', children: [{ text: 'Excel in ODM gear proficiency tests' }] },
              { type: 'li', children: [{ text: 'Demonstrate leadership qualities' }] },
              { type: 'li', children: [{ text: 'Build strong team relationships' }] },
            ],
          },
          {
            type: 'h2',
            children: [{ text: 'Choosing Your Path' }],
          },
          {
            type: 'p',
            children: [{ text: 'Military Police for safety, Garrison for defense, or Scout Regiment for humanity\'s advancement. Choose wisely based on your values and courage.' }],
          },
        ],
        type: DocumentType.RESOURCE,
        isPublished: true,
        authorId: users[8].id, // Erwin
        icon: '📋',
      },
    }),
  ]);

  console.log('✅ Created documents');

  console.log('🎉 CODAC Attack on Titan seed completed successfully!');
  console.log(`
📊 Created:
  👥 ${users.length} users (cadets, veterans, mentors)
  📚 ${courses.length} military training courses
  🎯 ${fullStackProjects.length + dataScienceProjects.length} training projects
  📖 ${frontendLessons.length} combat lessons
  📝 ${assignments.length} training assignments
  💬 ${posts.length} military community posts
  🏆 ${achievements.length} military achievements
  🤝 2 mentorship connections
  📄 2 training manuals

⚔️ The 104th Training Corps is ready for Titan combat training!
  `);
}

main()
  .then(() => {
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure your database is running');
    console.error('2. Check your DATABASE_URL in .env');
    console.error('3. Try running: pnpm db:push first');
    console.error('4. If the issue persists, try: pnpm db:reset');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
