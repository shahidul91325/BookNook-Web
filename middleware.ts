import type { NextRequest } from "next/server";
import { proxy, config } from "./proxy";

/**
 * Next.js middleware for route protection.
 *
 * Delegates to `proxy` in `./proxy`, which validates the httpOnly Better Auth
 * session cookie and redirects unauthenticated users away from private pages
 * (/add-book, /my-books, /my-borrows, /books/:id) to /login with a return
 * destination. Session state stays synchronized client-side via `useAuth()`.
 */

export { config };

export function middleware(request: NextRequest) {
  return proxy(request);
}
