'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    type UserPrivate,
    commonSelects
} from '@/lib/server-action-utils';
import {
    updateUserSchema,
    type UpdateUserInput,
    type ServerActionResult
} from '@/lib/validation/user';

// Define return type using Prisma's generated types
type UpdateUserResult = ServerActionResult<UserPrivate>;

export async function updateUser(data: UpdateUserInput): Promise<UpdateUserResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('update', 'user', {
            resourceId: data.id,
            metadata: {
                updateFields: Object.keys(data).filter(key => key !== 'id'),
                email: data.email
            }
        });

        // Validate input data
        const { id, ...validatedData } = updateUserSchema.parse(data);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                name: true,
            },
        });

        if (!existingUser) {
            logger.warn('User update failed: user not found', {
                action: 'update',
                resource: 'user',
                resourceId: id,
            });
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Check for email conflicts if email is being updated
        if (validatedData.email && validatedData.email !== existingUser.email) {
            const emailConflict = await prisma.user.findUnique({
                where: { email: validatedData.email },
                select: { id: true },
            });

            if (emailConflict) {
                logger.warn('User update failed: email already exists', {
                    action: 'update',
                    resource: 'user',
                    resourceId: id,
                    metadata: { conflictingEmail: validatedData.email }
                });
                return {
                    success: false,
                    error: 'A user with this email already exists'
                };
            }
        }

        // Filter out undefined values to avoid overwriting with null
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, value]) => value !== undefined)
        );

        // Update user with proper types
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: commonSelects.userPrivate,
        });

        logger.logDatabaseOperation('update', 'user', user.id, {
            metadata: {
                updatedFields: Object.keys(updateData),
                email: user.email,
                role: user.role
            }
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/users');
        revalidatePath(`/users/${user.id}`);

        logger.info('User updated successfully', {
            action: 'update',
            resource: 'user',
            resourceId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                updatedFields: Object.keys(updateData),
                email: user.email,
                role: user.role
            }
        });

        return {
            success: true,
            data: user
        };

    } catch (error) {
        logger.logServerActionError('update', 'user', error instanceof Error ? error : new Error(String(error)), {
            resourceId: data.id,
            metadata: {
                duration: Date.now() - startTime,
                updateFields: Object.keys(data).filter(key => key !== 'id')
            }
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            logger.logValidationError('user', (error as any).errors, {
                resourceId: data.id
            });
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
                case 'P2025':
                    return {
                        success: false,
                        error: 'User not found'
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
            error: 'Failed to update user'
        };
    }
} 