'use server';

import { Project, ProjectLike, ProjectProfile, User } from '@prisma/client';

import { requireServerAuth } from '@/lib/auth/auth-server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type {
  ProjectFilter,
} from '@/types/portfolio';


export type ProjectDTO = Project & {
  projectProfile: ProjectProfile & {
    user: Pick<User, 'id' | 'name' | 'username' | 'avatar'>;
  };
  document?: {
    id: string;
    content: any; // Plate.js Value type
    title: string | null;
    description: string | null;
  } | null;
  projectLikes: ProjectLike[];
  _count: {
    comments: number;
    projectLikes: number;
    collaborators: number;
  };
};

export async function getAllProjects(
  filter: ProjectFilter = {}
): Promise<ProjectDTO[]> {

  try {
    // For public projects, we don't need authentication
    const userId = null;

    const { search, techStack, status, featured } = filter;

    // Build where clause
    const where: any = {
      isPublic: true,
      projectProfile: {
        isPublic: true,
        isActive: true,
      },
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDesc: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (techStack && techStack.length > 0) {
      where.techStack = {
        array_contains: techStack,
      };
    }

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (featured) {
      where.isFeatured = true;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        projectProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        document: {
          select: {
            id: true,
            content: true,
            title: true,
            description: true,
          },
        },
        projectLikes: {
          where: userId ? { userId } : { id: 'never-matches' },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            projectLikes: true,
            collaborators: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });

    // Add isLiked property to each project
    const projectsWithLikeStatus = projects.map(project => ({
      ...project,
      isLiked: userId ? project.projectLikes.length > 0 : false,
      // Remove the projectLikes array from the response (we only needed it for the check)
      projectLikes: [],
    }));

    return projectsWithLikeStatus as ProjectDTO[];
  } catch (error) {
    logger.error(
      'Failed to get projects',
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}



export async function getFeaturedProjects(
  limit = 6
): Promise<ProjectDTO[]> {
  try {
    // For public projects, we don't need authentication
    const userId = null;

    const projects = await prisma.project.findMany({
      where: {
        isPublic: true,
        isFeatured: true,
        projectProfile: {
          isPublic: true,
          isActive: true,
        },
      },
      include: {
        projectProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        document: {
          select: {
            id: true,
            content: true,
            title: true,
            description: true,
          },
        },
        projectLikes: {
          where: userId ? { userId } : { id: 'never-matches' },
          select: { id: true },
        },
        _count: {
          select: {
            comments: true,
            projectLikes: true,
            collaborators: true,
          },
        },
      },
      orderBy: [{ likes: 'desc' }, { views: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });



    return projects as ProjectDTO[];
  } catch (error) {
    logger.error(
      'Failed to get featured projects',
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

export async function getUserProjects(
  userId?: string
): Promise<ProjectDTO[]> {
  // If userId is provided, use it directly (called from authenticated server component)
  // Otherwise, require authentication (called from server action)
  let finalUserId: string;
  if (userId) {
    finalUserId = userId;
  } else {
    const user = await requireServerAuth();
    finalUserId = user.id;
  }

  try {

    const projects = await prisma.project.findMany({
      where: {
        projectProfile: {
          userId: finalUserId,
        },
      },
      include: {
        projectProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        document: {
          select: {
            id: true,
            content: true,
            title: true,
            description: true,
          },
        },
        _count: {
          select: {
            comments: true,
            projectLikes: true,
            collaborators: true,
          },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
    });

    return projects as ProjectDTO[];
  } catch (error) {
    logger.error(
      'Failed to get user projects',
      error instanceof Error ? error : new Error(String(error)),
      {
        action: 'get_user_projects',
        metadata: { userId: finalUserId },
      }
    );
    return [];
  }
}
