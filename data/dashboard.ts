import { requireAuth } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalProjects: number;
  totalEnrollments: number;
  coursesInProgress: number;
  coursesCompleted: number;
  monthlyStudyTime: number;
  averageProgress: number;
  studyStreak: number;
}

export interface LearningProgressItem {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
  courseId: string;
  name: string;
  category: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'project' | 'user' | 'comment';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
  progress?: number;
}

export async function getUserStats(): Promise<UserStats> {
  const [totalUsers, activeUsers, newUsersThisMonth, totalProjects] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.project.count(),
    ]);

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    totalProjects,
    totalEnrollments: 0, // Placeholder
    coursesInProgress: 0, // Placeholder
    coursesCompleted: 0, // Placeholder
    monthlyStudyTime: 0, // Placeholder
    averageProgress: 0, // Placeholder
    studyStreak: 0, // Placeholder
  };
}

export async function getLearningProgress(): Promise<LearningProgressItem[]> {
  // Verify auth (although this is a placeholder)
  await requireAuth();
  
  // This is a placeholder implementation
  // In a real app, you'd fetch actual learning progress data
  return [
    {
      id: '1',
      title: 'Introduction to Web Development',
      progress: 75,
      completed: false,
      courseId: 'web-dev-101',
      name: 'Introduction to Web Development',
      category: 'web_development',
    },
    {
      id: '2',
      title: 'React Fundamentals',
      progress: 100,
      completed: true,
      courseId: 'react-fundamentals',
      name: 'React Fundamentals',
      category: 'frontend',
    },
    {
      id: '3',
      title: 'TypeScript Basics',
      progress: 50,
      completed: false,
      courseId: 'typescript-basics',
      name: 'TypeScript Basics',
      category: 'programming',
    },
  ];
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const user = await requireAuth();
  
  // This is a placeholder implementation
  // In a real app, you'd fetch actual recent activity data
  return [
    {
      id: '1',
      type: 'project',
      title: 'New Project Created',
      description: 'Created a new React project',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      userId: user.id,
    },
    {
      id: '2',
      type: 'user',
      title: 'Profile Updated',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      userId: user.id,
    },
  ];
}
