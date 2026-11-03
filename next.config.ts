import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!configuredApiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is required and must point to the Express API origin.");
    }

    let apiOrigin: string;
    try {
      const parsedApiUrl = new URL(configuredApiUrl);
      if (
        !["http:", "https:"].includes(parsedApiUrl.protocol) ||
        parsedApiUrl.pathname !== "/" ||
        parsedApiUrl.search ||
        parsedApiUrl.hash
      ) {
        throw new Error();
      }
      apiOrigin = parsedApiUrl.origin;
    } catch {
      throw new Error("NEXT_PUBLIC_API_URL must be an http(s) origin without a path, query, or fragment.");
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiOrigin}/api/auth/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
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
