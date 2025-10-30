'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { Prisma } from '@prisma/client';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/utils/server-action-utils';

type UploadAvatarResult = ServerActionResult<{ avatar: string }>;

/**
 * Simple avatar upload that processes image and returns URL
 */
export async function uploadAvatar(
    formData: FormData
): Promise<UploadAvatarResult> {
    const startTime = Date.now();

    try {
        // Get current session
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        const file = formData.get('avatar') as File;
        if (!file) {
            return {
                success: false,
                error: 'No file provided',
            };
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'File must be an image',
            };
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return {
                success: false,
                error: 'File size must be less than 5MB',
            };
        }

        logger.logServerAction('upload', 'user-avatar', {
            resourceId: session.user.id,
            metadata: { fileSize: file.size, fileType: file.type },
        });

        // Convert to base64 data URL for storage
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Update user avatar
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { avatar: dataUrl },
            select: { id: true, avatar: true },
        });

        // Revalidate relevant paths and tags
        revalidatePath('/profile');
        revalidatePath('/profile/settings');
        revalidatePath('/');
        updateTag('user');
        updateTag(`user-${session.user.id}`);

        logger.info('Avatar uploaded successfully', {
            action: 'upload',
            resource: 'user-avatar',
            resourceId: session.user.id,
            metadata: {
                duration: Date.now() - startTime,
                fileSize: file.size,
                fileType: file.type,
            },
        });

        return {
            success: true,
            data: { avatar: user.avatar! },
        };
    } catch (error) {
        logger.logServerActionError(
            'upload',
            'user-avatar',
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: {
                    duration: Date.now() - startTime,
                },
            }
        );

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2025':
                    return {
                        success: false,
                        error: 'User not found',
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred',
                    };
            }
        }

        return {
            success: false,
            error: 'Failed to upload avatar',
        };
    }
}

/**
 * Reset avatar to default
 */
export async function resetAvatar(): Promise<UploadAvatarResult> {
    const startTime = Date.now();

    try {
        // Get current session
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        logger.logServerAction('reset', 'user-avatar', {
            resourceId: session.user.id,
        });

        // Reset to default avatar
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { avatar: '/codac_logo.svg' },
            select: { id: true, avatar: true },
        });

        // Revalidate relevant paths and tags
        revalidatePath('/profile');
        revalidatePath('/profile/settings');
        revalidatePath('/');
        updateTag('user');
        updateTag(`user-${session.user.id}`);

        logger.info('Avatar reset to default', {
            action: 'reset',
            resource: 'user-avatar',
            resourceId: session.user.id,
            metadata: {
                duration: Date.now() - startTime,
            },
        });

        return {
            success: true,
            data: { avatar: user.avatar! },
        };
    } catch (error) {
        logger.logServerActionError(
            'reset',
            'user-avatar',
            error instanceof Error ? error : new Error(String(error)),
            {
                metadata: {
                    duration: Date.now() - startTime,
                },
            }
        );

        return {
            success: false,
            error: 'Failed to reset avatar',
        };
    }
}
