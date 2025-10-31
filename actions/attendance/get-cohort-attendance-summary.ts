'use server';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/auth/session';
import {
    type ServerActionResult,
    handlePrismaError
} from '@/lib/utils/server-action-utils';


// Define return types for attendance summary
type StudentAttendanceSummary = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentAvatar: string | null;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    absentSick: number;
    absentExcused: number;
    absentUnexcused: number;
    attendancePercentage: number;
};

type CohortAttendanceSummary = {
    cohortId: string;
    cohortName: string;
    cohortSlug: string;
    totalStudents: number;
    totalWorkingDays: number;
    overallAttendancePercentage: number;
    attendanceBreakdown: {
        present: number;
        absentSick: number;
        absentExcused: number;
        absentUnexcused: number;
    };
    students: StudentAttendanceSummary[];
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
};

type GetCohortAttendanceSummaryResult = ServerActionResult<CohortAttendanceSummary>;

interface GetCohortAttendanceSummaryInput {
    cohortId: string;
    startDate?: Date;
    endDate?: Date;
}

export async function getCohortAttendanceSummary(
    data: GetCohortAttendanceSummaryInput
): Promise<GetCohortAttendanceSummaryResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('read', 'attendance_summary', {
            metadata: {
                cohortId: data.cohortId,
                startDate: data.startDate?.toISOString(),
                endDate: data.endDate?.toISOString()
            }
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
                error: 'Insufficient permissions. Only mentors and admins can view attendance summaries.'
            };
        }

        // Get cohort information with students
        const cohort = await prisma.cohort.findUnique({
            where: { id: data.cohortId },
            include: {
                students: {
                    where: {
                        role: 'STUDENT',
                        status: 'ACTIVE'
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                }
            }
        });

        if (!cohort) {
            return {
                success: false,
                error: 'Cohort not found'
            };
        }

        // Set default date range
        const startDate = data.startDate || cohort.startDate;
        const endDate = data.endDate || cohort.endDate || new Date();

        // Calculate total working days (weekdays only)
        const totalWorkingDays = calculateWorkingDays(startDate, endDate);

        // Get all attendance records for this cohort and date range
        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                cohortId: data.cohortId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                studentId: true,
                status: true,
                date: true
            }
        });

        // Process attendance data for each student
        const studentSummaries: StudentAttendanceSummary[] = cohort.students.map(student => {
            const studentAttendance = attendanceRecords.filter(r => r.studentId === student.id);

            const totalDays = studentAttendance.length;
            const presentDays = studentAttendance.filter(r => r.status === 'PRESENT').length;
            const absentSick = studentAttendance.filter(r => r.status === 'ABSENT_SICK').length;
            const absentExcused = studentAttendance.filter(r => r.status === 'ABSENT_EXCUSED').length;
            const absentUnexcused = studentAttendance.filter(r => r.status === 'ABSENT_UNEXCUSED').length;
            const absentDays = absentSick + absentExcused + absentUnexcused;

            const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

            return {
                studentId: student.id,
                studentName: student.name || 'Unknown',
                studentEmail: student.email || '',
                studentAvatar: student.avatar,
                totalDays,
                presentDays,
                absentDays,
                absentSick,
                absentExcused,
                absentUnexcused,
                attendancePercentage
            };
        });

        // Calculate overall cohort statistics
        const totalAttendanceRecords = attendanceRecords.length;
        const totalPresentRecords = attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const totalAbsentSick = attendanceRecords.filter(r => r.status === 'ABSENT_SICK').length;
        const totalAbsentExcused = attendanceRecords.filter(r => r.status === 'ABSENT_EXCUSED').length;
        const totalAbsentUnexcused = attendanceRecords.filter(r => r.status === 'ABSENT_UNEXCUSED').length;

        const overallAttendancePercentage = totalAttendanceRecords > 0
            ? Math.round((totalPresentRecords / totalAttendanceRecords) * 100)
            : 0;

        const summary: CohortAttendanceSummary = {
            cohortId: cohort.id,
            cohortName: cohort.name,
            cohortSlug: cohort.slug,
            totalStudents: cohort.students.length,
            totalWorkingDays,
            overallAttendancePercentage,
            attendanceBreakdown: {
                present: totalPresentRecords,
                absentSick: totalAbsentSick,
                absentExcused: totalAbsentExcused,
                absentUnexcused: totalAbsentUnexcused
            },
            students: studentSummaries,
            dateRange: {
                startDate,
                endDate
            }
        };

        logger.logDatabaseOperation('read', 'attendance_summary', cohort.id, {
            metadata: {
                cohortId: data.cohortId,
                totalStudents: cohort.students.length,
                totalRecords: totalAttendanceRecords,
                overallAttendancePercentage
            }
        });

        const endTime = Date.now();
        logger.logServerAction('read', 'attendance_summary', {
            metadata: {
                cohortId: data.cohortId,
                duration: endTime - startTime,
                totalStudents: cohort.students.length
            }
        });

        return {
            success: true,
            data: summary
        };

    } catch (error) {
        const endTime = Date.now();
        logger.error('Failed to get cohort attendance summary', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                cohortId: data.cohortId,
                duration: endTime - startTime
            }
        });

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return {
                success: false,
                error: handlePrismaError(error)
            };
        }

        return {
            success: false,
            error: 'Failed to get cohort attendance summary'
        };
    }
}

// Helper function to calculate working days (weekdays only)
function calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        // Count Monday (1) through Friday (5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
}
