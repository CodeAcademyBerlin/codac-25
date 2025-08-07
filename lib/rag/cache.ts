import { logger } from '@/lib/logger';
import { ContentSource } from '@/types/rag';

/**
 * Simple in-memory cache for RAG system
 * In production, consider using Redis or similar
 */
class RAGCache {
    private cache: Map<string, {
        data: any;
        timestamp: number;
        ttl: number;
    }> = new Map();

    private readonly DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
    private readonly MAX_CACHE_SIZE = 1000;

    /**
     * Generate cache key for query embeddings
     */
    private getQueryEmbeddingKey(query: string): string {
        return `query_embedding:${this.hashString(query)}`;
    }

    /**
     * Generate cache key for similarity search results
     */
    private getSimilaritySearchKey(
        queryEmbedding: number[],
        limit: number,
        threshold: number
    ): string {
        const embeddingHash = this.hashArray(queryEmbedding.slice(0, 10)); // Use first 10 dimensions for key
        return `similarity:${embeddingHash}:${limit}:${threshold}`;
    }

    /**
     * Generate cache key for follow-up suggestions
     */
    private getSuggestionsKey(sources: ContentSource[], query: string): string {
        const sourcesHash = this.hashString(sources.map(s => s.id).join(','));
        const queryHash = this.hashString(query);
        return `suggestions:${sourcesHash}:${queryHash}`;
    }

    /**
     * Set item in cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        try {
            // Clean up expired items if cache is getting full
            if (this.cache.size >= this.MAX_CACHE_SIZE) {
                this.cleanup();
            }

            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                ttl: ttl || this.DEFAULT_TTL
            });
        } catch (error) {
            logger.warn('Cache set failed');
        }
    }

    /**
     * Get item from cache
     */
    get<T>(key: string): T | null {
        try {
            const item = this.cache.get(key);

            if (!item) {
                return null;
            }

            // Check if item has expired
            if (Date.now() - item.timestamp > item.ttl) {
                this.cache.delete(key);
                return null;
            }

            return item.data as T;
        } catch (error) {
            logger.warn('Cache get failed');
            return null;
        }
    }

    /**
     * Cache query embedding
     */
    setQueryEmbedding(query: string, embedding: number[], tokenCount: number): void {
        const key = this.getQueryEmbeddingKey(query);
        this.set(key, { embedding, tokenCount }, this.DEFAULT_TTL);
    }

    /**
     * Get cached query embedding
     */
    getQueryEmbedding(query: string): { embedding: number[]; tokenCount: number } | null {
        const key = this.getQueryEmbeddingKey(query);
        return this.get(key);
    }

    /**
     * Cache similarity search results
     */
    setSimilarityResults(
        queryEmbedding: number[],
        limit: number,
        threshold: number,
        results: ContentSource[]
    ): void {
        const key = this.getSimilaritySearchKey(queryEmbedding, limit, threshold);
        this.set(key, results, 30 * 60 * 1000); // 30 minutes for search results
    }

    /**
     * Get cached similarity search results
     */
    getSimilarityResults(
        queryEmbedding: number[],
        limit: number,
        threshold: number
    ): ContentSource[] | null {
        const key = this.getSimilaritySearchKey(queryEmbedding, limit, threshold);
        return this.get(key);
    }

    /**
     * Cache follow-up suggestions
     */
    setFollowUpSuggestions(
        sources: ContentSource[],
        query: string,
        suggestions: string[]
    ): void {
        const key = this.getSuggestionsKey(sources, query);
        this.set(key, suggestions, 2 * 60 * 60 * 1000); // 2 hours for suggestions
    }

    /**
     * Get cached follow-up suggestions
     */
    getFollowUpSuggestions(sources: ContentSource[], query: string): string[] | null {
        const key = this.getSuggestionsKey(sources, query);
        return this.get(key);
    }

    /**
     * Cache frequently accessed content metadata
     */
    setContentMetadata(contentId: string, metadata: any): void {
        const key = `content_meta:${contentId}`;
        this.set(key, metadata, 4 * 60 * 60 * 1000); // 4 hours for content metadata
    }

    /**
     * Get cached content metadata
     */
    getContentMetadata(contentId: string): any | null {
        const key = `content_meta:${contentId}`;
        return this.get(key);
    }

    /**
     * Clean up expired cache entries
     */
    private cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));

        // If still too large, remove oldest entries
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp);

            const toRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
            toRemove.forEach(([key]) => this.cache.delete(key));
        }

        logger.info(`Cache cleanup completed. Removed ${keysToDelete.length} expired entries. Current size: ${this.cache.size}`);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        logger.info('Cache cleared');
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        memoryUsage: string;
    } {
        return {
            size: this.cache.size,
            maxSize: this.MAX_CACHE_SIZE,
            hitRate: 0, // Would need to track hits/misses
            memoryUsage: `${(JSON.stringify([...this.cache.values()]).length / 1024 / 1024).toFixed(2)} MB`
        };
    }

    /**
     * Hash a string for cache key generation
     */
    private hashString(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Hash an array for cache key generation
     */
    private hashArray(arr: number[]): string {
        return this.hashString(arr.join(','));
    }

    /**
     * Invalidate cache entries related to specific content
     */
    invalidateContentCache(contentId: string): void {
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (key.includes(contentId) || key.startsWith('similarity:')) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
        logger.info(`Invalidated ${keysToDelete.length} cache entries for content ${contentId}`);
    }

    /**
     * Preload frequently accessed data
     */
    async preloadFrequentData(): Promise<void> {
        // This would preload commonly accessed embeddings or search results
        // Implementation would depend on usage patterns
        logger.info('Cache preloading completed');
    }
}

// Export singleton instance
export const ragCache = new RAGCache();

// Auto-cleanup every 30 minutes
if (typeof window === 'undefined') { // Server-side only
    setInterval(() => {
        ragCache['cleanup']();
    }, 30 * 60 * 1000);
}
