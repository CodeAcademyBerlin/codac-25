'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/auth/session';
import { type ServerActionResult } from '@/lib/utils/server-action-utils';

// Define cohort type with active student count for attendance
export type CohortForAttendance = Prisma.CohortGetPayload<{
    select: {
        id: true;
        name: true;
        slug: true;
        description: true;
        startDate: true;
        endDate: true;
        avatar: true;
        image: true;
        _count: {
            select: {
                students: true;
            };
        };
    };
}> & {
    activeStudentCount: number;
};

export type GetCohortsForAttendanceResult = ServerActionResult<{
    cohorts: CohortForAttendance[];
    totalActiveStudents: number;
}>;

export async function getCohortsForAttendance(): Promise<GetCohortsForAttendanceResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('get', 'cohorts_for_attendance', {
            metadata: { action: 'list_cohorts' }
        });

        // Get authenticated user and check permissions
        const session = await getSession();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check if user has MENTOR or ADMIN role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { applicationRole: true }
        });

        if (!user || (user.applicationRole !== 'MENTOR' && user.applicationRole !== 'ADMIN')) {
            return {
                success: false,
                error: 'Insufficient permissions. Only mentors and admins can access attendance.'
            };
        }

        // Get all cohorts with student counts (only ACTIVE students)
        const cohorts = await prisma.cohort.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                startDate: true,
                endDate: true,
                avatar: true,
                image: true,
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

        // Get active student counts for each cohort
        const cohortsWithActiveStudents: CohortForAttendance[] = await Promise.all(
            cohorts.map(async (cohort) => {
                const activeStudentCount = await prisma.user.count({
                    where: {
                        cohortId: cohort.id,
                        role: 'STUDENT',
                        status: 'ACTIVE',
                    },
                });

                return {
                    ...cohort,
                    activeStudentCount,
                };
            })
        );

        // Calculate total active students across all cohorts
        const totalActiveStudents = cohortsWithActiveStudents.reduce(
            (total, cohort) => total + cohort.activeStudentCount,
            0
        );

        logger.logDatabaseOperation('findMany', 'cohorts', undefined, {
            metadata: {
                cohortCount: cohorts.length,
                totalActiveStudents
            }
        });

        logger.info('Cohorts for attendance retrieved successfully', {
            action: 'get',
            resource: 'cohorts_for_attendance',
            metadata: {
                duration: Date.now() - startTime,
                cohortCount: cohorts.length,
                totalActiveStudents,
                userRole: user.role,
            }
        });

        return {
            success: true,
            data: {
                cohorts: cohortsWithActiveStudents,
                totalActiveStudents,
            }
        };

    } catch (error) {
        logger.error('Failed to get cohorts for attendance', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                action: 'get',
                resource: 'cohorts_for_attendance',
                duration: Date.now() - startTime,
            }
        });

        return {
            success: false,
            error: 'Failed to load cohorts for attendance'
        };
    }
}
