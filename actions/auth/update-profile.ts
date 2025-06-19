'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    type UpdateProfileInput,
    updateProfileSchema
} from '@/lib/validation/auth';
import {
    type ServerActionResult,
    type UserPrivate,
    commonSelects
} from '@/lib/server-action-utils';

// Define return type using Prisma's generated types
type UpdateProfileResult = ServerActionResult<UserPrivate>;

export async function updateProfile(data: UpdateProfileInput): Promise<UpdateProfileResult> {
    const startTime = Date.now();

    try {
        // Get current session to ensure user can only update their own profile
        const session = await auth();

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Ensure user can only update their own profile
        if (session.user.id !== data.id) {
            logger.warn('Unauthorized profile update attempt', {
                action: 'update-profile',
                resource: 'user',
                metadata: {
                    sessionUserId: session.user.id,
                    targetUserId: data.id,
                }
            });
            return {
                success: false,
                error: 'Unauthorized'
            };
        }

        logger.logServerAction('update-profile', 'user', {
            resourceId: data.id,
            metadata: {
                updateFields: Object.keys(data).filter(key => key !== 'id'),
                userId: session.user.id
            }
        });

        // Validate input data
        const { id, ...validatedData } = updateProfileSchema.parse(data);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!existingUser) {
            logger.warn('Profile update failed: user not found', {
                action: 'update-profile',
                resource: 'user',
                resourceId: id,
            });
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Filter out undefined values to avoid overwriting with null
        const updateData = Object.fromEntries(
            Object.entries(validatedData).filter(([_, value]) => value !== undefined)
        );

        // Update user profile with proper types
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: commonSelects.userPrivate,
        });

        logger.logDatabaseOperation('update', 'user-profile', user.id, {
            metadata: {
                updatedFields: Object.keys(updateData),
                email: user.email,
                userId: session.user.id
            }
        });

        // Revalidate relevant paths
        revalidatePath('/');
        revalidatePath('/profile');
        revalidatePath('/community');
        revalidatePath(`/community/students/${user.id}`);
        revalidatePath(`/community/mentors/${user.id}`);
        revalidatePath(`/community/alumni/${user.id}`);

        logger.info('Profile updated successfully', {
            action: 'update-profile',
            resource: 'user',
            resourceId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                updatedFields: Object.keys(updateData),
                userId: session.user.id
            }
        });

        return {
            success: true,
            data: user
        };

    } catch (error) {
        logger.logServerActionError('update-profile', 'user', error instanceof Error ? error : new Error(String(error)), {
            resourceId: data.id,
            metadata: {
                duration: Date.now() - startTime,
                updateFields: Object.keys(data).filter(key => key !== 'id')
            }
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            logger.logValidationError('user-profile', (error as any).errors, {
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
            error: 'Failed to update profile'
        };
    }
} 