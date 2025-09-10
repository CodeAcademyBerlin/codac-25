import { createClient as createBrowserClient } from './client';

export interface UploadResult {
    key: string;
    name: string;
    size: number;
    type: string;
    url: string;
    path?: string;
}

export interface UploadOptions {
    bucket?: string;
    folder?: string;
    onProgress?: (progress: number) => void;
}

// Default bucket names
export const STORAGE_BUCKETS = {
    EDITOR: 'editor-uploads',
    DUCKS: 'duck-uploads',
    GENERAL: 'uploads'
} as const;

/**
 * Upload a file to Supabase storage (client-side)
 */
export async function uploadFile(
    file: File,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const supabase = createBrowserClient();
    const { bucket = STORAGE_BUCKETS.GENERAL, folder = '', onProgress } = options;

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    try {
        // Simulate progress for better UX
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress < 90) {
                onProgress?.(Math.min(progress, 90));
            }
        }, 100);

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        clearInterval(progressInterval);
        onProgress?.(100);

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            key: data.path,
            name: file.name,
            size: file.size,
            type: file.type,
            url: publicUrl,
            path: filePath
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Upload multiple files to Supabase storage
 */
export async function uploadFiles(
    files: File[],
    options: UploadOptions = {}
): Promise<UploadResult[]> {
    const results = await Promise.all(
        files.map(file => uploadFile(file, options))
    );
    return results;
}

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(
    filePath: string,
    bucket: string = STORAGE_BUCKETS.GENERAL
): Promise<void> {
    const supabase = createBrowserClient();

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

// Note: For signed URLs, import getSignedUrl from './storage-server' in server-side code

/**
 * List files in a bucket/folder
 */
export async function listFiles(
    bucket: string = STORAGE_BUCKETS.GENERAL,
    folder?: string,
    limit?: number,
    offset?: number
) {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
            limit,
            offset,
            sortBy: { column: 'created_at', order: 'desc' }
        });

    if (error) {
        throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
}

// Note: For bucket management, import ensureBucket from './storage-server' in server-side code
