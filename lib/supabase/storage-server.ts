import 'server-only';

import { createClient } from './server';

/**
 * Server-only storage utilities
 * These functions can only be used in server components, server actions, or API routes
 */

/**
 * Get signed URL for private files (server-side only)
 */
export async function getSignedUrl(
    filePath: string,
    bucket: string,
    expiresIn: number = 3600
): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

    if (error || !data) {
        throw new Error(`Failed to get signed URL: ${error?.message}`);
    }

    return data.signedUrl;
}

/**
 * Check if a bucket exists, create if it doesn't (server-side only)
 */
export async function ensureBucket(bucketName: string): Promise<void> {
    const supabase = await createClient();

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        throw new Error(`Failed to list buckets: ${listError.message}`);
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: [
                'image/*',
                'video/*',
                'audio/*',
                'application/pdf',
                'text/*',
                'application/json',
                'application/xml'
            ],
            fileSizeLimit: 50 * 1024 * 1024 // 50MB
        });

        if (createError) {
            throw new Error(`Failed to create bucket: ${createError.message}`);
        }
    }
}

/**
 * List all buckets (server-side only)
 */
export async function listBuckets() {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        throw new Error(`Failed to list buckets: ${error.message}`);
    }

    return data;
}

/**
 * Delete files (server-side only)
 */
export async function deleteFiles(
    filePaths: string[],
    bucket: string
): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from(bucket)
        .remove(filePaths);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}
