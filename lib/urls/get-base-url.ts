export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // Browser environment
        return window.location.origin;
    }

    // Server environment - defensive check for process.env
    const env = process.env || {};

    if (env.VERCEL_URL) {
        return `https://${env.VERCEL_URL}`;
    }

    if (env.NEXT_PUBLIC_APP_URL) {
        return env.NEXT_PUBLIC_APP_URL;
    }

    // Development fallback - check if we're in test mode
    const port = env.PORT || (process.env.NODE_ENV === 'test' ? 3001 : 3000);
    return `http://localhost:${port}`;
} 