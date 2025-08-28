'use server'
import { z } from 'zod'

import { githubService } from '@/lib/github/github-service'
import type { ImportableProjectData } from '@/lib/github/types'
import { logger } from '@/lib/logger'
import { type ServerActionResult } from '@/lib/server-action-utils'


// Validation schema for GitHub URL
const fetchRepositorySchema = z.object({
  url: z.string()
    .min(1, 'GitHub URL is required')
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+(?:\/.*)?$/,
      'Please provide a valid GitHub repository URL (e.g., https://github.com/owner/repo)'
    )
})

type FetchRepositoryInput = z.infer<typeof fetchRepositorySchema>

/**
 * Server action to fetch and import GitHub repository data
 */
export async function fetchRepository(
  input: FetchRepositoryInput
): Promise<ServerActionResult<ImportableProjectData>> {
  try {
    // Validate input
    const validationResult = fetchRepositorySchema.safeParse(input)
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input'
      return {
        success: false,
        error: errorMessage
      }
    }

    const { url } = validationResult.data

    logger.info('Fetching GitHub repository', {
      action: 'fetch_repository',
      resource: 'github_repository',
      metadata: { url }
    })

    // Import repository using GitHub service
    const result = await githubService.importRepository(url)

    if (!result.success) {
      // Map GitHub service errors to user-friendly messages
      let errorMessage: string

      switch (result.error.type) {
        case 'INVALID_URL':
          errorMessage = 'Invalid GitHub URL format. Please check the URL and try again.'
          break
        case 'REPOSITORY_NOT_FOUND':
          errorMessage = 'Repository not found. Please check if the repository exists and is public.'
          break
        case 'PRIVATE_REPOSITORY':
          errorMessage = 'Private repositories are not currently supported. Please use a public repository.'
          break
        case 'API_RATE_LIMIT':
          errorMessage = 'GitHub API rate limit exceeded. Please try again in a few minutes.'
          break
        case 'NETWORK_ERROR':
          errorMessage = 'Network error occurred. Please check your connection and try again.'
          break
        default:
          errorMessage = 'Failed to fetch repository data. Please try again.'
      }

      logger.warn('Failed to fetch GitHub repository', {
        action: 'fetch_repository',
        resource: 'github_repository',
        metadata: {
          url,
          errorType: result.error.type,
          originalError: result.error.message
        }
      })

      return {
        success: false,
        error: errorMessage
      }
    }

    logger.info('Successfully fetched GitHub repository', {
      action: 'fetch_repository',
      resource: 'github_repository',
      metadata: {
        url,
        title: result.data.title,
        techStack: result.data.techStack,
        stars: result.data.stars
      }
    })

    return {
      success: true,
      data: result.data
    }

  } catch (error) {
    logger.error('Unexpected error in fetchRepository', error instanceof Error ? error : new Error(String(error)), {
      action: 'fetch_repository',
      resource: 'github_repository',
      metadata: { url: input.url }
    })

    return {
      success: false,
      error: 'An unexpected error occurred while fetching the repository. Please try again.'
    }
  }
}