'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/validation/doc';

interface MoveDocInput {
    dragId: string;
    dropId: string;
    position: 'before' | 'after' | 'inside';
}

type MoveDocResult = ServerActionResult<{ success: boolean }>;

export async function moveDoc(data: MoveDocInput): Promise<MoveDocResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('move', 'document', {
            metadata: { dragId: data.dragId, dropId: data.dropId, position: data.position }
        });

        const { dragId, dropId, position } = data;

        // Prevent moving a document into itself or its children
        if (dragId === dropId) {
            return {
                success: false,
                error: 'Cannot move a document into itself'
            };
        }

        // Get the documents to move
        const dragDoc = await prisma.document.findUnique({
            where: { id: dragId },
            include: { children: true }
        });

        const dropDoc = await prisma.document.findUnique({
            where: { id: dropId },
            include: { parent: true }
        });

        if (!dragDoc || !dropDoc) {
            return {
                success: false,
                error: 'Document not found'
            };
        }

        // Check if we're trying to move a parent into its child
        const isMovingParentIntoChild = async (parentId: string, childId: string): Promise<boolean> => {
            const child = await prisma.document.findUnique({
                where: { id: childId },
                include: { parent: true }
            });

            if (!child) return false;
            if (child.parentId === parentId) return true;
            if (child.parentId) {
                return isMovingParentIntoChild(parentId, child.parentId);
            }
            return false;
        };

        if (await isMovingParentIntoChild(dragId, dropId)) {
            return {
                success: false,
                error: 'Cannot move a document into its child'
            };
        }

        let newParentId: string | null = null;

        switch (position) {
            case 'inside':
                // Move inside the drop target (make it a child)
                newParentId = dropId;
                break;

            case 'before':
            case 'after':
                // Move to the same level as the drop target
                newParentId = dropDoc.parentId;
                break;
        }

        // Update the document
        await prisma.document.update({
            where: { id: dragId },
            data: {
                parentId: newParentId,
                updatedAt: new Date()
            }
        });

        logger.logDatabaseOperation('update', 'document', dragId, {
            metadata: { newParentId, position }
        });

        // Revalidate relevant paths
        revalidatePath('/docs');
        if (dragDoc.parentId) {
            revalidatePath(`/docs/${dragDoc.parentId}`);
        }
        if (newParentId) {
            revalidatePath(`/docs/${newParentId}`);
        }

        logger.info('Document moved successfully', {
            action: 'move',
            resource: 'document',
            resourceId: dragId,
            metadata: {
                duration: Date.now() - startTime,
                newParentId,
                position
            }
        });

        return {
            success: true,
            data: { success: true }
        };

    } catch (error) {
        logger.logServerActionError('move', 'document', error instanceof Error ? error : new Error(String(error)), {
            metadata: {
                duration: Date.now() - startTime,
                dragId: data.dragId,
                dropId: data.dropId
            }
        });

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2003':
                    return {
                        success: false,
                        error: 'Invalid document reference'
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
            error: 'Failed to move document'
        };
    }
} 