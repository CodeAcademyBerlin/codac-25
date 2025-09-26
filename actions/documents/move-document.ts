'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireServerAuth } from '@/lib/auth/auth-server';
import { z } from 'zod';
import { ServerActionResult } from '@/types/server-action';

const MoveDocumentSchema = z.object({
    documentId: z.string().min(1, 'Document ID is required'),
    folderId: z.string().optional(), // null means move to root
});

type MoveDocumentInput = z.infer<typeof MoveDocumentSchema>;

export async function moveDocument(
    input: MoveDocumentInput
): Promise<ServerActionResult<{ documentId: string; folderId: string | null }>> {
    try {
        const user = await requireServerAuth();
        const validatedInput = MoveDocumentSchema.parse(input);

        // Check if document exists and belongs to user
        const document = await prisma.document.findFirst({
            where: {
                id: validatedInput.documentId,
                authorId: user.id,
            },
        });

        if (!document) {
            return {
                success: false,
                error: 'Document not found or access denied',
            };
        }

        // If moving to a folder, validate the folder exists and belongs to user
        if (validatedInput.folderId) {
            const folder = await prisma.documentFolder.findFirst({
                where: {
                    id: validatedInput.folderId,
                    ownerId: user.id,
                },
            });

            if (!folder) {
                return {
                    success: false,
                    error: 'Destination folder not found or access denied',
                };
            }
        }

        // Update the document's folder
        const updatedDocument = await prisma.document.update({
            where: {
                id: validatedInput.documentId,
            },
            data: {
                folderId: validatedInput.folderId || null,
            },
        });

        logger.info('Document moved successfully', {
            action: 'move_document',
            metadata: {
                documentId: validatedInput.documentId,
                userId: user.id,
                fromFolderId: document.folderId,
                toFolderId: validatedInput.folderId,
            },
        });

        return {
            success: true,
            data: {
                documentId: updatedDocument.id,
                folderId: updatedDocument.folderId,
            },
        };
    } catch (error) {
        logger.error('Failed to move document', error instanceof Error ? error : new Error(String(error)), {
            action: 'move_document',
            metadata: {
                input,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Invalid input data',
            };
        }

        return {
            success: false,
            error: 'Failed to move document',
        };
    }
}
