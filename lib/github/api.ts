'use server';

import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  language: string | null;
  languages_url: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
  created_at: string;
  private: boolean;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
};

export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
};

/**
 * Get the user's GitHub access token from the database
 */
export async function getGitHubAccessToken(
  userId: string
): Promise<string | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: 'github',
      },
      select: {
        accessToken: true,
      },
    });

    return account?.accessToken || null;
  } catch (error) {
    logger.error(
      'Error fetching GitHub access token',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Make authenticated request to GitHub API
 */
async function makeGitHubRequest<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'CODAC-App',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;

    // Provide more specific error messages
    if (response.status === 401) {
      errorMessage += ' - Authentication failed. Please check your GitHub OAuth configuration.';
    } else if (response.status === 403) {
      errorMessage += ' - Access forbidden. Please check your GitHub permissions.';
    } else if (response.status === 404) {
      errorMessage += ' - Resource not found.';
    } else {
      errorMessage += ` - ${errorText}`;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Get user's GitHub profile information
 */
export async function getGitHubUser(): Promise<GitHubUser | null> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return null;
    }

    return makeGitHubRequest<GitHubUser>('/user', accessToken);
  } catch (error) {
    logger.error(
      'Error fetching GitHub user',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Get user's GitHub repositories
 */
export async function getGitHubRepositories(options?: {
  per_page?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  type?: 'all' | 'owner' | 'public' | 'private' | 'member';
}): Promise<GitHubRepository[]> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return [];
    }

    const params = new URLSearchParams({
      per_page: String(options?.per_page || 100),
      sort: options?.sort || 'updated',
      direction: options?.direction || 'desc',
      type: options?.type || 'all',
    });

    return makeGitHubRequest<GitHubRepository[]>(
      `/user/repos?${params}`,
      accessToken
    );
  } catch (error) {
    logger.error(
      'Error fetching GitHub repositories',
      error instanceof Error ? error : new Error(String(error))
    );
    return [];
  }
}

/**
 * Get repository details by full name (owner/repo)
 */
export async function getGitHubRepository(
  fullName: string
): Promise<GitHubRepository | null> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return null;
    }

    return makeGitHubRequest<GitHubRepository>(
      `/repos/${fullName}`,
      accessToken
    );
  } catch (error) {
    logger.error(
      'Error fetching GitHub repository',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}

/**
 * Get repository languages
 */
export async function getRepositoryLanguages(
  fullName: string
): Promise<Record<string, number>> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {};
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return {};
    }

    return makeGitHubRequest<Record<string, number>>(
      `/repos/${fullName}/languages`,
      accessToken
    );
  } catch (error) {
    logger.error(
      'Error fetching repository languages',
      error instanceof Error ? error : new Error(String(error))
    );
    return {};
  }
}

/**
 * Check if user has GitHub account connected
 */
export async function isGitHubConnected(): Promise<boolean> {
  try {
    // Check if GitHub OAuth is configured
    if (!process.env.AUTH_GITHUB_ID || !process.env.AUTH_GITHUB_SECRET) {
      logger.warn('GitHub OAuth not configured - missing environment variables');
      return false;
    }

    const session = await getSession();
    if (!session?.user?.id) {
      return false;
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    return !!accessToken;
  } catch (error) {
    logger.error(
      'Error checking GitHub connection',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
}

/**
 * Get user's GitHub username
 */
export async function getGitHubUsername(): Promise<string | null> {
  try {
    const session = await getSession();
    if (!session?.session?.user?.id) {
      return null;
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session?.session?.user?.id!,
        providerId: 'github',
      },
      select: {
        accountId: true,
      },
    });

    return account?.accountId || null;
  } catch (error) {
    logger.error(
      'Error fetching GitHub username',
      error instanceof Error ? error : new Error(String(error))
    );
    return null;
  }
}
