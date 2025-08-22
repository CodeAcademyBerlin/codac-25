'use server'

import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'
import type { PlatformStats } from '@/types/portfolio'

export async function getProjectStats(): Promise<PlatformStats> {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalProjects,
      featuredProjects,
      activeStudents,
      newThisMonth,
      totalSkills
    ] = await Promise.all([
      // Total public projects
      prisma.projectShowcase.count({
        where: {
          isPublic: true,
          projectProfile: {
            isPublic: true,
            isActive: true,
          }
        }
      }),

      // Featured projects count
      prisma.projectShowcase.count({
        where: {
          isPublic: true,
          isFeatured: true,
          projectProfile: {
            isPublic: true,
            isActive: true,
          }
        }
      }),

      // Students with active project profiles
      prisma.projectProfile.count({
        where: {
          isPublic: true,
          isActive: true,
          projects: {
            some: {
              isPublic: true
            }
          }
        }
      }),

      // New projects this month
      prisma.projectShowcase.count({
        where: {
          isPublic: true,
          createdAt: {
            gte: startOfMonth
          },
          projectProfile: {
            isPublic: true,
            isActive: true,
          }
        }
      }),

      // Total unique skills
      prisma.skill.count()
    ])

    const stats: PlatformStats = {
      totalStudents: activeStudents,
      totalProjects,
      totalSkills,
      featuredProjects,
      activeStudents,
      newThisMonth,
    }

    return stats

  } catch (error) {
    logger.error('Failed to get project stats', error instanceof Error ? error : new Error(String(error)))
    
    // Return default stats on error
    return {
      totalStudents: 0,
      totalProjects: 0,
      totalSkills: 0,
      featuredProjects: 0,
      activeStudents: 0,
      newThisMonth: 0,
    }
  }
}