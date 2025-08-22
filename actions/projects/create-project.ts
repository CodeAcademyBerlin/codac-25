'use server'

import { type PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import { handlePrismaError, type ServerActionResult } from '@/lib/server-action-utils'
import type { CreateProjectData } from '@/types/portfolio'

export async function createProject(
  data: CreateProjectData
): Promise<ServerActionResult<{ id: string; projectProfileId: string }>> {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Get or create user's project profile
    let projectProfile = await prisma.projectProfile.findUnique({
      where: { userId: user.id }
    })

    if (!projectProfile) {
      projectProfile = await prisma.projectProfile.create({
        data: {
          userId: user.id,
        }
      })
    }

    // Ensure data is properly formatted
    const formattedTechStack = Array.isArray(data.techStack) ? data.techStack : []
    const formattedFeatures = Array.isArray(data.features) ? data.features : []
    const formattedImages = Array.isArray(data.images) ? data.images : []

    // Log incoming data for debugging
    logger.debug('Creating project with data', {
      action: 'create_project',
      resource: 'project',
      metadata: {
        userId: user.id,
        projectProfileId: projectProfile.id,
        title: data.title,
        techStackType: typeof data.techStack,
        techStackLength: formattedTechStack.length
      }
    })

    // Create the project
    const project = await prisma.projectShowcase.create({
      data: {
        title: data.title,
        description: data.description,
        summary: data.summary,
        shortDesc: data.shortDesc,
        images: formattedImages,
        demoUrl: data.demoUrl || null,
        githubUrl: data.githubUrl || null,
        techStack: formattedTechStack,
        features: formattedFeatures,
        challenges: data.challenges || null,
        solutions: data.solutions || null,
        status: data.status || 'IN_PROGRESS',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        isPublic: data.isPublic ?? true,
        projectProfileId: projectProfile.id,
      }
    })

    // Revalidate relevant pages
    revalidatePath('/projects')
    revalidatePath('/projects/my')
    revalidatePath('/showcase')

    logger.info('Project created successfully', {
      action: 'create_project',
      resource: 'project',
      resourceId: project.id,
      metadata: {
        userId: user.id,
        title: data.title,
        techStack: data.techStack
      }
    })

    return {
      success: true,
      data: {
        id: project.id,
        projectProfileId: projectProfile.id
      }
    }

  } catch (error) {
    const handledError = handlePrismaError(error as PrismaClientKnownRequestError)

    // Log more detailed error information for debugging
    logger.error('Failed to create project', error instanceof Error ? error : new Error(String(error)), {
      action: 'create_project',
      resource: 'project',
      metadata: {
        title: data.title,
        error: handledError,
        detailedError: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        dataStructure: {
          hasTechStack: !!data.techStack,
          techStackType: typeof data.techStack,
          summaryType: typeof data.summary
        }
      }
    })

    return {
      success: false,
      error: handledError || 'An error occurred while creating the project. Please try again.'
    }
  }
}