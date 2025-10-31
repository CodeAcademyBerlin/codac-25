'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getSession } from '@/lib/auth/session';
import {
    updateAttendanceSchema,
    type UpdateAttendanceInput,
    editAttendanceDateSchema
} from '@/lib/validation/attendance';
import {
    type ServerActionResult,
    handlePrismaError
} from '@/lib/utils/server-action-utils';


// Define return type with Prisma's generated types
type AttendanceWithRelations = Prisma.AttendanceGetPayload<{
    include: {
        student: {
            select: {
                id: true;
                name: true;
                email: true;
            };
        };
        cohort: {
            select: {
                id: true;
                name: true;
                slug: true;
            };
        };
    };
}>;

type UpdateAttendanceResult = ServerActionResult<AttendanceWithRelations>;

export async function updateAttendance(data: UpdateAttendanceInput): Promise<UpdateAttendanceResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('update', 'attendance', {
            metadata: {
                attendanceId: data.id,
                newStatus: data.status
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
                error: 'Insufficient permissions. Only mentors and admins can manage attendance.'
            };
        }

        // Validate input data
        const validatedData = updateAttendanceSchema.parse(data);

        // Get existing attendance record to check date restrictions
        const existingAttendance = await prisma.attendance.findUnique({
            where: { id: validatedData.id },
            select: {
                id: true,
                date: true,
                status: true,
                studentId: true,
                cohortId: true
            }
        });

        if (!existingAttendance) {
            return {
                success: false,
                error: 'Attendance record not found'
            };
        }

        // Validate that the attendance date is editable (within 30 days and weekday)
        try {
            editAttendanceDateSchema.parse(existingAttendance.date);
        } catch (validationError) {
            return {
                success: false,
                error: 'This attendance record cannot be modified. Attendance can only be edited within 30 days and for weekdays only.'
            };
        }

        // Update attendance record
        const attendance = await prisma.attendance.update({
            where: { id: validatedData.id },
            data: {
                status: validatedData.status,
                updatedAt: new Date(),
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                cohort: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        logger.logDatabaseOperation('update', 'attendance', attendance.id, {
            metadata: {
                previousStatus: existingAttendance.status,
                newStatus: attendance.status,
                studentId: attendance.studentId,
                cohortId: attendance.cohortId,
                date: attendance.date.toISOString()
            }
        });

        // Revalidate relevant paths
        revalidatePath('/attendance');
        revalidatePath(`/attendance/${attendance.cohort.slug}`);

        const endTime = Date.now();
        logger.logServerAction('update', 'attendance', {
            metadata: {
                attendanceId: attendance.id,
                duration: endTime - startTime
            }
        });

        return {
            success: true,
            data: attendance
        };

    } catch (error) {
        const endTime = Date.now();
        logger.error('Failed to update attendance', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                attendanceId: data.id,
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
            error: 'Failed to update attendance record'
        };
    }
}
