import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/resources/**',
      },
      {
        protocol: 'https',
        hostname: 'quickspit.onrender.com',
        pathname: '/resources/**',
      },
    ],
    domains: ['quickspit.onrender.com'],
  },
};

export default nextConfig;
