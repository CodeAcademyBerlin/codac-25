import { getServerSession } from './server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import type { ServerActionResult } from '@/lib/utils/server-action-utils';

interface AttendanceMiddlewareConfig<T> {
    logResource?: string;
    extractCohortId?: (data: T) => string;
}

/**
 * Middleware wrapper for attendance-related server actions
 * Ensures the user is authenticated and has permission to view attendance for the cohort
 */
export function withAttendanceViewAuth<TInput, TOutput>(
    handler: (data: TInput) => Promise<ServerActionResult<TOutput>>,
    config: AttendanceMiddlewareConfig<TInput> = {}
) {
    return async (data: TInput): Promise<ServerActionResult<TOutput>> => {
        try {
            // Check authentication
            const session = await getServerSession();

            if (!session || !session.user?.id) {
                logger.warn('Attendance access denied: No session', {
                    resource: config.logResource || 'attendance',
                });
                return {
                    success: false,
                    error: 'Authentication required',
                };
            }

            // If cohort ID extraction is configured, verify access
            if (config.extractCohortId) {
                const cohortId = config.extractCohortId(data);

                if (cohortId) {
                    // Check if user has access to this cohort
                    // Students can only view their own cohort
                    // Staff/Admins can view all cohorts
                    const user = await prisma.user.findUnique({
                        where: { id: session.user.id },
                        select: {
                            id: true,
                            applicationRole: true,
                            cohortId: true,
                        },
                    });

                    if (!user) {
                        return {
                            success: false,
                            error: 'User not found',
                        };
                    }

                    // Staff and admins have access to all cohorts
                    const isStaffOrAdmin = 
                        user.applicationRole === 'STAFF' || 
                        user.applicationRole === 'ADMIN';

                    // Students can only access their own cohort
                    if (!isStaffOrAdmin && user.cohortId !== cohortId) {
                        logger.warn('Attendance access denied: Cohort mismatch', {
                            resource: config.logResource || 'attendance',
                            userId: user.id,
                            requestedCohortId: cohortId,
                            userCohortId: user.cohortId,
                        });
                        return {
                            success: false,
                            error: 'Access denied for this cohort',
                        };
                    }
                }
            }

            // Log the action if configured
            if (config.logResource) {
                logger.info('Attendance action executed', {
                    resource: config.logResource,
                    userId: session.user.id,
                });
            }

            // Execute the handler
            return await handler(data);
        } catch (error) {
            logger.error('Attendance middleware error', {
                resource: config.logResource || 'attendance',
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: 'An error occurred while processing your request',
            };
        }
    };
}

