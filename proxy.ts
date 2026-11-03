import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Checks whether the incoming path requires authentication.
 * Protects:
 * - /add-book
 * - /books/add
 * - /my-books
 * - /my-borrows
 * - /profile
 */
function isProtectedPath(pathname: string): boolean {
  if (
    pathname === "/add-book" ||
    pathname.startsWith("/add-book/") ||
    pathname === "/books/add" ||
    pathname.startsWith("/books/add/") ||
    pathname === "/my-books" ||
    pathname.startsWith("/my-books/") ||
    pathname === "/my-borrows" ||
    pathname.startsWith("/my-borrows/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/")
  ) {
    return true;
  }

  return false;
}

/**
 * Performs an optimistic cookie-presence check. The Express Better Auth
 * server validates the actual session, and protected API calls validate JWTs.
 */
function hasSessionCookie(request: NextRequest): boolean {
  try {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie && typeof sessionCookie === "string" && sessionCookie.trim()) {
      return true;
    }
  } catch {
    // Fall back to direct cookie inspection if getSessionCookie encounters an unexpected header shape
  }

  const sessionCookieNames = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth_session_token",
  ];

  return sessionCookieNames.some((name) => {
    const val = request.cookies.get(name)?.value;
    return Boolean(val && val.trim() && val !== "undefined" && val !== "null");
  });
}

/**
 * Next.js 16 Proxy for authentication route protection.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);

  // Redirect when no session cookie is present, preserving the destination.
  if (!isAuthenticated && isProtectedPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent authenticated users from visiting login or register
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const targetUrl =
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//") &&
      redirectParam !== "/login" &&
      redirectParam !== "/register"
        ? redirectParam
        : "/";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/add-book/:path*",
    "/add-book",
    "/books/add/:path*",
    "/books/add",
    "/books/:path*",
    "/my-books/:path*",
    "/my-books",
    "/my-borrows/:path*",
    "/my-borrows",
    "/profile/:path*",
    "/profile",
    "/login",
    "/register",
  ],
};

