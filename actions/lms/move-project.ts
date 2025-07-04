'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

interface MoveProjectInput {
    projectId: string;
    targetCourseId: string;
    position?: 'before' | 'after';
    targetProjectId?: string; // For positioning relative to another project
}

export async function moveProject(data: MoveProjectInput) {
    const startTime = Date.now();

    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const { projectId, targetCourseId, position, targetProjectId } = data;

        // Get the project to move
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                course: true,
                lessons: true
            }
        });

        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            };
        }

        // Get the target course
        const targetCourse = await prisma.course.findUnique({
            where: { id: targetCourseId },
            include: {
                projects: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!targetCourse) {
            return {
                success: false,
                error: 'Target course not found'
            };
        }

        // Calculate new order
        let newOrder = 1;

        if (targetProjectId && position) {
            const targetProject = targetCourse.projects.find(p => p.id === targetProjectId);
            if (targetProject) {
                if (position === 'before') {
                    newOrder = targetProject.order;
                    // Update orders of projects that need to shift down
                    await prisma.project.updateMany({
                        where: {
                            courseId: targetCourseId,
                            order: { gte: newOrder }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                } else { // after
                    newOrder = targetProject.order + 1;
                    // Update orders of projects that need to shift down
                    await prisma.project.updateMany({
                        where: {
                            courseId: targetCourseId,
                            order: { gte: newOrder }
                        },
                        data: {
                            order: { increment: 1 }
                        }
                    });
                }
            }
        } else {
            // Move to end of target course
            const maxOrder = targetCourse.projects.reduce((max, project) =>
                Math.max(max, project.order), 0
            );
            newOrder = maxOrder + 1;
        }

        // Update the project
        await prisma.project.update({
            where: { id: projectId },
            data: {
                courseId: targetCourseId,
                order: newOrder,
                updatedAt: new Date()
            }
        });

        // Reorder projects in the original course to fill the gap
        if (project.courseId !== targetCourseId) {
            await prisma.project.updateMany({
                where: {
                    courseId: project.courseId,
                    order: { gt: project.order }
                },
                data: {
                    order: { decrement: 1 }
                }
            });
        }

        logger.info('Project moved successfully', {
            action: 'move',
            resource: 'project',
            resourceId: projectId,
            userId: user.id,
            metadata: {
                duration: Date.now() - startTime,
                fromCourse: project.courseId,
                toCourse: targetCourseId,
                newOrder,
                position,
                lessonsCount: project.lessons.length
            }
        });

        // Revalidate relevant paths
        revalidatePath('/lms');
        revalidatePath(`/lms/courses/${project.courseId}`);
        revalidatePath(`/lms/courses/${targetCourseId}`);
        revalidatePath('/lms/admin');

        return {
            success: true,
            message: `Project "${project.title}" moved successfully`
        };

    } catch (error) {
        logger.error('Failed to move project', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                duration: Date.now() - startTime,
                projectId: data.projectId,
                targetCourseId: data.targetCourseId
            }
        });

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2003':
                    return {
                        success: false,
                        error: 'Invalid project or course reference'
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
            error: 'Failed to move project'
        };
    }
} 