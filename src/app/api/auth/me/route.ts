/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's safe profile.
 *
 * Security notes:
 * - Requires a valid JWT in the `token` cookie or `Authorization: Bearer` header.
 * - Returns 401 for missing, expired, or invalid tokens.
 * - The `passwordHash` field is never returned (excluded by toJSON transform).
 * - The role is read from the database, not from the token, to ensure freshness.
 */

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ok, unauthorized, internalError } from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";

export async function GET(request: Request): Promise<Response> {
  // Extract and verify the JWT from cookie or Authorization header.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  try {
    await connectDB();

    // Re-read the user from the database to get the latest role and profile.
    // The passwordHash is excluded by the toJSON transform on the User model.
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return unauthorized("User account not found.");
    }

    return ok({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        favouriteCategories: user.favouriteCategories,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[me] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
