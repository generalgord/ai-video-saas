import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['droitural-pendantly-cherelle.ngrok-free.dev'],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Tüm HTTPS sitelerine izin ver
      },
    ],
  },
};

export default nextConfig;
