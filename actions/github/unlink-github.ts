'use server'

import { revalidatePath } from 'next/cache'

import { getCurrentUser } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'
import { handlePrismaError, type ServerActionResult } from '@/lib/utils/server-action-utils'

/**
 * Unlink GitHub account from user profile
 */
export async function unlinkGitHubAccount(): Promise<ServerActionResult<{ success: boolean }>> {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        // Check if user has a GitHub account linked
        const githubAccount = await prisma.account.findFirst({
            where: {
                userId: user.id,
                providerId: 'github',
            },
        })

        if (!githubAccount) {
            return {
                success: false,
                error: 'No GitHub account linked to this profile'
            }
        }

        // Delete the GitHub account link
        await prisma.account.delete({
            where: {
                id: githubAccount.id,
            },
        })

        // Revalidate relevant pages
        revalidatePath('/profile/settings')
        revalidatePath('/profile')

        logger.info('GitHub account unlinked successfully', {
            action: 'unlink_github_account',
            resource: 'github_account',
            resourceId: githubAccount.id,
            metadata: {
                userId: user.id,
                accountId: githubAccount.accountId
            }
        })

        return {
            success: true,
            data: { success: true }
        }
    } catch (error) {
        const handledError = handlePrismaError(error as any)
        logger.error('Error unlinking GitHub account', error instanceof Error ? error : new Error(String(error)))

        return {
            success: false,
            error: handledError
        }
    }
}
