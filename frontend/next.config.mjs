// @ts-check
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), './src'),
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
  // Используем секцию асинхронных headers для добавления CSP-заголовков
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              img-src 'self' http://95.163.152.102:3000 data: blob:;
              connect-src 'self' http://95.163.152.102:3000 ws: wss:;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              font-src 'self' data:;
              frame-src 'self';
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;