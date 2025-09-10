import { NextResponse } from 'next/server';

import { STORAGE_BUCKETS } from '@/lib/supabase/storage';
import { ensureBucket } from '@/lib/supabase/storage-server';

export async function POST() {
    try {
        // Initialize all required buckets
        await Promise.all([
            ensureBucket(STORAGE_BUCKETS.EDITOR),
            ensureBucket(STORAGE_BUCKETS.DUCKS),
            ensureBucket(STORAGE_BUCKETS.GENERAL)
        ]);

        return NextResponse.json({
            success: true,
            message: 'Storage buckets initialized successfully',
            buckets: Object.values(STORAGE_BUCKETS)
        });
    } catch (error) {
        console.error('Failed to initialize storage buckets:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to initialize storage buckets' },
            { status: 500 }
        );
    }
}
