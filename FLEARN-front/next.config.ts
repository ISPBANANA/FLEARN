import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://flearn-backend:8099/api/:path*'
          : 'http://localhost:8099/api/:path*',
      },
    ];
  },
};

export default nextConfig;
