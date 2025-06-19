export function getBaseUrl(): string {
    if (typeof window !== 'undefined') {
        // Browser environment
        return window.location.origin;
    }

    // Server environment
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // Development fallback
    return `http://localhost:${process.env.PORT || 3000}`;
} 