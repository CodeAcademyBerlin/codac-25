'use server';

import { revalidatePath } from 'next/cache';

import { Prisma } from '@prisma/client';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db/prisma';
import {
  getGitHubRepositories,
  getGitHubRepository,
  getGitHubUser,
  getRepositoryLanguages,
  isGitHubConnected,
  type GitHubRepository,
} from '@/lib/github/api';
import { logger } from '@/lib/logger';
import {
  handlePrismaError,
  type ServerActionResult,
} from '@/lib/utils/server-action-utils';

/**
 * Get user's GitHub repositories
 */
export async function fetchGitHubRepositories(): Promise<
  ServerActionResult<GitHubRepository[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const isConnected = await isGitHubConnected();
    if (!isConnected) {
      return {
        success: false,
        error:
          'GitHub account not connected. Please connect your GitHub account first.',
      };
    }

    const repositories = await getGitHubRepositories({
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
      type: 'all',
    });

    logger.info('GitHub repositories fetched successfully', {
      action: 'fetch_github_repositories',
      resource: 'github_repositories',
      metadata: {
        userId: user.id,
        repositoryCount: repositories.length,
      },
    });

    return {
      success: true,
      data: repositories,
    };
  } catch (error) {
    logger.error(
      'Error fetching GitHub repositories',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: 'Failed to fetch GitHub repositories. Please try again.',
    };
  }
}

/**
 * Create a project from a GitHub repository
 */
export async function createProjectFromGitHub(
  repositoryFullName: string,
  additionalData?: {
    title?: string;
    description?: string;
    shortDesc?: string;
    challenges?: string;
    solutions?: string;
    demoUrl?: string;
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }
): Promise<ServerActionResult<{ id: string; projectProfileId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const isConnected = await isGitHubConnected();
    if (!isConnected) {
      return {
        success: false,
        error:
          'GitHub account not connected. Please connect your GitHub account first.',
      };
    }

    // Fetch repository details
    const repository = await getGitHubRepository(repositoryFullName);
    if (!repository) {
      return {
        success: false,
        error: 'Repository not found or access denied',
      };
    }

    // Fetch repository languages
    const languages = await getRepositoryLanguages(repositoryFullName);
    const techStack = Object.keys(languages);

    // Get or create user's project profile
    let projectProfile = await prisma.projectProfile.findUnique({
      where: { userId: user.id },
    });

    if (!projectProfile) {
      projectProfile = await prisma.projectProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title: additionalData?.title || repository.name,
        description:
          additionalData?.description ||
          repository.description ||
          `A project from ${repository.name}`,
        shortDesc:
          additionalData?.shortDesc ||
          repository.description ||
          repository.name,
        images: [], // Can be populated later
        demoUrl: additionalData?.demoUrl || null,
        githubUrl: repository.html_url,
        techStack: techStack,
        features: [], // Can be populated later
        challenges: additionalData?.challenges || null,
        solutions: additionalData?.solutions || null,
        status:
          (additionalData?.status as
            | 'COMPLETED'
            | 'IN_PROGRESS'
            | 'PLANNING') || 'COMPLETED',
        startDate: additionalData?.startDate
          ? new Date(additionalData.startDate)
          : new Date(repository.created_at),
        endDate: additionalData?.endDate
          ? new Date(additionalData.endDate)
          : new Date(repository.updated_at),
        isPublic: additionalData?.isPublic ?? true,
        projectProfileId: projectProfile.id,
      },
    });

    // Revalidate relevant pages
    revalidatePath('/projects');
    revalidatePath('/projects/my');
    revalidatePath('/showcase');

    logger.info('Project created from GitHub repository successfully', {
      action: 'create_project_from_github',
      resource: 'project',
      resourceId: project.id,
      metadata: {
        userId: user.id,
        repositoryFullName,
        repositoryName: repository.name,
        techStack: techStack,
      },
    });

    return {
      success: true,
      data: {
        id: project.id,
        projectProfileId: projectProfile.id,
      },
    };
  } catch (error) {
    const handledError =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? handlePrismaError(error)
        : 'An unexpected error occurred';
    logger.error(
      'Error creating project from GitHub repository',
      error instanceof Error ? error : new Error(String(error))
    );

    return {
      success: false,
      error: handledError,
    };
  }
}

/**
 * Check if user has GitHub connected
 */
export async function checkGitHubConnection(): Promise<
  ServerActionResult<boolean>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const isConnected = await isGitHubConnected();

    return {
      success: true,
      data: isConnected,
    };
  } catch (error) {
    logger.error(
      'Error checking GitHub connection',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: 'Failed to check GitHub connection',
    };
  }
}

/**
 * Get repository details for project creation
 */
export async function getRepositoryDetails(
  repositoryFullName: string
): Promise<ServerActionResult<GitHubRepository>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const isConnected = await isGitHubConnected();
    if (!isConnected) {
      return {
        success: false,
        error: 'GitHub account not connected',
      };
    }

    const repository = await getGitHubRepository(repositoryFullName);
    if (!repository) {
      return {
        success: false,
        error: 'Repository not found or access denied',
      };
    }

    return {
      success: true,
      data: repository,
    };
  } catch (error) {
    logger.error(
      'Error fetching repository details',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: 'Failed to fetch repository details',
    };
  }
}

/**
 * Get GitHub user information
 */
export async function getGitHubUserInfo(): Promise<
  ServerActionResult<unknown>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const isConnected = await isGitHubConnected();
    if (!isConnected) {
      return {
        success: false,
        error: 'GitHub account not connected',
      };
    }

    const gitHubUser = await getGitHubUser();
    if (!gitHubUser) {
      return {
        success: false,
        error: 'Failed to fetch GitHub user information',
      };
    }

    return {
      success: true,
      data: gitHubUser,
    };
  } catch (error) {
    logger.error(
      'Error fetching GitHub user info',
      error instanceof Error ? error : new Error(String(error))
    );
    return {
      success: false,
      error: 'Failed to fetch GitHub user information',
    };
  }
}
