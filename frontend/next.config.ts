import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://95.163.152.102:3000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://95.163.152.102:3000/:path*',
      },
    ];
  },
  images: {
    domains: ['95.163.152.102'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '95.163.152.102',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; connect-src 'self' http://95.163.152.102:3000 ws:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' http://95.163.152.102:3000 data:; font-src 'self' data:; frame-src 'self';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
