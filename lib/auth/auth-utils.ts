import { prisma } from "@/lib/db";
import { Prisma } from '@prisma/client';
import { getSession } from "./session";

// Re-export UserProfile type
export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    username: true;
    avatar: true;
    bio: true;
    applicationRole: true;
    status: true;
    role: true;
    githubUrl: true;
    linkedinUrl: true;
    portfolioUrl: true;
    currentJob: true;
    currentCompany: true;
    startDate: true;
    endDate: true;
    createdAt: true;
    updatedAt: true;
    cohort: {
      select: {
        id: true;
        name: true;
        slug: true;
        avatar: true;
        startDate: true;
        description: true;
      };
    };
    _count: {
      select: {
        projectComments: true;
      };
    };
  };
}>;

/**
 * Get current authenticated user
 * Returns null if not authenticated (doesn't throw)
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const result = await getSession();

  if (!result?.session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: result.session.user.id! },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      bio: true,
      applicationRole: true,
      status: true,
      role: true,
      githubUrl: true,
      linkedinUrl: true,
      portfolioUrl: true,
      currentJob: true,
      currentCompany: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      cohort: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          startDate: true,
          description: true,
        },
      },
      _count: {
        select: {
          projectComments: true,
        },
      },
    },
  });

  return user;
}

/**
 * Require authentication and return user
 * Throws error if not authenticated
 * Use this in server actions - for server components, use requireServerAuth() instead
 */
export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please sign in to access this resource");
  }

  return user;
}

