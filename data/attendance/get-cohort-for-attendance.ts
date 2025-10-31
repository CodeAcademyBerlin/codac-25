'use server';

import { Prisma, UserRole, UserStatus } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/utils/server-action-utils';
import { getSession } from '@/lib/auth/session';

export type CohortForAttendanceDetail = Prisma.CohortGetPayload<{
    include: {
        students: {
            where: {
                role: 'STUDENT';
                status: 'ACTIVE';
            };
            select: {
                id: true;
                name: true;
                email: true;
                avatar: true;
                startDate: true;
                endDate: true;
            };
            orderBy: {
                name: 'asc';
            };
        };
    };
}>;

export type GetCohortForAttendanceResult = ServerActionResult<{
    cohort: CohortForAttendanceDetail;
    totalStudents: number;
    totalWorkingDays: number;
}>;

export async function getCohortForAttendance(cohortSlug: string): Promise<GetCohortForAttendanceResult> {
    const startTime = Date.now();

    try {
        logger.info('Fetching cohort for attendance detail page', {
            action: 'get',
            resource: 'cohort_attendance_detail',
            metadata: { cohortSlug },
        });

        const session = await getSession();
        if (!session?.user?.id || (session.user.role !== UserRole.MENTOR && session.user.role !== UserRole.ADMIN)) {
            return {
                success: false,
                error: 'Unauthorized: Only mentors and admins can view attendance.',
            };
        }

        const cohort = await prisma.cohort.findUnique({
            where: {
                slug: cohortSlug,
            },
            include: {
                students: {
                    where: {
                        role: UserRole.STUDENT,
                        status: UserStatus.ACTIVE,
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        startDate: true,
                        endDate: true,
                    },
                    orderBy: {
                        name: 'asc',
                    },
                },
            },
        });

        if (!cohort) {
            return {
                success: false,
                error: 'Cohort not found.',
            };
        }

        logger.logDatabaseOperation('findUnique', 'cohort', cohort.id, {
            metadata: { slug: cohortSlug, studentsCount: cohort.students.length, purpose: 'attendance_detail' }
        });

        // Calculate total working days (weekdays only) for the cohort
        const calculateWorkingDays = (startDate: Date, endDate: Date | null): number => {
            const end = endDate || new Date();
            let count = 0;
            const current = new Date(startDate);

            while (current <= end) {
                const dayOfWeek = current.getDay();
                // Monday = 1, Tuesday = 2, ..., Friday = 5
                if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }

            return count;
        };

        const totalWorkingDays = calculateWorkingDays(cohort.startDate, cohort.endDate);

        logger.info('Cohort for attendance detail retrieved successfully', {
            metadata: {
                action: 'get',
                resource: 'cohort_attendance_detail',
                duration: Date.now() - startTime,
                cohortId: cohort.id,
                studentsCount: cohort.students.length,
                totalWorkingDays,
            }
        });

        return {
            success: true,
            data: {
                cohort,
                totalStudents: cohort.students.length,
                totalWorkingDays,
            },
        };

    } catch (error) {
        logger.error('Failed to get cohort for attendance detail', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                action: 'get',
                resource: 'cohort_attendance_detail',
                duration: Date.now() - startTime,
                cohortSlug,
            }
        });
        return { success: false, error: 'Failed to load cohort attendance data.' };
    }
}
