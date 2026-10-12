/**
 * Next.js Edge Middleware — route protection.
 *
 * Protects authenticated-only routes by checking for a valid JWT in the
 * `token` HttpOnly cookie. The middleware runs at the Edge before any
 * server component renders.
 *
 * Security notes:
 * - The JWT is only read from the cookie header string here; the actual
 *   cryptographic verification happens inside getAuthFromRequest() in
 *   server components and route handlers. The middleware performs a
 *   lightweight structural check sufficient to redirect unauthenticated
 *   browsers before wasting a server render.
 * - The middleware NEVER grants access based on the role in the JWT alone.
 *   Per-route role checks are enforced inside each protected route handler
 *   and page by re-reading the role from the database.
 * - Admin pages additionally verify role server-side in their page
 *   components or layouts.
 */

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Routes that require any authenticated session
// ---------------------------------------------------------------------------
const AUTH_REQUIRED_PREFIXES = ["/feed", "/favorites", "/reminders", "/admin"];

// ---------------------------------------------------------------------------
// Lightweight cookie presence check
// ---------------------------------------------------------------------------
/**
 * Returns true if the `token` cookie is present in the request.
 * Does not verify the JWT signature — that is done server-side.
 * This is used only to decide whether to redirect to /login.
 */
function hasAuthCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader.split(";").some((pair) => {
    const key = pair.split("=")[0]?.trim();
    return key === AUTH_COOKIE;
  });
}

// ---------------------------------------------------------------------------
// Middleware function
// ---------------------------------------------------------------------------
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Check whether this path needs authentication.
  const needsAuth = AUTH_REQUIRED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (needsAuth && !hasAuthCookie(request)) {
    // Redirect to /login, preserving the intended destination.
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ---------------------------------------------------------------------------
// Matcher — only run on page routes that need protection
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    "/feed/:path*",
    "/favorites/:path*",
    "/reminders/:path*",
    "/admin/:path*",
  ],
};
