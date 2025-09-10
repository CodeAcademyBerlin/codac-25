'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { resizeBase64Image } from '@/lib/imaging/resize-base64-image';
import { decodeBase64Image } from '@/lib/imaging/decode-base64-image';
import {
    type ServerActionResult,
    type UserPrivate,
    commonSelects
} from '@/lib/server-action-utils';

type UpdateAvatarResult = ServerActionResult<UserPrivate>;

export async function updateUserAvatar(
    userId: string,
    base64Image: string
): Promise<UpdateAvatarResult> {
    const startTime = Date.now();

    try {
        logger.logServerAction('update', 'user-avatar', {
            resourceId: userId,
            metadata: { imageSize: base64Image.length }
        });

        // Validate that user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
        });

        if (!existingUser) {
            logger.warn('Avatar update failed: user not found', {
                action: 'update',
                resource: 'user-avatar',
                resourceId: userId,
            });
            return {
                success: false,
                error: 'User not found'
            };
        }

        // Process the base64 image - resize it to appropriate size
        const resizedBase64 = await resizeBase64Image(base64Image);

        // Decode the resized image to get buffer and metadata
        const { buffer, mimeType } = decodeBase64Image(resizedBase64);

        // Create a hash for the image
        const crypto = await import('crypto');
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Start a transaction to update both User and UserImage
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // First, delete any existing UserImage records for this user
            await tx.userImage.deleteMany({
                where: { userId }
            });

            // Create new UserImage record
            await tx.userImage.create({
                data: {
                    userId,
                    data: buffer,
                    contentType: mimeType,
                    hash,
                }
            });

            // Update the user's avatar field to store the base64 data
            // This allows for easy display without additional API calls
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { avatar: resizedBase64 },
                select: commonSelects.userPrivate,
            });

            return updatedUser;
        });

        logger.logDatabaseOperation('update', 'user-avatar', userId, {
            metadata: {
                imageHash: hash,
                contentType: mimeType,
                imageSize: buffer.length
            }
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/users');
        revalidatePath(`/users/${userId}`);

        logger.info('User avatar updated successfully', {
            action: 'update',
            resource: 'user-avatar',
            resourceId: userId,
            metadata: {
                duration: Date.now() - startTime,
                imageHash: hash,
                contentType: mimeType
            }
        });

        return {
            success: true,
            data: result
        };

    } catch (error) {
        logger.logServerActionError('update', 'user-avatar', error instanceof Error ? error : new Error(String(error)), {
            resourceId: userId,
            metadata: {
                duration: Date.now() - startTime
            }
        });

        // Handle Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            switch (error.code) {
                case 'P2025':
                    return {
                        success: false,
                        error: 'User not found'
                    };
                default:
                    return {
                        success: false,
                        error: 'Database error occurred'
                    };
            }
        }

        // Handle image processing errors
        if (error instanceof Error && error.message.includes('Could not distinguish mimetype')) {
            return {
                success: false,
                error: 'Invalid image format. Please upload a valid image file.'
            };
        }

        return {
            success: false,
            error: 'Failed to update avatar'
        };
    }
} 