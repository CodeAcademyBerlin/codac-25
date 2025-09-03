'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'

export async function getProjectLikeStatus(projectId: string): Promise<{
  isLiked: boolean
  likesCount: number
}> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    // Get the project with like count and user's like status
    const [project, userLike] = await Promise.all([
      prisma.projectShowcase.findUnique({
        where: { id: projectId },
        select: { likes: true },
      }),
      userId
        ? prisma.projectLike.findUnique({
            where: {
              userId_projectId: {
                userId,
                projectId,
              },
            },
          })
        : null,
    ])

    if (!project) {
      throw new Error('Project not found')
    }

    return {
      isLiked: !!userLike,
      likesCount: project.likes,
    }
  } catch (error) {
    const session = await auth()
    logger.error('Failed to get project like status', error as Error, {
      metadata: { projectId, userId: session?.user?.id },
    })
    
    // Return safe defaults
    return {
      isLiked: false,
      likesCount: 0,
    }
  }
}

export async function getProjectLikers(projectId: string, limit = 20): Promise<{
  id: string
  name: string | null
  avatar: string | null
  createdAt: Date
}[]> {
  try {
    const likes = await prisma.projectLike.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return likes.map(like => ({
      id: like.user.id,
      name: like.user.name,
      avatar: like.user.avatar,
      createdAt: like.createdAt,
    }))
  } catch (error) {
    logger.error('Failed to get project likers', error as Error, {
      metadata: { projectId },
    })
    
    return []
  }
}

export async function getUserLikedProjects(userId: string, limit = 20): Promise<string[]> {
  try {
    const likes = await prisma.projectLike.findMany({
      where: { userId },
      select: { projectId: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return likes.map(like => like.projectId)
  } catch (error) {
    logger.error('Failed to get user liked projects', error as Error, {
      metadata: { userId },
    })
    
    return []
  }
}