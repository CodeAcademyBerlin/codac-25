'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { handlePrismaError, type ServerActionResult } from '@/lib/server-action-utils'
import type { CreateProjectData } from '@/types/portfolio'

export async function updateProject(
  projectId: string,
  data: CreateProjectData
): Promise<ServerActionResult<{ id: string; updated: boolean }>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Verify the project exists and user owns it
    const project = await prisma.projectShowcase.findFirst({
      where: {
        id: projectId,
        projectProfile: {
          userId: user.id
        }
      },
      include: {
        projectProfile: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!project) {
      return {
        success: false,
        error: 'Project not found or access denied'
      }
    }

    // Update the project
    await prisma.projectShowcase.update({
      where: { id: projectId },
      data: {
        title: data.title,
        description: data.description,
        summary: data.summary,
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
      }
    })

    // Revalidate relevant pages
    revalidatePath('/projects')
    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/projects/my')
    revalidatePath('/showcase')

    logger.info('Project updated successfully', {
      action: 'update_project',
      resource: 'project',
      resourceId: projectId,
      metadata: {
        userId: user.id,
        title: data.title,
        techStack: data.techStack
      }
    })

    return {
      success: true,
      data: { id: projectId, updated: true }
    }

  } catch (error) {
    const handledError = handlePrismaError(error as any)

    logger.error('Failed to update project', error instanceof Error ? error : new Error(String(error)), {
      action: 'update_project',
      resource: 'project',
      resourceId: projectId,
      metadata: { error: handledError }
    })

    return {
      success: false,
      error: handledError
    }
  }
}