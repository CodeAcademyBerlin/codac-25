'use server';

import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getUserSchema, type ServerActionResult } from '@/lib/validation/user';

// Define detailed user payload for profile pages
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

export type GetUserResult = ServerActionResult<UserProfile>;

// Cached user fetch function
const getCachedUser = unstable_cache(
  async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        applicationRole: true,
        status: true,
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
  },
  ['user'],
  {
    tags: ['user', 'user-avatar'],
  }
);

export async function getUser(id: string): Promise<GetUserResult> {
  const startTime = Date.now();

  try {
    logger.logServerAction('get', 'user', {
      resourceId: id,
    });

    // Validate input
    const { id: validatedId } = getUserSchema.parse({ id });

    logger.info('getUser validation passed', {
      metadata: {
        originalId: id,
        validatedId: validatedId
      }
    });

    // Get user with detailed information using cache
    const user = await getCachedUser(validatedId);

    logger.info('getUser database query result', {
      metadata: {
        userFound: !!user,
        userId: user?.id,
        userEmail: user?.email,
        userUsername: user?.username
      }
    });

    if (!user) {
      logger.warn('User not found', {
        action: 'get',
        resource: 'user',
        resourceId: validatedId,
      });
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Check if user is missing username (legacy user from before our fix)
    if (!user.username) {
      logger.warn('User missing username, updating...', {
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name
        }
      });

      // Generate username from email or name
      let username = '';
      if (user.email) {
        username = user.email.split('@')[0].toLowerCase();
      } else if (user.name) {
        username = user.name.toLowerCase().replace(/\s+/g, '_');
      } else {
        username = `user_${user.id.slice(-6)}`;
      }

      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (true) {
        const existingUser = await prisma.user.findUnique({
          where: { username: finalUsername },
        });
        if (!existingUser) break;
        finalUsername = `${username}_${counter}`;
        counter++;
      }

      // Update user with username
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { username: finalUsername },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatar: true,
          bio: true,
          applicationRole: true,
          status: true,
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

      logger.info('User updated with username', {
        metadata: {
          userId: updatedUser.id,
          username: updatedUser.username
        }
      });

      // Return updated user
      return {
        success: true,
        data: updatedUser,
      };
    }

    logger.logDatabaseOperation('findUnique', 'user', user.id, {
      metadata: {
        role: user.role,
        status: user.status,
        email: user.email,
      },
    });

    logger.info('User retrieved successfully', {
      action: 'get',
      resource: 'user',
      resourceId: user.id,
      metadata: {
        duration: Date.now() - startTime,
        role: user.role,
        status: user.status,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.logServerActionError(
      'get',
      'user',
      error instanceof Error ? error : new Error(String(error)),
      {
        resourceId: id,
        metadata: {
          duration: Date.now() - startTime,
        },
      }
    );

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      logger.logValidationError('user', (error as any).errors, {
        resourceId: id,
      });
      return {
        success: false,
        error: 'Invalid user ID',
      };
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return {
            success: false,
            error: 'User not found',
          };
        default:
          return {
            success: false,
            error: 'Database error occurred',
          };
      }
    }

    return {
      success: false,
      error: 'Failed to retrieve user',
    };
  }
}
