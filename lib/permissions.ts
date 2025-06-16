import { prisma } from './db';
import { logger } from './logger';

/**
 * Check if a user has permission to perform an action on a document
 */
export async function checkDocumentPermission(
    userId: string,
    documentId: string,
    action: 'read' | 'write' | 'delete'
): Promise<boolean> {
    try {
        if (!userId || !documentId) {
            logger.warn('Permission check failed: Missing parameters', {
                action: 'permission_check',
                resource: 'document',
                metadata: { action, userId: !!userId, documentId: !!documentId }
            });
            return false;
        }

        // Get document with author and collaborator info
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: {
                authorId: true,
                isArchived: true,
                collaborators: {
                    where: { userId },
                    select: { permission: true },
                },
            },
        });

        if (!document) {
            logger.warn('Permission check failed: Document not found', {
                action: 'permission_check',
                resource: 'document',
                resourceId: documentId,
                userId,
                metadata: { action }
            });
            return false;
        }

        if (document.isArchived) {
            logger.warn('Permission check failed: Document is archived', {
                action: 'permission_check',
                resource: 'document',
                resourceId: documentId,
                userId,
                metadata: { action }
            });
            return false;
        }

        // Owner has all permissions
        if (document.authorId === userId) {
            logger.debug('Permission granted: User is document owner', {
                action: 'permission_check',
                resource: 'document',
                resourceId: documentId,
                userId,
                metadata: { action }
            });
            return true;
        }

        // Check collaborator permissions
        const collaborator = document.collaborators[0];
        if (collaborator) {
            const hasPermission = (() => {
                switch (action) {
                    case 'read':
                        return ['READ', 'WRITE', 'ADMIN'].includes(collaborator.permission);
                    case 'write':
                        return ['WRITE', 'ADMIN'].includes(collaborator.permission);
                    case 'delete':
                        return collaborator.permission === 'ADMIN';
                    default:
                        return false;
                }
            })();

            if (hasPermission) {
                logger.debug('Permission granted: User is collaborator with sufficient permissions', {
                    action: 'permission_check',
                    resource: 'document',
                    resourceId: documentId,
                    userId,
                    metadata: { action, permission: collaborator.permission }
                });
            } else {
                logger.warn('Permission denied: Insufficient collaborator permissions', {
                    action: 'permission_check',
                    resource: 'document',
                    resourceId: documentId,
                    userId,
                    metadata: { action, permission: collaborator.permission }
                });
            }

            return hasPermission;
        }

        logger.warn('Permission denied: User is not owner or collaborator', {
            action: 'permission_check',
            resource: 'document',
            resourceId: documentId,
            userId,
            metadata: { action }
        });

        return false;

    } catch (error) {
        logger.error('Permission check failed with error', error instanceof Error ? error : new Error(String(error)), {
            action: 'permission_check',
            resource: 'document',
            resourceId: documentId,
            userId,
            metadata: { action }
        });
        return false;
    }
}

/**
 * Generic permission checking utility for other resources
 */
export async function checkUserPermission(
    userId: string,
    resource: string,
    action: string,
    resourceId?: string
): Promise<boolean> {
    try {
        if (!userId) {
            logger.warn('Permission check failed: No user ID provided', {
                action: 'permission_check',
                resource,
                metadata: { action, resourceId }
            });
            return false;
        }

        // Log permission check
        logger.debug('Checking user permission', {
            action: 'permission_check',
            resource,
            userId,
            metadata: { action, resourceId }
        });

        // For now, return true for authenticated users
        // This should be extended with role-based permission logic
        return true;

    } catch (error) {
        logger.error('User permission check failed', error instanceof Error ? error : new Error(String(error)), {
            userId,
            resource,
            metadata: { action, resourceId }
        });
        return false;
    }
} 