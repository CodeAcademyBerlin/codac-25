'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { ProjectShowcaseWithStats } from '@/types/portfolio'

export async function getUserProjects(userId: string): Promise<ProjectShowcaseWithStats[]> {
  try {
    const projects = await prisma.projectShowcase.findMany({
      where: {
        projectProfile: {
          userId: userId
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
        { updatedAt: 'desc' }
      ]
    })

    return projects as ProjectShowcaseWithStats[]

  } catch (error) {
    logger.error('Failed to get user projects', error instanceof Error ? error : new Error(String(error)), {
      action: 'get_user_projects',
      metadata: { userId }
    })
    return []
  }
}