import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const authServerUrl = process.env.AUTH_SERVER_URL?.trim().replace(/\/+$/, "");
    if (!authServerUrl) return [];

    return [
      {
        source: "/api/auth/:path*",
        destination: `${authServerUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // The environment has an ancestor package-lock outside this repository.
    // Keep Turbopack's project root at this app so resolution and tracing do
    // not walk or select configuration from the user's home directory.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
