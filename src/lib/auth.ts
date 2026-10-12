/**
 * Server-only authentication utilities.
 *
 * Provides JWT sign/verify helpers and HTTP-only cookie management for the
 * browser-based application. Never import this module from client components.
 *
 * ## Cookie strategy
 * JWTs are delivered and stored in an HTTP-only, SameSite=Strict cookie so
 * that JavaScript on the page cannot read or exfiltrate the token.
 *
 * ## Mobile / API client note
 * The HTTP-only cookie strategy is correct for browser clients. If a future
 * native mobile client needs to authenticate, it must use a separate token
 * endpoint that returns the JWT in the response body (not a cookie), and the
 * mobile client is responsible for secure storage (e.g. iOS Keychain / Android
 * Keystore). Do NOT weaken the browser cookie strategy to accommodate mobile
 * clients; instead implement a parallel grant that is guarded by the same JWT
 * secret.
 */

import jwt from "jsonwebtoken";
import { getEnv } from "@/lib/env";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Name of the HTTP-only cookie that carries the JWT. */
export const AUTH_COOKIE = "token";

/** bcrypt salt rounds — consistent with ARCHITECTURE.md. */
export const BCRYPT_SALT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Token payload
// ---------------------------------------------------------------------------

/**
 * Minimum claims stored inside the JWT.
 * The role is included so per-route guards can avoid an extra DB round-trip
 * for basic role checks. However, admin-sensitive endpoints MUST re-read the
 * role from the database to guard against stale tokens.
 */
export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Full decoded token — TokenPayload + standard JWT registered claims added
 * by `jsonwebtoken`.
 */
export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

/**
 * Signs a new JWT for the given payload.
 *
 * @throws if JWT_SECRET is not set or if signing fails.
 */
export function signToken(payload: TokenPayload): string {
  const secret = getEnv("JWT_SECRET");
  // JWT_EXPIRES_IN is optional; fall back to "7d".
  const expiresIn = (process.env.JWT_EXPIRES_IN as string) || "7d";

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes a JWT string.
 *
 * Returns `null` for any invalid or expired token — callers should treat null
 * as "unauthenticated" and return 401. The raw error is intentionally swallowed
 * to avoid leaking internal details; it is logged server-side only.
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    const secret = getEnv("JWT_SECRET");
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (typeof decoded === "string") {
      // Unexpected string payload
      return null;
    }

    const { userId, role, iat, exp } = decoded as DecodedToken;

    // Validate minimum required claims are present and have correct types.
    if (
      typeof userId !== "string" ||
      !userId ||
      typeof role !== "string" ||
      !role ||
      typeof iat !== "number" ||
      typeof exp !== "number"
    ) {
      return null;
    }

    return { userId, role, iat, exp };
  } catch {
    // JsonWebTokenError, TokenExpiredError, NotBeforeError — all treated as
    // unauthenticated. Never log the raw token or secret value.
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/**
 * Builds the `Set-Cookie` header value for the auth token cookie.
 *
 * Security attributes:
 * - HttpOnly  — inaccessible from JavaScript (XSS mitigation)
 * - SameSite=Strict — cookie is not sent on cross-site requests (CSRF mitigation)
 * - Secure    — only sent over HTTPS (enforced in production; omitted in dev)
 * - Path=/    — cookie is sent on every request to the application
 *
 * @param token  The signed JWT string.
 * @param maxAge Cookie lifetime in seconds (mirrors the JWT expiry).
 */
export function buildAuthCookie(token: string, maxAge: number): string {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${AUTH_COOKIE}=${token}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
  ];
  if (isProd) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/**
 * Builds the `Set-Cookie` header value that clears the auth cookie.
 * Must use the same Path and SameSite attributes as the original Set-Cookie.
 */
export function buildClearAuthCookie(): string {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${AUTH_COOKIE}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
  ];
  if (isProd) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

/**
 * Returns the cookie lifetime in seconds that matches the JWT expiry.
 * Parses the common shorthand formats (e.g. "7d", "24h").
 * Falls back to 7 days if the variable is missing or cannot be parsed.
 */
export function getCookieMaxAge(): number {
  const raw = process.env.JWT_EXPIRES_IN ?? "7d";
  const match = raw.match(/^(\d+)(d|h|m|s)?$/);
  if (!match) return 7 * 24 * 60 * 60;

  const value = parseInt(match[1], 10);
  const unit = match[2] ?? "s";
  const multipliers: Record<string, number> = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
  };
  return value * (multipliers[unit] ?? 1);
}

// ---------------------------------------------------------------------------
// Request auth extractor
// ---------------------------------------------------------------------------

/**
 * Extracts and verifies the JWT from an incoming request.
 * Checks the `token` cookie first; falls back to the `Authorization: Bearer`
 * header for API-client compatibility.
 *
 * Returns `null` if no valid token is found.
 */
export function getAuthFromRequest(request: Request): DecodedToken | null {
  // 1. Try the HTTP-only cookie (preferred for browser clients)
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieToken = parseCookieValue(cookieHeader, AUTH_COOKIE);
  if (cookieToken) {
    const decoded = verifyToken(cookieToken);
    if (decoded) return decoded;
  }

  // 2. Fall back to Authorization: Bearer <token>
  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    if (bearerToken) {
      return verifyToken(bearerToken);
    }
  }

  return null;
}

/**
 * Parses a single named cookie value from a `Cookie` header string.
 * Returns `null` if the named cookie is not present.
 */
function parseCookieValue(cookieHeader: string, name: string): string | null {
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rest] = pair.split("=");
    const key = rawKey?.trim();
    if (key === name) {
      return rest.join("=").trim() || null;
    }
  }
  return null;
}
