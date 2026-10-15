/**
 * Next.js configuration optimized for Google Cloud Run deployment
 * with Google Cloud Storage (GCS) integration and security headers
 */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@/mdx-components',
  },
});

const baseConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Disable image optimization for Cloud Run performance
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // External packages for server components (moved from experimental)
  serverExternalPackages: ['@google-cloud/storage'],

  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security and cache headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/video/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  generateBuildId: async () => `${Date.now()}`,
};

module.exports = withMDX(baseConfig);
