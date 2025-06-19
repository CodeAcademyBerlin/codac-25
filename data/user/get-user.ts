'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
    getUserSchema,
    type ServerActionResult
} from '@/lib/validation/user';

// Define detailed user payload for profile pages
export type UserProfile = Prisma.UserGetPayload<{
    select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
        bio: true;
        role: true;
        status: true;
        githubUrl: true;
        linkedinUrl: true;
        portfolioUrl: true;
        currentJob: true;
        currentCompany: true;
        graduationDate: true;
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
                documents: true;
                enrollments: true;
                posts: true;
                comments: true;
                achievements: true;
                favorites: true;
            };
        };
    };
}>;

export type GetUserResult = ServerActionResult<UserProfile>;

export async function getUser(id: string): Promise<GetUserResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('get', 'user', {
            resourceId: id
        });

        // Validate input
        const { id: validatedId } = getUserSchema.parse({ id });

        // Get user with detailed information
        const user = await prisma.user.findUnique({
            where: { id: validatedId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                bio: true,
                role: true,
                status: true,
                githubUrl: true,
                linkedinUrl: true,
                portfolioUrl: true,
                currentJob: true,
                currentCompany: true,
                graduationDate: true,
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
                        documents: true,
                        enrollments: true,
                        posts: true,
                        comments: true,
                        achievements: true,
                        favorites: true,
                    },
                },
            },
        });

        if (!user) {
            logger.warn('User not found', {
                action: 'get',
                resource: 'user',
                resourceId: validatedId,
            });
            return {
                success: false,
                error: 'User not found'
            };
        }

        logger.logDatabaseOperation('findUnique', 'user', user.id, {
            metadata: {
                role: user.role,
                status: user.status,
                email: user.email
            }
        });

        logger.info('User retrieved successfully', {
            action: 'get',
            resource: 'user',
            resourceId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                role: user.role,
                status: user.status
            }
        });

        return {
            success: true,
            data: user
        };

    } catch (error) {
        logger.logServerActionError('get', 'user', error instanceof Error ? error : new Error(String(error)), {
            resourceId: id,
            metadata: {
                duration: Date.now() - startTime
            }
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            logger.logValidationError('user', (error as any).errors, {
                resourceId: id
            });
            return {
                success: false,
                error: 'Invalid user ID'
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
            error: 'Failed to retrieve user'
        };
    }
} 