'use server';

import { Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { revalidatePath, updateTag } from 'next/cache';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  commonSelects,
  type UserPrivate,
} from '@/lib/utils/server-action-utils';
import {
  createUserSchema,
  type CreateUserInput,
  type ServerActionResult,
} from '@/lib/validation/user';

// Define return type using Prisma's generated types
type CreateUserResult = ServerActionResult<UserPrivate>;

export async function createUser(
  data: CreateUserInput
): Promise<CreateUserResult> {
  const startTime = Date.now();

  try {
    logger.logServerAction('create', 'user', {
      metadata: { email: data.email, username: data.username, role: data.role },
    });

    // Validate input data
    const validatedData = createUserSchema.parse(data);

    // Check if user with this email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      },
      select: { id: true, email: true, username: true },
    });

    if (existingUser) {
      const conflictField = existingUser.email === validatedData.email ? 'email' : 'username';
      logger.warn(`User creation failed: ${conflictField} already exists`, {
        action: 'create',
        resource: 'user',
        metadata: {
          email: validatedData.email,
          username: validatedData.username,
          conflictField
        },
      });
      return {
        success: false,
        error: `A user with this ${conflictField} already exists`,
      };
    }

    // Create user with proper types
    const user = await prisma.user.create({
      data: {
        id: nanoid(), // Generate unique ID
        email: validatedData.email,
        username: validatedData.username,
        name: validatedData.name || validatedData.email.split('@')[0],
        avatar: '/codac_logo.svg', // Set default Codac logo as avatar
        applicationRole: validatedData.role,
        status: validatedData.status,
      },
      select: commonSelects.userPrivate,
    });

    logger.logDatabaseOperation('create', 'user', user.id, {
      metadata: { email: user.email, username: user.username, role: user.applicationRole },
    });

    // Revalidate relevant paths and tags
    revalidatePath('/admin/users');
    revalidatePath('/users');
    updateTag('user');

    logger.info('User created successfully', {
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      metadata: {
        duration: Date.now() - startTime,
        email: user.email,
        username: user.username,
        role: user.applicationRole,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    logger.logServerActionError(
      'create',
      'user',
      error instanceof Error ? error : new Error(String(error)),
      {
        metadata: {
          duration: Date.now() - startTime,
          email: data.email,
          username: data.username,
        },
      }
    );

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      logger.logValidationError('user', (error as any).errors);
      return {
        success: false,
        error: (error as any).errors,
      };
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          // Check which field caused the unique constraint violation
          const target = (error.meta as any)?.target as string[] | undefined;
          if (target?.includes('email')) {
            return {
              success: false,
              error: 'A user with this email already exists',
            };
          } else if (target?.includes('username')) {
            return {
              success: false,
              error: 'A user with this username already exists',
            };
          }
          return {
            success: false,
            error: 'A user with this information already exists',
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
      error: 'Failed to create user',
    };
  }
}
