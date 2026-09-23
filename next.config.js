/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep firebase-admin (and its jose/jwks-rsa dependency chain) as native Node
  // requires instead of being bundled by webpack, which breaks on jose's ESM-only build.
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Long-cache static assets that never change without a new deploy.
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Animations and icons can be cached for a day and revalidated.
        source: '/:path*\\.(json|svg|png|jpg|jpeg|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
