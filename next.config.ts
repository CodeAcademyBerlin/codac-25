import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "owndjvzdolurxqxuwumh.supabase.co",
      },
    ],
  },
  // Configure server actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Headers configuration to handle large cookies/headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Development server configuration
  ...(process.env.NODE_ENV === 'development' && {
    // These don't directly control header size but provide better error handling
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
};

export default nextConfig;
