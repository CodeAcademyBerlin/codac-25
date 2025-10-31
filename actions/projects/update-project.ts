'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';


import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { generateSlug, generateUniqueSlug } from '@/lib/utils';
import { getProjectUrl } from '@/lib/utils/project-urls';
import {
  handlePrismaError,
  type ServerActionResult,
} from '@/lib/utils/server-action-utils';
import type { CreateProjectData } from '@/types/portfolio';

export async function updateProject(
  projectId: string,
  data: CreateProjectData
): Promise<ServerActionResult<{ id: string; updated: boolean; url: string }>> {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Verify the project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        projectProfile: {
          userId: user.id,
        },
      },
      include: {
        projectProfile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return {
        success: false,
        error: 'Project not found or access denied',
      };
    }

    // Generate new slug if title has changed
    let newSlug = project.slug;
    if (data.title !== project.title) {
      const baseSlug = generateSlug(data.title);
      newSlug = await generateUniqueSlug(
        baseSlug,
        async (slug) => {
          const existingProject = await prisma.project.findFirst({
            where: {
              slug,
              id: { not: projectId } // Exclude current project
            }
          });
          return !!existingProject;
        }
      );
    }

    // Update the project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        title: data.title,
        slug: newSlug,
        description: data.description,
        shortDesc: data.shortDesc,
        images: data.images || [],
        demoUrl: data.demoUrl,
        githubUrl: data.githubUrl,
        techStack: data.techStack,
        features: data.features || [],
        challenges: data.challenges,
        solutions: data.solutions,
        status: data.status || 'IN_PROGRESS',
        startDate: data.startDate,
        endDate: data.endDate,
        isPublic: data.isPublic ?? true,
        updatedAt: new Date(),
      },
    });

    // Update the associated document if it exists and summary is provided
    if (project.documentId && data.summary !== undefined) {
      await prisma.document.update({
        where: { id: project.documentId },
        data: {
          title: data.title,
          description: data.description,
          content: data.summary as Prisma.InputJsonValue,
          isPublished: data.isPublic ?? true,
          updatedAt: new Date(),
        },
      });
    }

    // Revalidate relevant pages
    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects/my');
    revalidatePath('/showcase');

    logger.info('Project updated successfully', {
      action: 'update_project',
      resource: 'project',
      resourceId: projectId,
      metadata: {
        userId: user.id,
        title: data.title,
        techStack: data.techStack,
      },
    });

    if (!user.username) {
      return {
        success: false,
        error: 'Username is required to update projects. Please set a username in your profile settings.',
      };
    }

    return {
      success: true,
      data: {
        id: projectId,
        updated: true,
        url: getProjectUrl(user.username, newSlug),
      },
    };
  } catch (error) {
    const handledError =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? handlePrismaError(error)
        : 'An unexpected error occurred';

    logger.error(
      'Failed to update project',
      error instanceof Error ? error : new Error(String(error)),
      {
        action: 'update_project',
        resource: 'project',
        resourceId: projectId,
        metadata: { error: handledError },
      }
    );

    return {
      success: false,
      error: handledError,
    };
  }
}
