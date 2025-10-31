'use server';

import { updateUser } from '@/actions/user/update-user';
import { getServerSession } from '@/lib/auth/server';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/auth';
import type { ServerActionResult } from '@/lib/utils/server-action-utils';
import { revalidatePath } from 'next/cache';

/**
 * Update the current user's profile
 * This is a wrapper around updateUser that ensures the user can only update their own profile
 */
export async function updateProfile(
    data: UpdateProfileInput
): Promise<ServerActionResult<any>> {
    try {
        // Get the current session
        const session = await getServerSession();

        if (!session || !session.user?.id) {
            return {
                success: false,
                error: 'Authentication required',
            };
        }

        // Ensure user can only update their own profile
        if (data.id !== session.user.id) {
            return {
                success: false,
                error: 'You can only update your own profile',
            };
        }

        // Validate the input
        const validatedData = updateProfileSchema.parse(data);

        // Update the user
        const result = await updateUser(validatedData);

        if (result.success) {
            // Revalidate profile-related paths
            revalidatePath('/profile');
            revalidatePath('/profile/settings');
        }

        return result;
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return {
                success: false,
                error: (error as any).errors,
            };
        }

        return {
            success: false,
            error: 'Failed to update profile',
        };
    }
}

