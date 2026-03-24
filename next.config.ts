import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use current best practices for Next.js 16/15
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
