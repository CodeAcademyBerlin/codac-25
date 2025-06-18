import fs from 'fs';

import { PrismaClient, UserRole, UserStatus, CourseDifficulty, CourseCategory, LessonType, AssignmentType, PostType, LessonProgressStatus, DocumentType } from '@prisma/client';

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

  // Load seed data (for future enhancements)
  // const { students, courses: courseData, cohorts } = loadSeedData();

  // Create sample users based on Attack on Titan characters
  const users = await Promise.all([
    // Students from 104th Training Corps
    prisma.user.create({
      data: {
        email: 'eren.yeager@104th.paradis.military',
        name: 'Eren Yeager',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '104th Training Corps',
        bio: 'Determined to exterminate all Titans and explore the world beyond the walls.',
        githubUrl: 'https://github.com/erenattacktitan',
        linkedinUrl: 'https://linkedin.com/in/eren-yeager-scout',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mikasa.ackerman@104th.paradis.military',
        name: 'Mikasa Ackerman',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '104th Training Corps',
        bio: 'Elite soldier with exceptional combat skills. Specializes in Titan elimination.',
        githubUrl: 'https://github.com/mikasaackerman',
        linkedinUrl: 'https://linkedin.com/in/mikasa-ackerman',
      },
    }),
    prisma.user.create({
      data: {
        email: 'armin.arlert@104th.paradis.military',
        name: 'Armin Arlert',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '104th Training Corps',
        bio: 'Strategic genius with exceptional analytical skills. Dreams of seeing the ocean.',
        githubUrl: 'https://github.com/arminarlert',
        linkedinUrl: 'https://linkedin.com/in/armin-arlert',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jean.kirstein@104th.paradis.military',
        name: 'Jean Kirstein',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '104th Training Corps',
        bio: 'Natural leader with strong tactical awareness and ODM gear proficiency.',
        githubUrl: 'https://github.com/jeankirstein',
        linkedinUrl: 'https://linkedin.com/in/jean-kirstein',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sasha.blouse@104th.paradis.military',
        name: 'Sasha Blouse',
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        cohort: '104th Training Corps',
        bio: 'Expert archer and hunter with incredible instincts and appetite.',
        githubUrl: 'https://github.com/sashablouse',
        linkedinUrl: 'https://linkedin.com/in/sasha-blouse',
      },
    }),

    // Alumni from previous corps
    prisma.user.create({
      data: {
        email: 'hange.zoe@scouts.paradis.military',
        name: 'Hange Zoë',
        role: UserRole.ALUMNI,
        status: UserStatus.GRADUATED,
        cohort: '103rd Training Corps',
        graduationDate: new Date('2023-12-15'),
        currentJob: 'Squad Leader',
        currentCompany: 'Scout Regiment',
        bio: 'Titan researcher and former 14th Commander of the Scout Regiment. Passionate about understanding Titans.',
        githubUrl: 'https://github.com/hangezoe',
        linkedinUrl: 'https://linkedin.com/in/hange-zoe',
        portfolioUrl: 'https://titan-research.paradis.gov',
      },
    }),
    prisma.user.create({
      data: {
        email: 'marco.bodt@alumni.paradis.military',
        name: 'Marco Bodt',
        role: UserRole.ALUMNI,
        status: UserStatus.GRADUATED,
        cohort: '104th Training Corps',
        graduationDate: new Date('2023-11-20'),
        currentJob: 'Military Police Officer',
        currentCompany: 'Military Police Regiment',
        bio: 'Graduated with honors from the 104th Training Corps. Natural leader and tactical expert.',
        githubUrl: 'https://github.com/marcobodt',
        linkedinUrl: 'https://linkedin.com/in/marco-bodt',
      },
    }),

    // Mentors (former Instructors)
    prisma.user.create({
      data: {
        email: 'levi.ackerman@mentor.paradis.military',
        name: 'Captain Levi Ackerman',
        role: UserRole.MENTOR,
        status: UserStatus.ACTIVE,
        bio: 'Humanity\'s Strongest Soldier. Special Operations Squad Leader with unmatched combat skills.',
        githubUrl: 'https://github.com/captainlevi',
        linkedinUrl: 'https://linkedin.com/in/levi-ackerman',
      },
    }),
    prisma.user.create({
      data: {
        email: 'erwin.smith@mentor.paradis.military',
        name: 'Commander Erwin Smith',
        role: UserRole.MENTOR,
        status: UserStatus.ACTIVE,
        bio: '13th Commander of the Scout Regiment. Master strategist and inspirational leader.',
        githubUrl: 'https://github.com/commandererwin',
        linkedinUrl: 'https://linkedin.com/in/erwin-smith',
      },
    }),
  ]);

  console.log('✅ Created users');

  // Create courses based on Attack on Titan military training
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Titan Combat Tactics',
        description: 'Master the fundamentals of Titan combat, including weak point identification, formation strategies, and survival techniques.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 40,
        isPublished: true,
        order: 1,
      },
    }),
    prisma.course.create({
      data: {
        title: 'ODM Gear Mastery',
        description: 'Advanced techniques for Vertical Maneuvering Equipment operation, maintenance, and combat applications.',
        difficulty: CourseDifficulty.INTERMEDIATE,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 50,
        isPublished: true,
        order: 2,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Military Strategy & Formation',
        description: 'Learn advanced military formations, battlefield tactics, and expedition planning for beyond-the-walls missions.',
        difficulty: CourseDifficulty.INTERMEDIATE,
        category: CourseCategory.WEB_DEVELOPMENT,
        duration: 45,
        isPublished: true,
        order: 3,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Titan Research & Analysis',
        description: 'Scientific approach to understanding Titan behavior, anatomy, and characteristics through observation and experimentation.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.DATA_SCIENCE,
        duration: 60,
        isPublished: true,
        order: 1,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Advanced Combat Techniques',
        description: 'Elite-level combat training including dual-wielding, aerial maneuvers, and Titan shifter countermeasures.',
        difficulty: CourseDifficulty.ADVANCED,
        category: CourseCategory.DATA_SCIENCE,
        duration: 70,
        isPublished: true,
        order: 2,
      },
    }),
    prisma.course.create({
      data: {
        title: 'Military Career Development',
        description: 'Essential skills for advancing through military ranks: leadership, decision-making, and survival psychology.',
        difficulty: CourseDifficulty.BEGINNER,
        category: CourseCategory.CAREER_DEVELOPMENT,
        duration: 20,
        isPublished: true,
        order: 1,
      },
    }),
  ]);

  console.log('✅ Created courses');

  // Create projects for Titan Combat Tactics course
  const titanCombatProjects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Basic Titan Anatomy',
        description: 'Understanding Titan physiology and weak points',
        duration: 15,
        order: 1,
        isPublished: true,
        courseId: courses[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Formation Combat Training',
        description: 'Long-Range Scouting Formation practice and execution',
        duration: 20,
        order: 2,
        isPublished: true,
        courseId: courses[0].id,
      },
    }),
    prisma.project.create({
      data: {
        title: 'Emergency Protocols',
        description: 'Survival tactics when separated from formation',
        duration: 10,
        order: 3,
        isPublished: true,
        courseId: courses[0].id,
      },
    }),
  ]);

  // Create lessons for Basic Titan Anatomy project
  const anatomyLessons = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Introduction to Titan Types',
        description: 'Classification of different Titan types and their characteristics',
        type: LessonType.VIDEO,
        duration: 45,
        order: 1,
        isPublished: true,
        projectId: titanCombatProjects[0].id,
        content: {
          type: 'video',
          videoUrl: 'https://example.com/titan-types',
          transcript: 'Welcome to Titan Combat Training. Today we\'ll learn about different Titan classifications...',
        },
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Nape Targeting Techniques',
        description: 'Precision strikes on the Titan weak point for maximum effectiveness',
        type: LessonType.INTERACTIVE,
        duration: 60,
        order: 2,
        isPublished: true,
        projectId: titanCombatProjects[0].id,
        content: {
          type: 'interactive',
          exercises: [
            { question: 'What is the most effective angle for nape strikes?', answer: '45 degrees from behind and above' }
          ],
        },
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Abnormal Titan Behavior',
        description: 'Identifying and responding to irregular Titan movement patterns',
        type: LessonType.TEXT,
        duration: 50,
        order: 3,
        isPublished: true,
        projectId: titanCombatProjects[0].id,
        content: {
          type: 'text',
          markdown: '# Abnormal Titans\n\nAbnormal Titans exhibit unpredictable behavior patterns that deviate from standard Titan movement...',
        },
      },
    }),
  ]);

  // Create assignments
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        title: 'Build ODM Gear Simulator',
        description: 'Create a simulation application for ODM gear training and practice.',
        type: AssignmentType.PROJECT,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        maxScore: 100,
        isPublished: true,
        lessonId: anatomyLessons[2].id,
        instructions: {
          requirements: [
            'Basic 3D movement simulation',
            'Gas consumption mechanics',
            'Target practice mode',
            'Score tracking system'
          ],
          deliverables: ['GitHub repository link', 'Live demo URL', 'Training report with results'],
        },
      },
    }),
    prisma.assignment.create({
      data: {
        title: 'Titan Classification Quiz',
        description: 'Test your knowledge of different Titan types and characteristics.',
        type: AssignmentType.QUIZ,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        maxScore: 50,
        isPublished: true,
        lessonId: anatomyLessons[1].id,
        instructions: {
          questions: [
            { question: 'What distinguishes an Abnormal Titan from a regular Titan?', type: 'short_answer' },
            { question: 'Describe the Long-Range Scouting Formation strategy.', type: 'essay' }
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
        userId: users[0].id, // Eren
        lessonId: anatomyLessons[0].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 45,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Eren
        lessonId: anatomyLessons[1].id,
        status: LessonProgressStatus.COMPLETED,
        completedAt: new Date(),
        timeSpent: 60,
      },
    }),
    prisma.lessonProgress.create({
      data: {
        userId: users[0].id, // Eren
        lessonId: anatomyLessons[2].id,
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
  🎯 ${titanCombatProjects.length} training projects
  📖 ${anatomyLessons.length} combat lessons
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
