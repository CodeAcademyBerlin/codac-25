import { logger } from '@/lib/logger';

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    keyGenerator?: (identifier: string) => string; // Custom key generator
    skipSuccessfulRequests?: boolean; // Don't count successful requests
    skipFailedRequests?: boolean; // Don't count failed requests
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
    requests: Array<{
        timestamp: number;
        success: boolean;
    }>;
}

/**
 * In-memory rate limiter for RAG API endpoints
 * In production, consider using Redis for distributed rate limiting
 */
export class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = {
            keyGenerator: (id) => id,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            ...config
        };

        // Cleanup expired entries every 5 minutes
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Check if request is allowed and update counters
     */
    async checkLimit(
        identifier: string,
        success?: boolean
    ): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: number;
        totalRequests: number;
    }> {
        const key = this.config.keyGenerator!(identifier);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        let entry = this.store.get(key);

        if (!entry || entry.resetTime <= now) {
            // Create new window
            entry = {
                count: 0,
                resetTime: now + this.config.windowMs,
                requests: []
            };
            this.store.set(key, entry);
        }

        // Clean old requests from the current window
        entry.requests = entry.requests.filter(req => req.timestamp > windowStart);
        entry.count = entry.requests.length;

        // Check if we should count this request
        const shouldCount = this.shouldCountRequest(success);

        if (shouldCount) {
            if (entry.count >= this.config.maxRequests) {
                logger.warn(`Rate limit exceeded for ${identifier}. Count: ${entry.count}, Limit: ${this.config.maxRequests}`);

                return {
                    allowed: false,
                    remaining: 0,
                    resetTime: entry.resetTime,
                    totalRequests: entry.count
                };
            }

            // Add this request to the window
            entry.requests.push({
                timestamp: now,
                success: success ?? true
            });
            entry.count++;
        }

        return {
            allowed: true,
            remaining: Math.max(0, this.config.maxRequests - entry.count),
            resetTime: entry.resetTime,
            totalRequests: entry.count
        };
    }

    /**
     * Get current limit status without incrementing
     */
    async getStatus(identifier: string): Promise<{
        remaining: number;
        resetTime: number;
        totalRequests: number;
    }> {
        const key = this.config.keyGenerator!(identifier);
        const entry = this.store.get(key);

        if (!entry || entry.resetTime <= Date.now()) {
            return {
                remaining: this.config.maxRequests,
                resetTime: Date.now() + this.config.windowMs,
                totalRequests: 0
            };
        }

        return {
            remaining: Math.max(0, this.config.maxRequests - entry.count),
            resetTime: entry.resetTime,
            totalRequests: entry.count
        };
    }

    /**
     * Reset limits for a specific identifier
     */
    async reset(identifier: string): Promise<void> {
        const key = this.config.keyGenerator!(identifier);
        this.store.delete(key);
        logger.info(`Rate limit reset for ${identifier}`);
    }

    /**
     * Get rate limiting statistics
     */
    getStats(): {
        totalKeys: number;
        activeWindows: number;
        topUsers: Array<{
            identifier: string;
            requests: number;
            resetTime: number;
        }>;
    } {
        const now = Date.now();
        const activeEntries = Array.from(this.store.entries())
            .filter(([_, entry]) => entry.resetTime > now);

        const topUsers = activeEntries
            .map(([key, entry]) => ({
                identifier: key,
                requests: entry.count,
                resetTime: entry.resetTime
            }))
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 10);

        return {
            totalKeys: this.store.size,
            activeWindows: activeEntries.length,
            topUsers
        };
    }

    /**
     * Clean up expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime <= now) {
                this.store.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            logger.info(`Rate limiter cleanup: removed ${cleaned} expired entries`);
        }
    }

    /**
     * Determine if this request should be counted based on config
     */
    private shouldCountRequest(success?: boolean): boolean {
        if (success === undefined) return true;

        if (success && this.config.skipSuccessfulRequests) return false;
        if (!success && this.config.skipFailedRequests) return false;

        return true;
    }
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
    // General API rate limiting
    api: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 requests per 15 minutes
    }),

    // RAG query rate limiting
    ragQuery: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 queries per minute
    }),

    // Embedding generation rate limiting
    embedding: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20, // 20 embedding requests per minute
    }),

    // Content indexing rate limiting (admin operations)
    indexing: new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5, // 5 indexing operations per hour
    }),

    // Session creation rate limiting
    sessionCreation: new RateLimiter({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5, // 5 new sessions per minute
    })
};

/**
 * Middleware helper for Next.js API routes
 */
export async function withRateLimit<T>(
    limiter: RateLimiter,
    identifier: string,
    handler: () => Promise<T>
): Promise<T> {
    const result = await limiter.checkLimit(identifier);

    if (!result.allowed) {
        const error = new Error('Rate limit exceeded');
        (error as any).statusCode = 429;
        (error as any).headers = {
            'X-RateLimit-Limit': limiter['config'].maxRequests,
            'X-RateLimit-Remaining': result.remaining,
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000)
        };
        throw error;
    }

    try {
        const response = await handler();
        await limiter.checkLimit(identifier, true); // Mark as successful
        return response;
    } catch (error) {
        await limiter.checkLimit(identifier, false); // Mark as failed
        throw error;
    }
}

/**
 * Get rate limit headers for API responses
 */
export function getRateLimitHeaders(
    limiter: RateLimiter,
    identifier: string
): Promise<Record<string, string>> {
    return limiter.getStatus(identifier).then(status => ({
        'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
        'X-RateLimit-Remaining': status.remaining.toString(),
        'X-RateLimit-Reset': new Date(status.resetTime).toISOString()
    }));
}
