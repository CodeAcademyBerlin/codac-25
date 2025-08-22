'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { ServerActionResult } from '@/lib/server-action-utils';

export type CohortWithStudents = Prisma.CohortGetPayload<{
    include: {
        students: {
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
                _count: {
                    select: {
                        documents: true;
                        enrollments: true;
                        posts: true;
                        comments: true;
                        achievements: true;
                    };
                };
            };
        };
        _count: {
            select: {
                students: true;
            };
        };
    };
}>;

export type GetCohortsResult = ServerActionResult<{
    cohorts: CohortWithStudents[];
    totalStudents: number;
}>;

export async function getCohorts(): Promise<GetCohortsResult> {
    const startTime = Date.now();

    try {
        logger.info('Fetching cohorts with students', {
            action: 'get',
            resource: 'cohorts',
        });



        // Get all cohorts with their students
        const cohorts = await prisma.cohort.findMany({
            include: {
                students: {
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
                        _count: {
                            select: {
                                documents: true,
                                enrollments: true,
                                posts: true,
                                comments: true,
                                achievements: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: {
                startDate: 'desc',
            },
        });

        logger.logDatabaseOperation('findMany', 'cohorts', undefined, {
            metadata: { count: cohorts.length }
        });

        // Calculate total students across all cohorts
        const totalStudents = cohorts.reduce((total, cohort) => total + cohort._count.students, 0);

        logger.info('Cohorts retrieved successfully', {
            metadata: {
                action: 'get',
                resource: 'cohorts',
                duration: Date.now() - startTime,
                cohortsCount: cohorts.length,
                totalStudents,
            }
        });

        return {
            success: true,
            data: {
                cohorts,
                totalStudents,
            }
        };

    } catch (error) {
        logger.error('Failed to get cohorts', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                action: 'get',
                resource: 'cohorts',
                duration: Date.now() - startTime,
            }
        });

        return { success: false, error: 'Failed to get cohorts' };
    }
} 