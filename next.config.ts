import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredAuthServerUrl = process.env.AUTH_SERVER_URL?.trim();
    const authServerUrl = configuredAuthServerUrl
      ? configuredAuthServerUrl.replace(/\/+$/, "")
      : process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api/auth"
        : undefined;

    if (!authServerUrl) {
      throw new Error(
        "AUTH_SERVER_URL is required outside local development; set it to the Express Better Auth URL ending in /api/auth."
      );
    }

    let parsedAuthServerUrl: URL;
    try {
      parsedAuthServerUrl = new URL(authServerUrl);
    } catch {
      throw new Error("AUTH_SERVER_URL must be an absolute http(s) URL.");
    }
    if (
      !["http:", "https:"].includes(parsedAuthServerUrl.protocol) ||
      !parsedAuthServerUrl.pathname.replace(/\/+$/, "").endsWith("/api/auth")
    ) {
      throw new Error("AUTH_SERVER_URL must be an http(s) URL ending in /api/auth.");
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${parsedAuthServerUrl.toString().replace(/\/+$/, "")}/:path*`,
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
