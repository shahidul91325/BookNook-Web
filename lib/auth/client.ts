import { createAuthClient } from "better-auth/react";

/**
 * localStorage key under which the raw Better Auth session token is kept.
 * The API client (`@/lib/api/client`) reads this key to send
 * `Authorization: Bearer <token>` on protected requests.
 *
 * The httpOnly `better-auth.session_token` cookie still carries
 * authentication automatically (`credentials: "include"`); this stored
 * token is the bearer-token alternative supported by Better Auth's
 * `bearer()` plugin (already configured in `@/lib/auth/server`). It is
 * never a password or a server secret.
 */
export const AUTH_TOKEN_STORAGE_KEY = "booknook_token";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
const isAbsolute = Boolean(authUrl && /^https?:\/\//i.test(authUrl));

/**
 * Persists the raw session token exposed by Better Auth's `bearer()`
 * plugin through the `set-auth-token` response header after sign-in /
 * sign-up. Runs only in the browser; the httpOnly session cookie remains
 * the primary credential and is sent on every request automatically.
 */
function persistAuthTokenFromResponse(headers: Headers | null): void {
  if (typeof window === "undefined" || !headers) return;
  try {
    const token = headers.get("set-auth-token");
    if (token && token.trim()) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token.trim());
    }
  } catch {
    // Storage unavailable (e.g. private mode with quota exceeded):
    // authentication still works through the httpOnly session cookie.
  }
}

export const authClient = createAuthClient({
  ...(isAbsolute && authUrl ? { baseURL: authUrl } : {}),
  fetchOptions: {
    onResponse: (context) => {
      persistAuthTokenFromResponse(context.response?.headers);
    },
  },
});
