'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createServerAction } from '@/lib/server-action-utils'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const likeProjectSchema = z.object({
  projectId: z.string().cuid(),
})

type LikeProjectInput = z.infer<typeof likeProjectSchema>

export const likeProject = createServerAction(
  likeProjectSchema,
  async ({ projectId }: LikeProjectInput) => {
    const session = await auth()
    if (!session?.user?.id) {
      logger.warn('Unauthorized like attempt', {
        action: 'like_project',
        metadata: { projectId }
      })
      throw new Error('Authentication required')
    }

    const userId = session.user.id

    try {
      // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Check if like already exists
        const existingLike = await tx.projectLike.findUnique({
          where: {
            userId_projectId: {
              userId,
              projectId,
            },
          },
        })

        if (existingLike) {
          // Unlike - remove the like and decrement count
          await tx.projectLike.delete({
            where: { id: existingLike.id },
          })

          await tx.projectShowcase.update({
            where: { id: projectId },
            data: {
              likes: {
                decrement: 1,
              },
            },
          })

          return { liked: false, action: 'unliked' }
        } else {
          // Like - create the like and increment count
          await tx.projectLike.create({
            data: {
              userId,
              projectId,
            },
          })

          await tx.projectShowcase.update({
            where: { id: projectId },
            data: {
              likes: {
                increment: 1,
              },
            },
          })

          return { liked: true, action: 'liked' }
        }
      })

      logger.info(`Project ${result.action} successfully`, {
        action: 'like_project',
        resource: 'project',
        userId,
        metadata: {
          projectId,
          liked: result.liked,
        },
      })

      return result
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Project not found')
        }
        if (error.code === 'P2002') {
          throw new Error('Like already exists')
        }
      }

      logger.error('Failed to like/unlike project', error as Error, {
        userId,
        metadata: { projectId },
      })

      throw error
    }
  },
  'like_project',
  'project'
)