/**
 * CSRF protection for state-changing authentication endpoints.
 *
 * ## Threat model
 * The application uses SameSite=Strict cookies, which already prevent most
 * cross-site request forgery on modern browsers (Chrome, Firefox, Edge, Safari
 * 12.1+). As a second layer, all state-changing auth endpoints (signup, login,
 * logout) also check the `Origin` or `Referer` header to ensure the request
 * originates from the same site.
 *
 * ## Why both?
 * - SameSite=Strict handles the cookie transport layer.
 * - The Origin check handles edge cases such as same-site subdomain attacks,
 *   form submissions from old browsers that do not respect SameSite, and
 *   any future path that relaxes SameSite to Lax.
 *
 * ## What "same origin" means here
 * We compare the `Origin` header (or the origin derived from `Referer`) against
 * `NEXT_PUBLIC_APP_URL`. If that variable is absent we fall back to allowing
 * `localhost` in development. In production `NODE_ENV=production` and an absent
 * `NEXT_PUBLIC_APP_URL` causes an explicit rejection so the configuration
 * failure is visible.
 *
 * ## Excluded requests
 * Requests without an Origin header (e.g. direct curl calls, Postman with no
 * Origin set, and server-to-server calls) are allowed through when
 * NODE_ENV !== "production". In production, a missing Origin causes rejection.
 * This keeps the development/testing workflow friction-free while being strict
 * in production.
 */

/**
 * Returns `true` if the request passes the same-origin check.
 * Returns `false` if the request should be rejected with 403.
 */
export function isSameOrigin(request: Request): boolean {
  const isProd = process.env.NODE_ENV === "production";

  // Derive the allowed origin from the app URL env variable.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  let allowedOrigin: string | null = null;
  if (appUrl) {
    try {
      const parsed = new URL(appUrl);
      allowedOrigin = parsed.origin; // e.g. "http://localhost:3000"
    } catch {
      // Malformed URL — treat as absent.
    }
  }

  // Read the Origin header first; fall back to the origin derived from Referer.
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");

  let requestOrigin: string | null = originHeader;
  if (!requestOrigin && refererHeader) {
    try {
      requestOrigin = new URL(refererHeader).origin;
    } catch {
      requestOrigin = null;
    }
  }

  // No origin info in the request.
  if (!requestOrigin) {
    if (isProd) {
      // In production, missing Origin is suspicious — reject.
      return false;
    }
    // In development, allow origin-less requests (curl, Postman, test scripts).
    return true;
  }

  // In production, always require an explicit allowed origin.
  if (isProd) {
    if (!allowedOrigin) {
      // NEXT_PUBLIC_APP_URL is not set in production — misconfiguration.
      return false;
    }
    return requestOrigin === allowedOrigin;
  }

  // Development: if the app URL is set, enforce it; otherwise allow localhost.
  if (allowedOrigin) {
    return requestOrigin === allowedOrigin;
  }
  return (
    requestOrigin.startsWith("http://localhost") ||
    requestOrigin.startsWith("http://127.0.0.1")
  );
}
