import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Token storage keys.
 *
 * Two different credentials are involved:
 *
 * 1. Session token (`SESSION_TOKEN_STORAGE_KEY`, "booknook_token"):
 *    The raw Better Auth session token exposed by the `bearer()` plugin
 *    through the `set-auth-token` response header. It is the bearer-token
 *    alternative for the AUTH server (`/api/auth`) and is also kept
 *    httpOnly in the `better-auth.session_token` cookie. It is NOT a JWT and
 *    must NEVER be sent to the Express backend as `Authorization: Bearer`.
 *
 * 2. Access/JWT token (`ACCESS_TOKEN_STORAGE_KEY`, "booknook_access_token"):
 *    A real HS256 JWT issued by Better Auth's `jwt()` plugin through the
 *    `set-auth-jwt` response header or `GET /api/auth/token` (requires an active
 *    session). This is the token attached to protected Express backend APIs
 *    as `Authorization: Bearer <jwt>`.
 */
export const SESSION_TOKEN_STORAGE_KEY = "booknook_token";
export const ACCESS_TOKEN_STORAGE_KEY = "booknook_access_token";

/** Legacy localStorage keys that may hold stale session tokens. */
export const LEGACY_TOKEN_STORAGE_KEYS: readonly string[] = [
  "better-auth.session_token",
  "better-auth_session_token",
  "token",
  "auth_token",
];

/** Every locally stored auth token key, cleared together on logout / 401. */
export const ALL_TOKEN_STORAGE_KEYS: readonly string[] = [
  SESSION_TOKEN_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  ...LEGACY_TOKEN_STORAGE_KEYS,
];

/**
 * Event dispatched by the API client when a protected request can no longer
 * be authenticated (stale/missing JWT and no refreshable session). Pages pick
 * this up via `useAuth()` and redirect to the sign-in page.
 */
export const BOOKNOOK_AUTH_REQUIRED = "booknook-auth-required";

/** Dispatches `BOOKNOOK_AUTH_REQUIRED` on `window` (client-only, best effort). */
export function dispatchAuthRequired(status: number): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent(BOOKNOOK_AUTH_REQUIRED, {
        detail: { status },
        cancelable: true,
      })
    );
  } catch {
    // Listeners may not exist yet; nothing to do.
  }
}

/** Persist a single token header value to localStorage (client-only). */
function persistTokenFromResponse(
  storageKey: string,
  headers: Headers | null,
  headerName: string
): void {
  if (typeof window === "undefined" || !headers) return;
  try {
    const token = headers.get(headerName);
    if (token && token.trim()) {
      localStorage.setItem(storageKey, token.trim());
    }
  } catch {
    // Storage unavailable (e.g. private mode with quota exceeded)
  }
}

/**
 * Base URL for the remote authentication server.
 * Uses NEXT_PUBLIC_AUTH_URL if set, or NEXT_PUBLIC_API_URL + "/api/auth".
 */
export function getAuthBaseUrl(): string {
  const customAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  if (customAuthUrl && customAuthUrl.trim()) {
    return customAuthUrl.trim().replace(/\/+$/, "");
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5000";

  return `${apiUrl.replace(/\/+$/, "")}/api/auth`;
}

const authBaseUrl = getAuthBaseUrl();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onResponse: (context) => {
      const headers = context.response?.headers;
      // Session token for the auth server (never a backend JWT).
      persistTokenFromResponse(SESSION_TOKEN_STORAGE_KEY, headers, "set-auth-token");
      // Real JWT issued by the `jwt()` plugin — used as `Bearer` for backend APIs.
      persistTokenFromResponse(ACCESS_TOKEN_STORAGE_KEY, headers, "set-auth-jwt");
    },
  },
});

/** Read the current JWT/access token from localStorage. */
export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (value && value.trim() && value !== "undefined" && value !== "null") {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

/** Clear every locally stored auth token (used on logout and 401). */
export function clearStoredAuthTokens(): void {
  if (typeof window === "undefined") return;
  for (const key of ALL_TOKEN_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable — nothing to clear.
    }
  }
}

/**
 * Concurrency guard: deduplicate simultaneous in-flight token refresh promises
 * to avoid parallel redundant requests.
 */
let inFlightTokenPromise: Promise<string | null> | null = null;

/**
 * Obtain a fresh JWT from Better Auth's `jwt()` plugin.
 *
 * Uses the official `authClient.token()` API provided by the `jwtClient` plugin
 * against the Express Better Auth server (`/api/auth/token`).
 *
 * Requires an active session; the session cookie is sent automatically
 * (`credentials: "include"`).
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = (async () => {
    try {
      // 1. Primary method: official Better Auth token() client API
      const dynamicClient = authClient as unknown as {
        token?: () => Promise<{ data?: { token?: string }; error?: unknown } | undefined>;
        getToken?: () => Promise<{ data?: { token?: string }; error?: unknown } | undefined>;
      };

      if (typeof dynamicClient.token === "function") {
        try {
          const res = await dynamicClient.token();
          if (
            res &&
            "data" in res &&
            res.data &&
            typeof res.data.token === "string" &&
            res.data.token.trim()
          ) {
            const token = res.data.token.trim();
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
            return token;
          }
        } catch {
          // Fall through to secondary check
        }
      }

      // 2. Secondary method: getToken() if provided
      if (typeof dynamicClient.getToken === "function") {
        try {
          const res = await dynamicClient.getToken();
          if (
            res &&
            "data" in res &&
            res.data &&
            typeof res.data.token === "string" &&
            res.data.token.trim()
          ) {
            const token = res.data.token.trim();
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
            return token;
          }
        } catch {
          // Fall through to direct $fetch
        }
      }

      // 3. Fallback: direct GET /token against the Express Better Auth server
      const res = await authClient.$fetch<{ token: string }>("/token", {
        method: "GET",
      });
      if (!res.error && res.data?.token && res.data.token.trim()) {
        const token = res.data.token.trim();
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
        return token;
      }
      return null;
    } catch {
      return null;
    } finally {
      inFlightTokenPromise = null;
    }
  })();

  return inFlightTokenPromise;
}

