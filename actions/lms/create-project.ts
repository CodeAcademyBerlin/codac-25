'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface CreateProjectData {
    title: string;
    description?: string;
    thumbnail?: string;
    duration?: number;
    isPublished?: boolean;
    courseId: string;
}

export async function createProject(data: CreateProjectData) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        // Validate required fields
        if (!data.title.trim()) {
            return {
                success: false,
                error: 'Project title is required'
            };
        }

        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: data.courseId }
        });

        if (!course) {
            return {
                success: false,
                error: 'Course not found'
            };
        }

        // Get the next order value for this course
        const lastProject = await prisma.project.findFirst({
            where: { courseId: data.courseId },
            orderBy: { order: 'desc' }
        });

        const project = await prisma.project.create({
            data: {
                title: data.title.trim(),
                description: data.description?.trim(),
                thumbnail: data.thumbnail,
                duration: data.duration,
                isPublished: data.isPublished || false,
                courseId: data.courseId,
                order: (lastProject?.order || 0) + 1,
            },
        });

        logger.info('Project created', {
            action: 'create',
            resource: 'project',
            resourceId: project.id,
            userId: user.id,
            metadata: { 
                title: project.title,
                courseId: data.courseId,
                isPublished: project.isPublished
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${data.courseId}`);
        revalidatePath(`/lms/courses/${data.courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            data: project,
            message: `Project "${project.title}" created successfully`
        };

    } catch (error) {
        logger.error('Failed to create project', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to create project'
        };
    }
}

export async function updateProject(id: string, data: Partial<CreateProjectData>) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const existingProject = await prisma.project.findUnique({
            where: { id },
            include: { course: true }
        });

        if (!existingProject) {
            return {
                success: false,
                error: 'Project not found'
            };
        }

        const updateData: any = {};
        
        if (data.title !== undefined) {
            if (!data.title.trim()) {
                return {
                    success: false,
                    error: 'Project title cannot be empty'
                };
            }
            updateData.title = data.title.trim();
        }
        
        if (data.description !== undefined) {
            updateData.description = data.description?.trim();
        }
        
        if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
        if (data.duration !== undefined) updateData.duration = data.duration;
        if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
        });

        logger.info('Project updated', {
            action: 'update',
            resource: 'project',
            resourceId: project.id,
            userId: user.id,
            metadata: { 
                title: project.title,
                courseId: existingProject.courseId,
                changes: Object.keys(updateData)
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${existingProject.courseId}`);
        revalidatePath(`/lms/courses/${existingProject.courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            data: project,
            message: `Project "${project.title}" updated successfully`
        };

    } catch (error) {
        logger.error('Failed to update project', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to update project'
        };
    }
}

export async function deleteProject(id: string) {
    try {
        const user = await getCurrentUser();

        if (!user || !['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                course: true,
                _count: {
                    select: { lessons: true }
                }
            }
        });

        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            };
        }

        if (project._count.lessons > 0) {
            return {
                success: false,
                error: 'Cannot delete project with existing lessons'
            };
        }

        await prisma.project.delete({
            where: { id }
        });

        logger.info('Project deleted', {
            action: 'delete',
            resource: 'project',     
            resourceId: id,
            userId: user.id,
            metadata: { 
                title: project.title,
                courseId: project.courseId
            }
        });

        revalidatePath('/lms/admin');
        revalidatePath('/lms/admin/courses');
        revalidatePath(`/lms/admin/courses/${project.courseId}`);
        revalidatePath(`/lms/courses/${project.courseId}`);
        revalidatePath('/lms');

        return {
            success: true,
            message: `Project "${project.title}" deleted successfully`
        };

    } catch (error) {
        logger.error('Failed to delete project', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: 'Failed to delete project'
        };
    }
} 