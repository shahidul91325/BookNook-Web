/**
 * Centralized API client for BookNook frontend.
 * Communicates with the Express backend service.
 *
 * Authorization contract:
 *   * Protected requests carry `Authorization: Bearer <jwt>` where `<jwt>` is
 *     the real JWT issued by Better Auth's `jwt()` plugin
 *     (`lib/auth/client.ts`: `ACCESS_TOKEN_STORAGE_KEY`, `set-auth-jwt` header
 *     or `GET /auth/token`).
 *   * The raw Better Auth session token (`booknook_token`) is NEVER used as a
 *     backend JWT: it belongs to the auth server only.
 *   * Authorization decisions are never made from frontend-supplied user IDs or
 *     roles; the backend enforces them from the validated JWT subject.
 */

import {
  ACCESS_TOKEN_STORAGE_KEY,
  clearStoredAuthTokens,
  dispatchAuthRequired,
  getStoredAccessToken,
  hasActiveAuthSession,
  refreshAccessToken,
} from "@/lib/auth/client";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Get base API URL from environment variable or fallback */
export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5000";
  return url.replace(/\/+$/, "");
}

/** Clears every locally stored auth token (used on logout and 401). */
export { clearStoredAuthTokens };

/** Re-export the access-token storage key for consumers that need it. */
export { ACCESS_TOKEN_STORAGE_KEY };

/** Extract stored JWT (access token) from localStorage. */
export function getStoredAuthToken(): string | null {
  return getStoredAccessToken();
}

/** Defensively read response JSON */
export async function readJsonBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Normalizes MongoDB `_id` to standard `id` field */
export function normalizeEntity<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeEntity(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record._id != null && record.id == null) {
      return { ...record, id: String(record._id) } as T;
    }
  }
  return value;
}

/** Unwrap response data envelope if present: `{ data: ... }`, `{ books: ... }`, or bare payload */
export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if ("data" in record && record.data !== undefined) {
      return normalizeEntity(record.data as T);
    }
    if ("books" in record && record.books !== undefined) {
      return normalizeEntity(record.books as T);
    }
    if ("result" in record && record.result !== undefined) {
      return normalizeEntity(record.result as T);
    }
  }
  return normalizeEntity(body as T);
}

/** Best-effort error message extractor */
function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["message", "error", "title"]) {
      const val = record[key];
      if (typeof val === "string" && val.trim()) return val;
    }
  }
  return fallback;
}

/** Generic typed fetch request handler */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach the Better Auth JWT as a Bearer token.
  // If there's an active session but no stored token yet (e.g. initial page load
  // or after a refresh), try refreshing/retrieving the token first.
  let token = getStoredAuthToken();
  if (!token && typeof window !== "undefined") {
    token = await refreshAccessToken();
  }

  const isBearerRequest = Boolean(token);
  if (isBearerRequest && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  let body: unknown = null;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      credentials: init?.credentials || "include",
    });
    body = await readJsonBody(response);
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("fetch")
        ? "Unable to connect to the BookNook server. Please ensure the backend is running."
        : "Network request failed.";
    throw new ApiError(message, 0);
  }

  if (!response.ok) {
    // A rejected or stale JWT is no longer trusted. Clear it and try to
    // obtain a fresh JWT from Better Auth's `jwt()` plugin while the httpOnly
    // session is still valid, then retry the request exactly once.
    if (response.status === 401) {
      if (isBearerRequest) clearStoredAuthTokens();
      const refreshedToken = isBearerRequest
        ? await refreshAccessToken()
        : token;
      if (refreshedToken && isBearerRequest) {
        const retryHeaders = new Headers(init?.headers);
        if (init?.body && !retryHeaders.has("Content-Type")) {
          retryHeaders.set("Content-Type", "application/json");
        }
        retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);
        try {
          response = await fetch(url, {
            ...init,
            headers: retryHeaders,
            credentials: "include",
          });
          body = await readJsonBody(response);
          if (response.ok) return unwrapData<T>(body);
        } catch {
          // Fall through to error handling with the last observed response.
        }
      }
      // Only redirect when the auth server confirms there is no active
      // cookie-backed session. A JWT/API configuration error alone must not
      // sign the user out of an otherwise valid Better Auth session.
      if (!(await hasActiveAuthSession())) dispatchAuthRequired(401);
    }

    // 403 means the session is valid but the action is not permitted; surface
    // it to the caller without clearing tokens or redirecting.
    const errorMessage = extractErrorMessage(
      body,
      `Request failed with status ${response.status}`
    );
    throw new ApiError(errorMessage, response.status);
  }

  return unwrapData<T>(body);
}
