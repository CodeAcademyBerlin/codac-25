import fs from 'fs/promises';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Seed-specific storage utilities
 * These functions are for use in seeding scripts only (no 'server-only' directive)
 */

// Create a standalone Supabase client for seeding (no Next.js dependencies)
function createClientForSeed() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables for seeding');
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Check if a bucket exists, create if it doesn't (for seeding)
 */
export async function ensureBucketForSeed(bucketName: string): Promise<void> {
    const supabase = createClientForSeed();

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
 * Upload a file from filesystem (for seeding)
 */
export async function uploadFileFromPathForSeed(
    localFilePath: string,
    storageFilePath: string,
    bucket: string,
    contentType?: string
): Promise<{ path: string; publicUrl: string }> {
    const supabase = createClientForSeed();

    // Read file from filesystem
    const fileBuffer = await fs.readFile(localFilePath);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storageFilePath, fileBuffer, {
            cacheControl: '3600',
            upsert: true, // Allow overwriting existing files
            contentType
        });

    if (error) {
        throw new Error(`Upload failed for ${localFilePath}: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(storageFilePath);

    console.log(`🔗 Upload result for ${localFilePath}:`);
    console.log(`   - Storage path: ${data.path}`);
    console.log(`   - Public URL: ${publicUrl}`);
    console.log(`   - Bucket: ${bucket}`);
    console.log(`   - File path: ${storageFilePath}`);

    return {
        path: data.path,
        publicUrl
    };
}
