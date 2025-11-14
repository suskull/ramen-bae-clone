import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Configure image formats with WebP as default
    formats: ['image/webp'],
    
    // Configure quality levels used in the application
    unoptimized: false,
    
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // Define quality levels used throughout the app
    // 75: Thumbnails and small images
    // 85: Product cards
    // 90: Product detail images
    // 95: Hero images
    qualities: [75, 85, 90, 95],
    
    // Remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    
    // Minimize layout shift with proper sizing
    minimumCacheTTL: 60,
    
    // Disable static imports for better control
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
