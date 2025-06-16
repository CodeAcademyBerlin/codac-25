'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    createUserSchema,
    type CreateUserInput,
    type ServerActionResult
} from '@/lib/validation/user';
import {
    type UserPrivate,
    commonSelects
} from '@/lib/server-action-utils';

// Define return type using Prisma's generated types
type CreateUserResult = ServerActionResult<UserPrivate>;

export async function createUser(data: CreateUserInput): Promise<CreateUserResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('create', 'user', {
            metadata: { email: data.email, role: data.role }
        });

        // Validate input data
        const validatedData = createUserSchema.parse(data);

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
            select: { id: true, email: true },
        });

        if (existingUser) {
            logger.warn('User creation failed: email already exists', {
                action: 'create',
                resource: 'user',
                metadata: { email: validatedData.email }
            });
            return {
                success: false,
                error: 'A user with this email already exists'
            };
        }

        // Create user with proper types
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                role: validatedData.role,
                status: validatedData.status,
            },
            select: commonSelects.userPrivate,
        });

        logger.logDatabaseOperation('create', 'user', user.id, {
            metadata: { email: user.email, role: user.role }
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/users');

        logger.info('User created successfully', {
            action: 'create',
            resource: 'user',
            resourceId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                email: user.email,
                role: user.role
            }
        });

        return {
            success: true,
            data: user
        };

    } catch (error) {
        logger.logServerActionError('create', 'user', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                duration: Date.now() - startTime,
                email: data.email
            }
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            logger.logValidationError('user', (error as any).errors);
            return {
                success: false,
                error: (error as any).errors
            };
        }

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2002':
                    return {
                        success: false,
                        error: 'A user with this email already exists'
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred'
                    };
            }
        }

        return {
            success: false,
            error: 'Failed to create user'
        };
    }
} 