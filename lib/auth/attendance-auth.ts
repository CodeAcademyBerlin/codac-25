'use server';

import { UserRole } from '@prisma/client';
import { getCurrentUser } from './auth-utils';

export interface AttendanceAuthContext {
  userId: string;
  userRole: UserRole;
  cohortIds: string[];
}

/**
 * Get authentication context for attendance operations
 * Returns user information and authorized cohort IDs
 */
export async function getAttendanceAuthContext(): Promise<AttendanceAuthContext | null> {
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    return null;
  }

  // Admins and mentors can access all cohorts
  // Students can only access their own cohort
  const cohortIds: string[] = [];
  
  if (user.applicationRole === 'ADMIN' || user.applicationRole === 'MENTOR') {
    // For admins and mentors, we'd need to fetch all cohort IDs
    // This is a placeholder - in production, you'd fetch from the database
    // For now, return empty array and let the validation handle specific cases
  } else if (user.cohort?.id) {
    cohortIds.push(user.cohort.id);
  }

  return {
    userId: user.id,
    userRole: user.applicationRole as UserRole,
    cohortIds,
  };
}

