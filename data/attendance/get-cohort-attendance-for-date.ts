'use server';

import { AttendanceStatus, UserRole } from '@prisma/client';
import { isAfter, isBefore, isSameDay, startOfDay, subDays } from 'date-fns';

import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/utils/server-action-utils';

export type StudentWithAttendance = {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    attendance: {
        id: string;
        status: AttendanceStatus;
    } | null;
};

export type GetCohortAttendanceForDateResult = ServerActionResult<{
    students: StudentWithAttendance[];
    date: Date;
    cohortId: string;
    isEditable: boolean; // whether the date is within the 30-day edit window
}>;

export async function getCohortAttendanceForDate(
    cohortSlug: string,
    date: Date | string
): Promise<GetCohortAttendanceForDateResult> {
    const startTime = Date.now();

    // Normalize date input to Date object (move to function scope for error handling)
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    /*
    const normalizedDate = new Date(date)
    console.log("normalizedDate", normalizedDate);
    */
    try {

        logger.info('Fetching cohort attendance for specific date', {
            action: 'get',
            resource: 'cohort_attendance_date',
            metadata: { cohortSlug, date: targetDate.toISOString() },
        });

        const session = await getSession();
        if (!session?.session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized: Only mentors and admins can view attendance.',
            };
        }

        // First, get the cohort to verify it exists and get its ID
        const cohort = await prisma.cohort.findUnique({
            where: { slug: cohortSlug },
            select: { id: true, name: true },
        });

        if (!cohort) {
            return {
                success: false,
                error: 'Cohort not found.',
            };
        }

        // Get students with their attendance for the specific date
        const students = await prisma.user.findMany({
            where: {
                cohortId: cohort.id,
                role: UserRole.STUDENT,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                attendanceRecords: {
                    where: {
                        date: targetDate,
                        cohortId: cohort.id,
                    },
                    select: {
                        id: true,
                        status: true,
                    },
                    take: 1, // Should only be one record per student per date
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        logger.logDatabaseOperation('findMany', 'users', undefined, {
            metadata: {
                cohortId: cohort.id,
                date: targetDate.toISOString(),
                studentsCount: students.length,
                purpose: 'attendance_by_date'
            }
        });

        // Transform the data to match our expected format
        const studentsWithAttendance: StudentWithAttendance[] = students.map(student => ({
            id: student.id,
            name: student.name || 'Unknown Student',
            email: student.email || '',
            avatar: student.avatar,
            attendance: student.attendanceRecords.length > 0 ? student.attendanceRecords[0] ?? null : null,
        }));

        // Check if the date is within the 30-day editable window
        // Use date-fns for reliable, timezone-safe date operations
        const todayStart = startOfDay(new Date());
        const thirtyDaysAgoStart = startOfDay(subDays(new Date(), 30));
        const inputDateStart = startOfDay(targetDate);

        // Date is editable if it's:
        // 1. Today or in the past (not future)
        // 2. Within the last 30 days (not too old)
        const isEditable =
            (isSameDay(inputDateStart, todayStart) || isBefore(inputDateStart, todayStart)) &&
            (isSameDay(inputDateStart, thirtyDaysAgoStart) || isAfter(inputDateStart, thirtyDaysAgoStart));

        logger.info('Cohort attendance for date retrieved successfully', {
            metadata: {
                action: 'get',
                resource: 'cohort_attendance_date',
                duration: Date.now() - startTime,
                cohortId: cohort.id,
                studentsCount: studentsWithAttendance.length,
                attendanceRecordsCount: studentsWithAttendance.filter(s => s.attendance).length,
                isEditable,
            }
        });

        return {
            success: true,
            data: {
                students: studentsWithAttendance,
                date: targetDate,
                cohortId: cohort.id,
                isEditable,
            },
        };

    } catch (error) {
        logger.error('Failed to get cohort attendance for date', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                action: 'get',
                resource: 'cohort_attendance_date',
                duration: Date.now() - startTime,
                cohortSlug,
                date: targetDate.toISOString(),
            }
        });
        return { success: false, error: 'Failed to load attendance data for the selected date.' };
    }
}
