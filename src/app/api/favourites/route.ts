/**
 * GET /api/favourites
 * PUT /api/favourites
 *
 * Authenticated user's favourite category preferences.
 *
 * ## GET
 * Returns the stored favourite category array from the user document.
 * No CSRF check required (read-only operation).
 *
 * ## PUT
 * Replaces the entire favourite category list with the submitted array.
 * An empty array is valid and will produce an empty My Feed.
 *
 * ## Authorization
 * Both methods require a valid JWT (HttpOnly cookie or Bearer header).
 * The user ID is derived from the verified token — never from the request body.
 *
 * ## CSRF protection
 * PUT enforces the same-origin Origin header check consistent with all other
 * state-changing endpoints.
 *
 * ## Mass-assignment prevention
 * Only `favouriteCategories` may be changed through this endpoint. No other
 * user fields (email, passwordHash, role) are touched or accepted.
 */

import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { EVENT_CATEGORIES } from "@/types";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Accepts an array of category strings.
 * - Each item must be one of the five defined category values.
 * - Duplicates are silently removed (normalised to a unique set).
 * - An empty array is valid.
 */
const putFavouritesSchema = z.object({
  favouriteCategories: z
    .array(
      z.enum([...EVENT_CATEGORIES] as [string, ...string[]], {
        message: `Each category must be one of: ${EVENT_CATEGORIES.join(", ")}.`,
      })
    )
    .transform((arr) => [...new Set(arr)]), // deduplicate while preserving order
});

// ---------------------------------------------------------------------------
// GET /api/favourites
// ---------------------------------------------------------------------------

export async function GET(request: Request): Promise<Response> {
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  try {
    await connectDB();

    const user = await User.findById(decoded.userId)
      .select("favouriteCategories")
      .lean();

    if (!user) {
      return unauthorized("User account not found.");
    }

    return ok({
      data: {
        favouriteCategories: user.favouriteCategories ?? [],
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/favourites] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}

// ---------------------------------------------------------------------------
// PUT /api/favourites
// ---------------------------------------------------------------------------

export async function PUT(request: Request): Promise<Response> {
  // CSRF check for state-changing mutation.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  // Parse and validate body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = putFavouritesSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const { favouriteCategories } = result.data;

  try {
    await connectDB();

    // Update only the favouriteCategories field. Using $set ensures no other
    // field on the document can be modified through this endpoint.
    const updated = await User.findByIdAndUpdate(
      decoded.userId,
      { $set: { favouriteCategories } },
      { new: true, runValidators: true }
    )
      .select("favouriteCategories")
      .lean();

    if (!updated) {
      return unauthorized("User account not found.");
    }

    return ok({
      message: "Favourites updated.",
      data: {
        favouriteCategories: updated.favouriteCategories ?? [],
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[PUT /api/favourites] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
