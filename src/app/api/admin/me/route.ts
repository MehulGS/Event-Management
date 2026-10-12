/**
 * GET /api/admin/me
 *
 * Protected admin identity endpoint — used to verify that authentication and
 * admin authorization are working correctly.
 *
 * Authorization flow:
 * 1. Extract the JWT from the cookie or Authorization header.
 * 2. Return 401 if no valid token is found.
 * 3. Re-read the user's role from the database (not from the token) to guard
 *    against stale tokens that may carry an outdated role.
 * 4. Return 403 if the database role is not "admin".
 * 5. Return safe admin identity details — no credentials or internal data.
 *
 * This endpoint performs no mutations. It exists purely for authorization
 * verification and is kept minimal intentionally.
 */

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ok, unauthorized, forbidden, internalError } from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request: Request): Promise<Response> {
  // Step 1: Verify the JWT.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  try {
    await connectDB();

    // Step 2: Re-read the role from the database.
    // We do NOT trust the role claim in the token for admin checks — a role
    // change in the DB must take effect on the next request.
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return unauthorized("User account not found.");
    }

    // Step 3: Enforce admin role using the trusted database value.
    if (user.role !== "admin") {
      return forbidden("Admin access is required.");
    }

    // Step 4: Return safe admin identity (no passwordHash, no credentials).
    return ok({
      message: "Admin identity verified.",
      admin: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[admin/me] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
