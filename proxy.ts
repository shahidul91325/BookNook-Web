import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Checks whether the incoming path requires authentication.
 */
function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/add-book" ||
    pathname.startsWith("/add-book/") ||
    pathname === "/books/add" ||
    pathname.startsWith("/books/add/") ||
    pathname === "/my-books" ||
    pathname.startsWith("/my-books/") ||
    pathname === "/my-borrows" ||
    pathname.startsWith("/my-borrows/")
  );
}

/**
 * Checks whether an active session exists in request cookies.
 */
function hasSessionCookie(request: NextRequest): boolean {
  try {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) return true;
  } catch {
    // Fall back to direct cookie inspection if getSessionCookie encounters unexpected header shape
  }

  const fallbackCookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth_session_token",
    "token",
    "auth_token",
    "session",
    "user_session",
  ];

  return fallbackCookieNames.some((name) => Boolean(request.cookies.get(name)?.value));
}

/**
 * Next.js 16 Proxy for authentication route protection.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);

  // 1. Redirect authenticated users away from /login and /register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const rawRedirect =
      request.nextUrl.searchParams.get("redirect") ||
      request.nextUrl.searchParams.get("redirectTo");

    const destination =
      rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : "/books";

    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 2. Protect authenticated routes: redirect unauthenticated users to /login
  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/add-book/:path*",
    "/add-book",
    "/books/add/:path*",
    "/books/add",
    "/my-books/:path*",
    "/my-books",
    "/my-borrows/:path*",
    "/my-borrows",
    "/login",
    "/register",
  ],
};
