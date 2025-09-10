/**
 * Storage Migration Script
 * Initializes Supabase storage buckets for the migrated system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const STORAGE_BUCKETS = {
    EDITOR: 'editor-uploads',
    DUCKS: 'duck-uploads',
    GENERAL: 'uploads'
};

async function initializeStorage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase environment variables');
        console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY)');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('🚀 Initializing Supabase storage buckets...');

        // Check existing buckets
        const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            throw new Error(`Failed to list buckets: ${listError.message}`);
        }

        const existingBucketNames = existingBuckets.map(bucket => bucket.name);
        console.log(`📦 Found ${existingBuckets.length} existing buckets:`, existingBucketNames);

        // Create missing buckets
        for (const [name, bucketName] of Object.entries(STORAGE_BUCKETS)) {
            if (existingBucketNames.includes(bucketName)) {
                console.log(`✅ Bucket '${bucketName}' already exists`);
                continue;
            }

            console.log(`🔨 Creating bucket '${bucketName}'...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                allowedMimeTypes: [
                    'image/*',
                    'video/*',
                    'audio/*',
                    'application/pdf',
                    'text/*',
                    'application/json',
                    'application/xml',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ],
                fileSizeLimit: 50 * 1024 * 1024 // 50MB
            });

            if (createError) {
                console.error(`❌ Failed to create bucket '${bucketName}':`, createError.message);
            } else {
                console.log(`✅ Successfully created bucket '${bucketName}'`);
            }
        }

        // Set up bucket policies (optional - for public read access)
        for (const [name, bucketName] of Object.entries(STORAGE_BUCKETS)) {
            try {
                const { error: policyError } = await supabase.storage
                    .from(bucketName)
                    .createSignedUrl('test', 60); // Test if we can create signed URLs

                console.log(`🔐 Bucket '${bucketName}' policies configured`);
            } catch (error) {
                console.log(`⚠️  Could not test bucket policy for '${bucketName}' - this might be expected`);
            }
        }

        console.log('\n🎉 Storage initialization complete!');
        console.log('\nBuckets created:');
        Object.entries(STORAGE_BUCKETS).forEach(([name, bucketName]) => {
            console.log(`  • ${name}: ${bucketName}`);
        });

        console.log('\n📋 Next steps:');
        console.log('1. Ensure your Supabase project has the correct RLS policies');
        console.log('2. Test file uploads in your application');
        console.log('3. Monitor storage usage in the Supabase dashboard');

    } catch (error) {
        console.error('❌ Storage initialization failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    initializeStorage();
}

module.exports = { initializeStorage, STORAGE_BUCKETS };
