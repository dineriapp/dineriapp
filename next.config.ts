import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: 'images.unsplash.com',
      },
      {
        hostname: 'media.licdn.com',
      },
    ],

  },
  // webpack: (config) => {
  //   // Suppress the "Critical dependency: the request of a dependency is an expression" warning
  //   config.module.exprContextCritical = false;
  //   return config;
  // },
};

export default nextConfig;
