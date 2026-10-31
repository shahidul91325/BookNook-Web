import { createAuthClient } from "better-auth/react";

const authUrl =
  process.env.NEXT_PUBLIC_AUTH_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")}/api/auth`
    : "http://localhost:5000/api/auth");

const isAbsolute = /^https?:\/\//i.test(authUrl);

export const authClient = createAuthClient(
  isAbsolute ? { baseURL: authUrl } : { basePath: authUrl }
);
