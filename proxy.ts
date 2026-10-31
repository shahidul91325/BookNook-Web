import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Checks whether the incoming path requires authentication.
 * Protects /add-book, /my-books, /my-borrows, and Book Details (/books/:id).
 */
function isProtectedPath(pathname: string): boolean {
  // Add Book, My Books, and My Borrows
  if (
    pathname === "/add-book" ||
    pathname.startsWith("/add-book/") ||
    pathname === "/books/add" ||
    pathname.startsWith("/books/add/") ||
    pathname === "/my-books" ||
    pathname.startsWith("/my-books/") ||
    pathname === "/my-borrows" ||
    pathname.startsWith("/my-borrows/")
  ) {
    return true;
  }

  // Book Details: /books/:id (excluding public /books catalog)
  if (
    pathname.startsWith("/books/") &&
    pathname !== "/books/" &&
    pathname !== "/books/add"
  ) {
    return true;
  }

  return false;
}

/**
 * Checks whether an active Better Auth session exists in request cookies.
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

  // Protect restricted routes: redirect unauthenticated users to /login with return destination
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
    "/books/:path*",
    "/my-books/:path*",
    "/my-books",
    "/my-borrows/:path*",
    "/my-borrows",
  ],
};
