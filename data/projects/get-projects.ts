'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { ProjectFilter, ProjectShowcaseWithStats } from '@/types/portfolio'

export async function getAllProjects(
  filter: ProjectFilter = {}
): Promise<ProjectShowcaseWithStats[]> {
  try {
    // For public projects, we don't need authentication
    const userId = null

    const { search, techStack, status, featured } = filter

    // Build where clause
    const where: any = {
      isPublic: true,
      projectProfile: {
        isPublic: true,
        isActive: true,
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (techStack && techStack.length > 0) {
      where.techStack = {
        array_contains: techStack
      }
    }

    if (status && status.length > 0) {
      where.status = { in: status }
    }

    if (featured) {
      where.isFeatured = true
    }

    const projects = await prisma.projectShowcase.findMany({
      where,
      include: {
        projectProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        projectLikes: {
          where: userId ? { userId } : { id: 'never-matches' },
          select: { id: true }
        },
        _count: {
          select: {
            comments: true,
            projectLikes: true,
            collaborators: true,
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Add isLiked property to each project
    const projectsWithLikeStatus = projects.map(project => ({
      ...project,
      isLiked: userId ? project.projectLikes.length > 0 : false,
      // Remove the projectLikes array from the response (we only needed it for the check)
      projectLikes: undefined,
    }))

    return projectsWithLikeStatus as ProjectShowcaseWithStats[]

  } catch (error) {
    logger.error('Failed to get projects', error instanceof Error ? error : new Error(String(error)))
    return []
  }
}

export async function getFeaturedProjects(limit = 6): Promise<ProjectShowcaseWithStats[]> {
  try {
    // For public projects, we don't need authentication
    const userId = null

    const projects = await prisma.projectShowcase.findMany({
      where: {
        isPublic: true,
        isFeatured: true,
        projectProfile: {
          isPublic: true,
          isActive: true,
        }
      },
      include: {
        projectProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            }
          }
        },
        projectLikes: {
          where: userId ? { userId } : { id: 'never-matches' },
          select: { id: true }
        },
        _count: {
          select: {
            comments: true,
            projectLikes: true,
            collaborators: true,
          }
        }
      },
      orderBy: [
        { likes: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Add isLiked property to each project
    const projectsWithLikeStatus = projects.map(project => ({
      ...project,
      isLiked: userId ? project.projectLikes.length > 0 : false,
      // Remove the projectLikes array from the response (we only needed it for the check)
      projectLikes: undefined,
    }))

    return projectsWithLikeStatus as ProjectShowcaseWithStats[]

  } catch (error) {
    logger.error('Failed to get featured projects', error instanceof Error ? error : new Error(String(error)))
    return []
  }
}