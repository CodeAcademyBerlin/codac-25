'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function getUsersForEnrollment() {
    try {
        const users = await prisma.user.findMany({
            where: {
                status: 'ACTIVE', // Only active users
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                cohort: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            },
            orderBy: {
                name: 'asc',
            },
        });

        logger.info('Users retrieved for enrollment', {
            action: 'get',
            resource: 'users',
            metadata: {
                count: users.length,
                purpose: 'enrollment'
            }
        });

        return users;

    } catch (error) {
        logger.error('Failed to get users for enrollment', error instanceof Error ? error : new Error(String(error)));
        throw new Error('Failed to retrieve users');
    }
} 