import type { UserRole, UserStatus } from '@prisma/client';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

// Type definitions for better type safety
export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
  username: string;
  role: UserRole;
  status: UserStatus;
  cohortId: string | null;
  avatar: string | null;
  emailVerified: Date | null;
};

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  cohortId: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  currentJob: string | null;
  currentCompany: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get current authenticated user from session
 * Uses React cache for performance optimization
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return null;
    }
    return session.user as AuthUser;
  } catch (error) {
    logger.error('Error getting current user', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
});

/**
 * Require authentication - redirects to signin if not authenticated
 * @throws {never} - Always redirects instead of throwing
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    logger.warn('Unauthenticated access attempt');
    redirect('/auth/signin');
  }
  return user;
}

/**
 * Require specific role - redirects if user doesn't have required role
 * @param role - Required user role
 * @throws {never} - Always redirects instead of throwing
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    logger.warn('Insufficient permissions', {
      userId: user.id,
      metadata: { userRole: user.role, requiredRole: role }
    });
    redirect('/');
  }
  return user;
}

/**
 * Require admin role - redirects if user is not admin
 * @throws {never} - Always redirects instead of throwing
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole('ADMIN');
}

/**
 * Require instructor role (ADMIN or ALUMNI) - redirects if user doesn't have required role
 * @throws {never} - Always redirects instead of throwing
 */
export async function requireInstructor(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN' && user.role !== 'ALUMNI') {
    logger.warn('Insufficient permissions for instructor access', {
      userId: user.id,
      metadata: { userRole: user.role }
    });
    redirect('/');
  }
  return user;
}

/**
 * Require active user status - redirects if user is not active
 * @throws {never} - Always redirects instead of throwing
 */
export async function requireActiveUser(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.status !== 'ACTIVE') {
    logger.warn('Inactive user access attempt', {
      userId: user.id,
      metadata: { userStatus: user.status }
    });
    redirect('/account-inactive');
  }
  return user;
}

/**
 * Fetch full user profile including avatar
 * Uses React cache for performance optimization
 * @returns User profile or null if not found
 */
export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        cohortId: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        currentJob: true,
        currentCompany: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      logger.warn('User profile not found', { userId: user.id });
      return null;
    }

    return profile;
  } catch (error) {
    logger.error('Error fetching user profile', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
});

/**
 * Check if user has specific role
 * @param role - Role to check
 * @returns boolean indicating if user has the role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.role === role;
  } catch (error) {
    logger.error('Error checking user role', error instanceof Error ? error : new Error(String(error)), {
      metadata: { role }
    });
    return false;
  }
}

/**
 * Check if user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns boolean indicating if user has any of the roles
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user ? roles.includes(user.role) : false;
  } catch (error) {
    logger.error('Error checking user roles', error instanceof Error ? error : new Error(String(error)), {
      metadata: { roles }
    });
    return false;
  }
}

/**
 * Check if user is active
 * @returns boolean indicating if user is active
 */
export async function isActiveUser(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.status === 'ACTIVE';
  } catch (error) {
    logger.error('Error checking user status', error instanceof Error ? error : new Error(String(error)));
    return false;
  }
}
