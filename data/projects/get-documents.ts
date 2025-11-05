'use server';

import { requireAuth } from '@/lib/auth/auth-utils';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { JsonValue } from '@prisma/client/runtime/library';

export interface DocumentWithAuthor {
    id: string;
    content: JsonValue; // Plate.js Value type
    title: string | null;
    description: string | null;
    documentType: string;
    version: number;
    isPublished: boolean;
    isArchived: boolean;
    projectId: string | null;
    folderId: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
    project?: {
        id: string;
        title: string;
    } | null;
    folder?: {
        id: string;
        name: string;
        color: string;
    } | null;
}

export async function getDocumentById(
    documentId: string
): Promise<DocumentWithAuthor> {
    try {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });

        return document as DocumentWithAuthor;
    } catch (error) {
        logger.error('Failed to fetch document by ID', error instanceof Error ? error : new Error(String(error)), {

            metadata: {
                documentId,
            },
        });
        return null as any;
    }
}

export async function getDocumentsByProject(
    projectId: string
): Promise<DocumentWithAuthor[]> {
    try {
        const documents = await prisma.document.findMany({
            where: {
                projectId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return documents;
    } catch (error) {
        logger.error('Failed to fetch documents by project', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                projectId,
            },
        });
        return [];
    }
}

export async function getDocumentsByType(
    documentType: string,
    limit = 50,
    offset = 0
): Promise<DocumentWithAuthor[]> {
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
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        return documents;
    } catch (error) {
        logger.error('Failed to fetch documents by type', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                documentType,
                limit,
                offset,
            },
        });
        return [];
    }
}

export async function getUserDocuments(
    documentType?: string,
    limit = 50,
    offset = 0
): Promise<DocumentWithAuthor[]> {
    try {
        const user = await requireAuth();
        const whereClause: any = {
            authorId: user.id,
            isArchived: false,
        };

        if (documentType) {
            whereClause.documentType = documentType;
        }

        const documents = await prisma.document.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip: offset,
        });

        return documents;
    } catch (error) {
        logger.error('Failed to fetch user documents', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                documentType,
                limit,
                offset,
            },
        });
        return [];
    }
}

export async function getProjectSummaryDocument(
    projectId: string
): Promise<DocumentWithAuthor | null> {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                documentId: true,
            },
        });

        if (!project?.documentId) {
            return null;
        }

        const document = await prisma.document.findUnique({
            where: { id: project.documentId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                folder: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });

        return document;
    } catch (error) {
        logger.error('Failed to fetch project summary document', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                projectId,
            },
        });
        return null;
    }
}

export async function getDocumentStats(
    documentType?: string,
    userId?: string
): Promise<{
    totalDocuments: number;
    publishedDocuments: number;
    archivedDocuments: number;
    totalVersions: number;
}> {
    try {
        const whereClause: any = {};

        if (documentType) {
            whereClause.documentType = documentType;
        }

        if (userId) {
            whereClause.authorId = userId;
        }

        const [totalDocuments, publishedDocuments, archivedDocuments, totalVersions] = await Promise.all([
            prisma.document.count({
                where: whereClause,
            }),
            prisma.document.count({
                where: {
                    ...whereClause,
                    isPublished: true,
                },
            }),
            prisma.document.count({
                where: {
                    ...whereClause,
                    isArchived: true,
                },
            }),
            prisma.document.aggregate({
                where: whereClause,
                _sum: {
                    version: true,
                },
            }),
        ]);

        return {
            totalDocuments,
            publishedDocuments,
            archivedDocuments,
            totalVersions: totalVersions._sum.version || 0,
        };
    } catch (error) {
        logger.error('Failed to fetch document stats', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                documentType,
                userId,
            },
        });
        return {
            totalDocuments: 0,
            publishedDocuments: 0,
            archivedDocuments: 0,
            totalVersions: 0,
        };
    }
}
