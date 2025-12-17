'use server';

import { UserRole, UserStatus } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { ServerActionResult } from '@/lib/utils/server-action-utils';

export type DashboardStats = {
  totalStudents: number;
  activeCohorts: number;
  communityMembers: number;
  totalMentors: number;
};

export type GetDashboardStatsResult = ServerActionResult<DashboardStats>;

/**
 * Fetch dashboard statistics for community metrics
 * Returns counts for students, cohorts, community members, and mentors
 */
export async function getDashboardStats(): Promise<GetDashboardStatsResult> {
  const startTime = Date.now();

  try {
    logger.info('Fetching dashboard statistics', {
      action: 'get',
      resource: 'dashboard_stats',
    });

    // Fetch all metrics in parallel for better performance
    const [totalStudents, activeCohorts, communityMembers, totalMentors] =
      await Promise.all([
        // Count students (ACTIVE status with STUDENT role)
        prisma.user.count({
          where: {
            status: UserStatus.ACTIVE,
            applicationRole: UserRole.STUDENT,
          },
        }),

        // Count active cohorts (those with at least one student)
        prisma.cohort.count({
          where: {
            students: {
              some: {
                status: UserStatus.ACTIVE,
              },
            },
          },
        }),

        // Count all active users (community members)
        prisma.user.count({
          where: {
            status: UserStatus.ACTIVE,
          },
        }),

        // Count mentors (ACTIVE status with MENTOR role)
        prisma.user.count({
          where: {
            status: UserStatus.ACTIVE,
            applicationRole: UserRole.MENTOR,
          },
        }),
      ]);

    logger.logDatabaseOperation('count', 'dashboard_stats', undefined, {
      metadata: {
        totalStudents,
        activeCohorts,
        communityMembers,
        totalMentors,
      },
    });

    logger.info('Dashboard statistics retrieved successfully', {
      metadata: {
        action: 'get',
        resource: 'dashboard_stats',
        duration: Date.now() - startTime,
        totalStudents,
        activeCohorts,
        communityMembers,
        totalMentors,
      },
    });

    return {
      success: true,
      data: {
        totalStudents,
        activeCohorts,
        communityMembers,
        totalMentors,
      },
    };
  } catch (error) {
    logger.error(
      'Failed to get dashboard statistics',
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          action: 'get',
          resource: 'dashboard_stats',
          duration: Date.now() - startTime,
        },
      }
    );

    return {
      success: false,
      error: 'Failed to load dashboard statistics. Please try again.',
    };
  }
}





