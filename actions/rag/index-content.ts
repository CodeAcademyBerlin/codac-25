'use server';

import { getCurrentUser } from '@/lib/auth/auth-utils';
import { logger } from '@/lib/logger';
import { ContentIndexer } from '@/lib/rag/content-indexer';
import { ServerActionResult } from '@/lib/server-action-utils';

export interface IndexContentResult {
    indexed: number;
    errors: string[];
    duration: number;
}

export type IndexContentActionResult = ServerActionResult<IndexContentResult>;

/**
 * Index all LMS content for RAG system
 * Admin/Mentor only action
 */
export async function indexAllContent(): Promise<IndexContentActionResult> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check permissions - only admins and mentors can trigger indexing
        if (!['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        logger.info(`Content indexing initiated by user ${user.id} (${user.role})`);

        const startTime = Date.now();
        const indexer = new ContentIndexer();

        const result = await indexer.indexAllContent();
        const duration = Date.now() - startTime;

        logger.info(`Content indexing completed in ${duration}ms. Indexed: ${result.indexed}, Errors: ${result.errors.length}`);

        return {
            success: true,
            data: {
                indexed: result.indexed,
                errors: result.errors,
                duration
            }
        };

    } catch (error) {
        logger.error('Failed to index content:', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to index content'
        };
    }
}

/**
 * Reindex specific content item
 */
export async function reindexContent(
    contentType: string,
    contentId: string
): Promise<ServerActionResult<{ success: boolean; duration: number }>> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check permissions
        if (!['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        logger.info(`Reindexing ${contentType} ${contentId} by user ${user.id}`);

        const startTime = Date.now();
        const indexer = new ContentIndexer();

        await indexer.reindexContent(contentType, contentId);
        const duration = Date.now() - startTime;

        logger.info(`Reindexing completed in ${duration}ms`);

        return {
            success: true,
            data: {
                success: true,
                duration
            }
        };

    } catch (error) {
        logger.error('Failed to reindex content:', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reindex content'
        };
    }
}

/**
 * Get indexing statistics
 */
export async function getIndexingStats(): Promise<ServerActionResult<{
    totalEmbeddings: number;
    byContentType: Record<string, number>;
    averageChunksPerContent: number;
    lastIndexed?: Date;
}>> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        // Check permissions
        if (!['ADMIN', 'MENTOR'].includes(user.role)) {
            return {
                success: false,
                error: 'Insufficient permissions. Admin or Mentor role required.'
            };
        }

        const indexer = new ContentIndexer();
        const stats = await indexer.getIndexingStats();

        return {
            success: true,
            data: stats
        };

    } catch (error) {
        logger.error('Failed to get indexing stats:', error instanceof Error ? error : new Error(String(error)));
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get indexing stats'
        };
    }
}
