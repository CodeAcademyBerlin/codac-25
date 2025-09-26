'use server';

import { requireServerAuth } from '@/lib/auth/auth-server';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import { ServerActionResult } from '@/types/server-action';
import { z } from 'zod';

const CreateFolderSchema = z.object({
    name: z.string().min(1, 'Folder name is required').max(100, 'Folder name too long'),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    icon: z.string().optional(),
    parentId: z.string().optional(),
});

type CreateFolderInput = z.infer<typeof CreateFolderSchema>;

export async function createFolder(
    input: CreateFolderInput
): Promise<ServerActionResult<{ id: string; name: string }>> {
    try {
        const user = await requireServerAuth();
        const validatedInput = CreateFolderSchema.parse(input);

        // Check if parent folder exists and belongs to user
        if (validatedInput.parentId) {
            const parentFolder = await (prisma as any).documentFolder.findFirst({
                where: {
                    id: validatedInput.parentId,
                    ownerId: user.id,
                },
            });

            if (!parentFolder) {
                return {
                    success: false,
                    error: 'Parent folder not found or access denied',
                };
            }
        }

        // Get the next sort order for the new folder
        const maxSortOrder = await (prisma as any).documentFolder.findFirst({
            where: {
                ownerId: user.id,
                parentId: validatedInput.parentId ?? null,
            },
            orderBy: {
                sortOrder: 'desc',
            },
            select: {
                sortOrder: true,
            },
        });

        const newSortOrder = (maxSortOrder?.sortOrder ?? 0) + 1;

        const folder = await (prisma as any).documentFolder.create({
            data: {
                name: validatedInput.name,
                description: validatedInput.description,
                color: validatedInput.color ?? '#3B82F6',
                icon: validatedInput.icon,
                parentId: validatedInput.parentId,
                ownerId: user.id,
                sortOrder: newSortOrder,
            },
        });

        logger.info('Folder created successfully', {
            action: 'create_folder',
            metadata: {
                folderId: folder.id,
                userId: user.id,
                parentId: validatedInput.parentId,
            },
        });

        return {
            success: true,
            data: {
                id: folder.id,
                name: folder.name,
            },
        };
    } catch (error) {
        logger.error('Failed to create folder', error instanceof Error ? error : new Error(String(error)), {
            action: 'create_folder',
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
            error: 'Failed to create folder',
        };
    }
}
