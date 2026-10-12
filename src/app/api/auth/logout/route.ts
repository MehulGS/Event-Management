/**
 * POST /api/auth/logout
 *
 * Clears the authentication cookie so the browser no longer sends the JWT.
 *
 * Security notes:
 * - The cookie is cleared with Max-Age=0 using matching Path and SameSite
 *   attributes so browsers reliably remove it.
 * - No JWT validation is required; logout should always succeed even if the
 *   token has already expired or is invalid.
 * - An Origin check guards against CSRF on this state-changing endpoint.
 * - JWTs are stateless — there is no server-side session to invalidate.
 *   If token revocation before expiry is needed in the future, a deny-list
 *   stored in Redis or MongoDB would be required.
 */

import { ok, forbidden } from "@/lib/api-response";
import { buildClearAuthCookie } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

export async function POST(request: Request): Promise<Response> {
  // CSRF: same-origin check for state-changing endpoint.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  const clearCookie = buildClearAuthCookie();

  const responseBody = ok({ message: "Logged out successfully." });

  return new Response(responseBody.body, {
    status: responseBody.status,
    headers: {
      ...Object.fromEntries(responseBody.headers.entries()),
      "Set-Cookie": clearCookie,
    },
  });
}
