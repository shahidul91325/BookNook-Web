import { createAuthClient } from "better-auth/react";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
const isAbsolute = Boolean(authUrl && /^https?:\/\//i.test(authUrl));

export const authClient = createAuthClient(
  isAbsolute && authUrl ? { baseURL: authUrl } : undefined
);
