'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    deleteUserSchema,
    type DeleteUserInput,
    type ServerActionResult
} from '@/lib/validation/user';

// Define return type for delete operation
type DeleteUserResult = ServerActionResult<{ id: string; email: string | null; name: string | null }>;

export async function deleteUser(data: DeleteUserInput): Promise<DeleteUserResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('delete', 'user', {
            resourceId: data.id,
        });

        // Validate input data
        const { id } = deleteUserSchema.parse(data);

        // Check if user exists and get related data counts
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                _count: {
                    select: {
                        enrollments: true,
                        posts: true,
                        comments: true,
                    },
                },
            },
        });

        if (!existingUser) {
            logger.warn('User deletion failed: user not found', {
                action: 'delete',
                resource: 'user',
                resourceId: id,
            });
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Check if user is an admin (prevent accidental admin deletion)
        if (existingUser.role === 'ADMIN') {
            logger.warn('User deletion failed: cannot delete admin user', {
                action: 'delete',
                resource: 'user',
                resourceId: id,
                metadata: { role: existingUser.role }
            });
            return {
                success: false,
                error: 'Cannot delete admin users. Please change the role first.'
            };
        }

        // Check for related data that would be affected
        const hasRelatedData = Object.values(existingUser._count).some(count => count > 0);

        if (hasRelatedData) {
            logger.warn('User deletion failed: user has related data', {
                action: 'delete',
                resource: 'user',
                resourceId: id,
                metadata: {
                    relatedCounts: existingUser._count
                }
            });

            // Instead of hard delete, we could soft delete by setting status to INACTIVE
            // This preserves data integrity
            const inactiveUser = await prisma.user.update({
                where: { id },
                data: {
                    status: 'INACTIVE',
                    updatedAt: new Date(),
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                },
            });

            logger.info('User soft deleted (set to inactive)', {
                action: 'soft-delete',
                resource: 'user',
                resourceId: id,
                metadata: {
                    duration: Date.now() - startTime,
                    email: inactiveUser.email,
                    relatedCounts: existingUser._count
                }
            });

            return {
                success: false,
                error: 'User has related data and has been deactivated instead of deleted. To permanently delete, remove all related data first.'
            };
        }

        // Perform hard delete if no related data exists
        const deletedUser = await prisma.user.delete({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        logger.logDatabaseOperation('delete', 'user', id, {
            metadata: {
                email: deletedUser.email,
                name: deletedUser.name
            }
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/users');

        logger.info('User deleted successfully', {
            action: 'delete',
            resource: 'user',
            resourceId: id,
            metadata: {
                duration: Date.now() - startTime,
                email: deletedUser.email,
                name: deletedUser.name
            }
        });

        return {
            success: true,
            data: deletedUser
        };

    } catch (error) {
        logger.logServerActionError('delete', 'user', error instanceof Error ? error : new Error(String(error)), {
            resourceId: data.id,
            metadata: {
                duration: Date.now() - startTime
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
                case 'P2025':
                    return {
                        success: false,
                        error: 'User not found'
                    };
                case 'P2003':
                    return {
                        success: false,
                        error: 'Cannot delete user due to related records'
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
            error: 'Failed to delete user'
        };
    }
} 