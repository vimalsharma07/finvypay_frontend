/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Conditionally load bundle analyzer
let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === 'true') {
  try {
    withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
  } catch (error) {
    console.warn('Bundle analyzer not installed. Run: npm install --save-dev @next/bundle-analyzer');
  }
}

const nextConfig = {
  output: 'standalone',
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Wildcard patterns to support any S3 bucket (dynamic)
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
        pathname: '/**',
      },
      // Support for custom S3-compatible endpoints (DigitalOcean Spaces, etc.)
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
        pathname: '/**',
      },
      // Support for custom storage endpoints (configured via STORAGE_ENDPOINT)
      // Note: For specific endpoints, add them here or use environment-based config
    ],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is enabled by default in Next.js 16, no need to specify
  
  // Remove console in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@remixicon/react',
      'lucide-react',
      'date-fns',
      'apexcharts',
      'react-apexcharts',
    ],
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
