'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import {
    deleteDocSchema,
    type DeleteDocInput,
    type ServerActionResult
} from '@/lib/validation/doc';
import { checkDocumentPermission } from '@/lib/permissions';
import { logger } from '@/lib/logger';

// Define return type for delete operation
type DeleteDocResult = ServerActionResult<{ id: string; title: string }>;

export async function deleteDoc(data: DeleteDocInput): Promise<DeleteDocResult> {
    try {
        // Validate input data
        const { id } = deleteDocSchema.parse(data);

        // Check if document exists and user has permission
        const existingDoc = await prisma.document.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                authorId: true,
                isArchived: true,
                parentId: true,
                _count: {
                    select: {
                        children: true,
                    },
                },
            },
        });

        if (!existingDoc) {
            return {
                success: false,
                error: 'Document not found'
            };
        }

        if (existingDoc.isArchived) {
            return {
                success: false,
                error: 'Document is already archived'
            };
        }

        // For folders, we'll cascade delete children. For documents, prevent deletion if has children.
        if (existingDoc._count.children > 0) {
            // Get the document to check if it's a folder
            const docWithType = await prisma.document.findUnique({
                where: { id },
                select: { isFolder: true }
            });

            if (!docWithType?.isFolder) {
                return {
                    success: false,
                    error: 'Cannot delete document with sub-documents. Please delete or move sub-documents first.'
                };
            }
            // If it's a folder, we'll cascade delete below
        }

        // Check if user has permission to delete this document
        // Note: User ID should be obtained from authentication context
        // For now, we'll use the document's authorId for demonstration
        const currentUserId = existingDoc.authorId; // This should be replaced with actual auth context
        const isAuthorized = await checkDocumentPermission(currentUserId, id, 'delete');
        if (!isAuthorized) {
            logger.logPermissionDenied('delete', 'document', currentUserId, {
                resourceId: id
            });
            return {
                success: false,
                error: 'You do not have permission to delete this document'
            };
        }

        // Function to recursively archive all children
        const archiveRecursively = async (documentId: string): Promise<void> => {
            // Get all children
            const children = await prisma.document.findMany({
                where: { parentId: documentId },
                select: { id: true }
            });

            // Archive all children recursively
            for (const child of children) {
                await archiveRecursively(child.id);
            }

            // Archive the current document
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    isArchived: true,
                    updatedAt: new Date(),
                },
            });
        };

        // Archive the document and all its children
        await archiveRecursively(id);

        // Revalidate relevant paths
        revalidatePath('/docs');
        if (existingDoc.parentId) {
            revalidatePath(`/docs/${existingDoc.parentId}`);
        }

        return {
            success: true,
            data: {
                id: existingDoc.id,
                title: existingDoc.title
            }
        };

    } catch (error) {
        logger.error('Error deleting document', error instanceof Error ? error : new Error(String(error)), {
            action: 'delete',
            resource: 'document',
            resourceId: data.id
        });

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return {
                success: false,
                error: (error as any).errors
            };
        }

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2025':
                    return {
                        success: false,
                        error: 'Document not found'
                    };
                case 'P2003':
                    return {
                        success: false,
                        error: 'Cannot delete document due to related records'
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred'
                    };
            }
        }

        return {
            success: false,
            error: 'Failed to delete document'
        };
    }
} 