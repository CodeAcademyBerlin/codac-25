'use server';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireServerAuth } from '@/lib/auth/auth-server';
import { z } from 'zod';
import { ServerActionResult } from '@/types/server-action';

const DeleteFolderSchema = z.object({
    id: z.string().min(1, 'Folder ID is required'),
    moveDocumentsTo: z.string().optional(), // Move documents to another folder or root
});

type DeleteFolderInput = z.infer<typeof DeleteFolderSchema>;

export async function deleteFolder(
    input: DeleteFolderInput
): Promise<ServerActionResult<{ deletedCount: number }>> {
    try {
        const user = await requireServerAuth();
        const validatedInput = DeleteFolderSchema.parse(input);

        // Check if folder exists and belongs to user
        const folder = await prisma.documentFolder.findFirst({
            where: {
                id: validatedInput.id,
                ownerId: user.id,
            },
            include: {
                children: true,
                documents: {
                    select: { id: true },
                },
            },
        });

        if (!folder) {
            return {
                success: false,
                error: 'Folder not found or access denied',
            };
        }

        // If moving documents to another folder, validate the destination
        if (validatedInput.moveDocumentsTo) {
            const destinationFolder = await prisma.documentFolder.findFirst({
                where: {
                    id: validatedInput.moveDocumentsTo,
                    ownerId: user.id,
                },
            });

            if (!destinationFolder) {
                return {
                    success: false,
                    error: 'Destination folder not found or access denied',
                };
            }
        }

        let deletedCount = 0;

        // Use a transaction to ensure all operations succeed or fail together
        await prisma.$transaction(async (tx) => {
            // Move documents to new location or root
            if (folder.documents.length > 0) {
                await tx.document.updateMany({
                    where: {
                        folderId: validatedInput.id,
                    },
                    data: {
                        folderId: validatedInput.moveDocumentsTo || null,
                    },
                });
            }

            // Recursively delete all child folders and their contents
            const deleteChildFolders = async (folderId: string) => {
                const children = await tx.documentFolder.findMany({
                    where: { parentId: folderId },
                    include: {
                        documents: {
                            select: { id: true },
                        },
                    },
                });

                for (const child of children) {
                    // Move child documents to the same destination
                    if (child.documents.length > 0) {
                        await tx.document.updateMany({
                            where: {
                                folderId: child.id,
                            },
                            data: {
                                folderId: validatedInput.moveDocumentsTo || null,
                            },
                        });
                    }

                    // Recursively delete child folders
                    await deleteChildFolders(child.id);
                    await tx.documentFolder.delete({
                        where: { id: child.id },
                    });
                    deletedCount++;
                }
            };

            // Delete all child folders first
            await deleteChildFolders(validatedInput.id);

            // Finally delete the main folder
            await tx.documentFolder.delete({
                where: { id: validatedInput.id },
            });
            deletedCount++;
        });

        logger.info('Folder deleted successfully', {
            action: 'delete_folder',
            metadata: {
                folderId: validatedInput.id,
                userId: user.id,
                deletedCount,
                documentsMovedTo: validatedInput.moveDocumentsTo,
            },
        });

        return {
            success: true,
            data: {
                deletedCount,
            },
        };
    } catch (error) {
        logger.error('Failed to delete folder', error instanceof Error ? error : new Error(String(error)), {
            action: 'delete_folder',
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
            error: 'Failed to delete folder',
        };
    }
}
