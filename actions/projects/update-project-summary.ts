'use server'

import { revalidatePath } from 'next/cache'
import { type Value } from 'platejs'

import { getCurrentUser } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { handlePrismaError, type ServerActionResult } from '@/lib/server-action-utils'

export async function updateProjectSummary(
  projectId: string,
  summary: Value
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

    // Update the project summary
    await prisma.projectShowcase.update({
      where: { id: projectId },
      data: {
        summary: summary as any, // Prisma handles JSON serialization
        updatedAt: new Date()
      }
    })

    // Revalidate relevant pages
    revalidatePath('/projects')
    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/projects/my')

    logger.info('Project summary updated successfully', {
      action: 'update_project_summary',
      resource: 'project',
      resourceId: projectId,
      metadata: {
        userId: user.id,
        summaryLength: JSON.stringify(summary).length
      }
    })

    return {
      success: true,
      data: { id: projectId, updated: true }
    }

  } catch (error) {
    const handledError = handlePrismaError(error as any)

    logger.error('Failed to update project summary', error instanceof Error ? error : new Error(String(error)), {
      action: 'update_project_summary',
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