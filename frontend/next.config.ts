import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const backendHost = new URL(backendUrl).hostname;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  images: {
    remotePatterns: [
      {
        protocol: backendUrl.startsWith('https') ? 'https' : 'http',
        hostname: backendHost,
        pathname: '/resources/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
