/**
 * Centralized API client for BookNook frontend.
 * Communicates with the Express backend service.
 */

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

/** Extract stored session token (localStorage or cookie fallback) */
export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage =
      localStorage.getItem("booknook_token") ||
      localStorage.getItem("better-auth.session_token");
    if (fromStorage) return fromStorage;

    // Check cookies for better-auth.session_token
    const match = document.cookie.match(/(?:^|;\s*)better-auth\.session_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);

    return null;
  } catch {
    return null;
  }
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

  const token = getStoredAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
      credentials: init?.credentials || "include",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("fetch")
        ? "Unable to connect to the BookNook server. Please ensure the backend is running."
        : "Network request failed.";
    throw new ApiError(message, 0);
  }

  const body = await readJsonBody(response);

  if (!response.ok) {
    const errorMessage = extractErrorMessage(
      body,
      `Request failed with status ${response.status}`
    );
    throw new ApiError(errorMessage, response.status);
  }

  return unwrapData<T>(body);
}
