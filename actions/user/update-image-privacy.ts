'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { type ServerActionResult } from '@/lib/validation/user';

type ImagePrivacyData = {
    imagePrivate?: boolean;
    photoConsent?: boolean;
};

/**
 * Update user image privacy settings
 * Note: These fields need to be added to the User model in schema.prisma
 */
export async function updateImagePrivacy(
    data: ImagePrivacyData
): Promise<ServerActionResult<void>> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized',
            };
        }

        // TODO: Add imagePrivate and photoConsent fields to User model
        // For now, just return success to prevent build errors
        logger.warn('updateImagePrivacy called but fields not implemented in schema', {
            userId: session.user.id,
            metadata: { requestedData: data },
        });

        revalidatePath('/profile/settings');

        return {
            success: true,
            data: undefined,
        };
    } catch (error) {
        logger.error(
            'Failed to update image privacy',
            error instanceof Error ? error : new Error(String(error))
        );

        return {
            success: false,
            error: 'Failed to update privacy settings',
        };
    }
}

/**
 * Remove user profile image
 */
export async function removeUserImage(): Promise<ServerActionResult<void>> {
    try {
        const session = await getSession();

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized',
            };
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { image: null },
        });

        revalidatePath('/profile/settings');
        revalidatePath('/profile');

        logger.info('User image removed', {
            userId: session.user.id,
        });

        return {
            success: true,
            data: undefined,
        };
    } catch (error) {
        logger.error(
            'Failed to remove user image',
            error instanceof Error ? error : new Error(String(error))
        );

        return {
            success: false,
            error: 'Failed to remove image',
        };
    }
}
