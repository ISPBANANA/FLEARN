import type { NextConfig } from "next";
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from root folder
config({ path: path.resolve(__dirname, '../.env') });

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbo: {
      root: path.resolve(__dirname),
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
  // Set up rewrites to proxy API requests to the backend server
  async rewrites() {
    return [
      // Proxy health checks to backend
      {
        source: '/health',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://flearn-backend:8099/health'
          : 'http://localhost:8099/health',
      },
      // Proxy all API routes except auth routes to backend
      {
        source: '/api/users/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://flearn-backend:8099/api/users/:path*'
          : 'http://localhost:8099/api/users/:path*',
      },
      {
        source: '/api/gardens/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://flearn-backend:8099/api/gardens/:path*'
          : 'http://localhost:8099/api/gardens/:path*',
      },
      {
        source: '/api/friends/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://flearn-backend:8099/api/friends/:path*'
          : 'http://localhost:8099/api/friends/:path*',
      },
      // Keep auth routes local - they will be handled by frontend API routes
    ];
  },
};

// Debug logging
console.log("Next.js Config - Environment Variables:", {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

export default nextConfig;
