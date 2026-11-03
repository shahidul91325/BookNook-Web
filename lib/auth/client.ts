import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

/**
 * Token storage keys.
 *
 * Two different credentials are involved:
 *
 * Access/JWT token (`ACCESS_TOKEN_STORAGE_KEY`, "booknook_access_token"):
 *    A real JWT issued by Better Auth's `jwt()` plugin through the
 *    `set-auth-jwt` response header or `GET /api/auth/token` (requires an active
 *    session). This is the token attached to protected Express backend APIs
 *    as `Authorization: Bearer <jwt>`.
 */
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
 * Uses the frontend-origin auth URL so cookies stay visible to proxy.ts.
 */
export function getAuthBaseUrl(): string {
  const customAuthUrl = process.env.NEXT_PUBLIC_AUTH_URL;
  if (customAuthUrl && customAuthUrl.trim()) {
    const configuredUrl = customAuthUrl.trim().replace(/\/+$/, "");
    if (configuredUrl.startsWith("/")) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
        .replace(/\/+$/, "");
      return `${appUrl}${configuredUrl}`;
    }
    return configuredUrl;
  }
  // Auth calls go through a same-origin Next.js rewrite to the Express auth
  // server. This lets the browser retain the server's httpOnly session cookie
  // on the frontend origin, where proxy.ts can perform its optimistic check.
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    .replace(/\/+$/, "");
  return `${appUrl}/api/auth`;
}

const authBaseUrl = getAuthBaseUrl();

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [jwtClient()],
  fetchOptions: {
    credentials: "include",
    onResponse: (context) => {
      const headers = context.response?.headers;
      // Real JWT issued by the remote server's `jwt()` plugin.
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

/** Ask the auth server whether its cookie-backed session is still active. */
export async function hasActiveAuthSession(): Promise<boolean> {
  try {
    const result = await authClient.getSession();
    return Boolean(result.data?.user);
  } catch {
    // A network/CORS failure is not evidence that a valid session expired.
    return true;
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
 * Uses Better Auth's official JWT plugin endpoint (`GET /api/auth/token`)
 * against the Express auth server. `jwtClient` exposes JWKS helpers, while
 * `$fetch` is the typed client's endpoint API for `/token`.
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
      // The JWT plugin's supported client operation is GET /token.
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

