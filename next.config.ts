import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow server-only packages in API routes
  serverExternalPackages: ['@prisma/client', 'simple-git'],

  // Exclude server-only modules from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: false,
      };
    }
    return config;
  },

  // Opt-out of webpack to turbopack translation error
  turbopack: {},

  output: 'standalone',
};

export default nextConfig;
