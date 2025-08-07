#!/usr/bin/env tsx

/**
 * Script to index LMS content for the RAG system
 * Usage: npx tsx scripts/index-rag-content.ts [options]
 * 
 * Options:
 *   --full     Index all content (default)
 *   --stats    Show indexing statistics only
 *   --help     Show this help message
 */

import { ContentIndexer } from '../lib/rag/content-indexer';
import { logger } from '../lib/logger';

async function main() {
    const args = process.argv.slice(2);
    const showHelp = args.includes('--help') || args.includes('-h');
    const showStats = args.includes('--stats');
    const fullIndex = args.includes('--full') || (!showStats && !showHelp);

    if (showHelp) {
        console.log(`
RAG Content Indexing Script

Usage: npx tsx scripts/index-rag-content.ts [options]

Options:
  --full     Index all LMS content (courses, lessons, assignments, resources)
  --stats    Show current indexing statistics
  --help     Show this help message

Examples:
  npx tsx scripts/index-rag-content.ts --full
  npx tsx scripts/index-rag-content.ts --stats

Environment Variables:
  EMBEDDING_PROVIDER  Set to 'local' (default) or 'gemini'
  GEMINI_API_KEY      Required when using Gemini embeddings
    `);
        return;
    }

    const indexer = new ContentIndexer();

    if (showStats) {
        console.log('📊 Getting indexing statistics...\n');

        try {
            const stats = await indexer.getIndexingStats();

            console.log('Current Indexing Statistics:');
            console.log('============================');
            console.log(`Total Embeddings: ${stats.totalEmbeddings}`);
            console.log(`Average Chunks per Content: ${stats.averageChunksPerContent.toFixed(2)}`);
            console.log(`Last Indexed: ${stats.lastIndexed ? stats.lastIndexed.toLocaleString() : 'Never'}`);
            console.log('\nBy Content Type:');
            Object.entries(stats.byContentType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });

        } catch (error) {
            logger.error('Failed to get stats:', error instanceof Error ? error : undefined);
            process.exit(1);
        }

        return;
    }

    if (fullIndex) {
        console.log('🚀 Starting full content indexing...\n');
        console.log('This may take several minutes depending on content size.');
        console.log('Provider:', process.env.EMBEDDING_PROVIDER || 'local');
        console.log('');

        const startTime = Date.now();

        try {
            const result = await indexer.indexAllContent();
            const duration = Date.now() - startTime;

            console.log('\n✅ Indexing completed!');
            console.log('===================');
            console.log(`Total chunks indexed: ${result.indexed}`);
            console.log(`Duration: ${(duration / 1000).toFixed(2)} seconds`);
            console.log(`Errors: ${result.errors.length}`);

            if (result.errors.length > 0) {
                console.log('\nErrors encountered:');
                result.errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error}`);
                });
            }

            // Show final stats
            console.log('\n📊 Final Statistics:');
            const finalStats = await indexer.getIndexingStats();
            console.log(`Total Embeddings: ${finalStats.totalEmbeddings}`);
            Object.entries(finalStats.byContentType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });

        } catch (error) {
            logger.error('Indexing failed:', error instanceof Error ? error : undefined);
            console.error('\n❌ Indexing failed:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n⚠️  Indexing interrupted by user');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n\n⚠️  Indexing terminated');
    process.exit(0);
});

// Run the script
main().catch((error) => {
    logger.error('Script failed:', error instanceof Error ? error : undefined);
    console.error('❌ Script failed:', error instanceof Error ? error.message : error);
    process.exit(1);
});
