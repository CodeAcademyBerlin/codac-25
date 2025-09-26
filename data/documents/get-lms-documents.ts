import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import type { DocumentWithPlateContent } from './get-document';

export interface LMSDocumentWithAuthor extends DocumentWithPlateContent {
    author: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
}

export interface LMSNavigationItem {
    id: string;
    slug: string;
    title: string;
    navTitle?: string;
    order: number;
    access: string;
    children?: LMSNavigationItem[];
}

/**
 * Get LMS document by slug
 */
export async function getLMSDocumentBySlug(slug: string): Promise<DocumentWithPlateContent | null> {
    try {
        const document = await prisma.document.findFirst({
            where: {
                slug,
                documentType: {
                    startsWith: 'lms_'
                },
                isPublished: true,
                isArchived: false,
            },
        });

        if (!document) {
            return null;
        }

        return {
            ...document,
            content: document.content as any,
        };
    } catch (error) {
        logger.error('Failed to fetch LMS document by slug', error instanceof Error ? error : new Error(String(error)), {
            action: 'get_lms_document_by_slug',
            metadata: {
                slug,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return null;
    }
}

/**
 * Get all LMS documents for navigation
 */
export async function getLMSNavigation(): Promise<LMSNavigationItem[]> {
    try {
        const documents = await prisma.document.findMany({
            where: {
                documentType: {
                    startsWith: 'lms_'
                },
                isPublished: true,
                isArchived: false,
                slug: {
                    not: null
                },
            },
            select: {
                id: true,
                slug: true,
                title: true,
                navTitle: true,
                order: true,
                access: true,
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Organize documents into hierarchical structure
        const navigationMap = new Map<string, LMSNavigationItem>();
        const rootItems: LMSNavigationItem[] = [];

        for (const doc of documents) {
            const navItem: LMSNavigationItem = {
                id: doc.id,
                slug: doc.slug || '',
                title: doc.title || '',
                navTitle: doc.navTitle || undefined,
                order: doc.order || 0,
                access: doc.access || 'public',
            };

            navigationMap.set(doc.slug || '', navItem);

            // Determine if this is a root item or child
            const slugParts = (doc.slug || '').split('/');
            if (slugParts.length === 1) {
                // Root level item
                rootItems.push(navItem);
            } else {
                // Child item - find parent
                const parentSlug = slugParts.slice(0, -1).join('/');
                const parent = navigationMap.get(parentSlug);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(navItem);
                } else {
                    // Parent not found, treat as root
                    rootItems.push(navItem);
                }
            }
        }

        return rootItems;
    } catch (error) {
        logger.error('Failed to fetch LMS navigation', error instanceof Error ? error : new Error(String(error)), {
            action: 'get_lms_navigation',
            metadata: {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return [];
    }
}

/**
 * Get LMS documents by type
 */
export async function getLMSDocumentsByType(
    documentType: string,
    limit = 50,
    offset = 0
): Promise<LMSDocumentWithAuthor[]> {
    try {
        const documents = await prisma.document.findMany({
            where: {
                documentType,
                isPublished: true,
                isArchived: false,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
            take: limit,
            skip: offset,
        });

        return documents as LMSDocumentWithAuthor[];
    } catch (error) {
        logger.error('Failed to fetch LMS documents by type', error instanceof Error ? error : new Error(String(error)), {
            action: 'get_lms_documents_by_type',
            metadata: {
                documentType,
                limit,
                offset,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return [];
    }
}

/**
 * Get LMS documents by access level
 */
export async function getLMSDocumentsByAccess(
    access: string,
    userRole?: string,
    limit = 50,
    offset = 0
): Promise<LMSDocumentWithAuthor[]> {
    try {
        // Build access filter based on user role
        const accessFilter = buildAccessFilter(access, userRole);

        const documents = await prisma.document.findMany({
            where: {
                documentType: {
                    startsWith: 'lms_'
                },
                isPublished: true,
                isArchived: false,
                ...accessFilter,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
            take: limit,
            skip: offset,
        });

        return documents as LMSDocumentWithAuthor[];
    } catch (error) {
        logger.error('Failed to fetch LMS documents by access', error instanceof Error ? error : new Error(String(error)), {
            action: 'get_lms_documents_by_access',
            metadata: {
                access,
                userRole,
                limit,
                offset,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return [];
    }
}

/**
 * Get related LMS documents (prev/next)
 */
export async function getRelatedLMSDocuments(slug: string): Promise<{
    prev: DocumentWithPlateContent | null;
    next: DocumentWithPlateContent | null;
}> {
    try {
        const currentDoc = await getLMSDocumentBySlug(slug);
        if (!currentDoc) {
            return { prev: null, next: null };
        }

        const [prev, next] = await Promise.all([
            currentDoc.prev ? getLMSDocumentBySlug(currentDoc.prev) : null,
            currentDoc.next ? getLMSDocumentBySlug(currentDoc.next) : null,
        ]);

        return { prev, next };
    } catch (error) {
        logger.error('Failed to fetch related LMS documents', error instanceof Error ? error : new Error(String(error)), {
            action: 'get_related_lms_documents',
            metadata: {
                slug,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return { prev: null, next: null };
    }
}

/**
 * Build access filter based on user role
 */
function buildAccessFilter(_access: string, _userRole?: string) {
    // Admin can access everything
    if (userRole === 'ADMIN') {
        return {};
    }

    // Build access conditions
    const accessConditions = [];

    // Public access
    accessConditions.push({ access: 'public' });

    // All access (for authenticated users)
    if (userRole) {
        accessConditions.push({ access: 'all' });
    }

    // Role-specific access
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
        accessConditions.push({ access: 'web' });
        accessConditions.push({ access: 'data' });
    }

    return {
        OR: accessConditions,
    };
}

/**
 * Check if user has access to LMS document
 */
export function checkLMSDocumentAccess(
    documentAccess: string,
    userRole?: string
): boolean {
    // Admin can access everything
    if (userRole === 'ADMIN') {
        return true;
    }

    // Public access
    if (documentAccess === 'public') {
        return true;
    }

    // All access (for authenticated users)
    if (documentAccess === 'all' && userRole) {
        return true;
    }

    // Role-specific access
    if (userRole === 'STUDENT' || userRole === 'MENTOR') {
        return documentAccess === 'web' || documentAccess === 'data';
    }

    // Admin-only access
    if (documentAccess === 'admin') {
        return userRole === 'ADMIN';
    }

    return false;
}
