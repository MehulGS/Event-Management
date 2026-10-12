/**
 * PATCH /api/admin/events/[id]/status
 *
 * Admin-only endpoint to activate or deactivate a community event.
 * Events are NEVER deleted — deactivation hides them from the public API.
 *
 * ## Authorization
 * Requires a valid JWT whose corresponding database user has `role: "admin"`.
 *
 * ## CSRF protection
 * Origin header check enforced for all mutations.
 *
 * ## Request body
 * ```json
 * { "isActive": false }
 * ```
 * The `isActive` field is required and must be a boolean. Any other type
 * (string, number, null) is rejected with 400.
 *
 * ## Behaviour
 * - Returns 404 for invalid IDs or events that do not exist.
 * - Returns the new `isActive` state with a descriptive message.
 * - Deactivated events remain in the database and are hidden from all public
 *   event endpoints (`GET /api/events`, `GET /api/events/[id]`).
 */

import { z } from "zod";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const statusSchema = z
  .object({
    // Zod v4: use { message } instead of invalid_type_error
    isActive: z.boolean({
      message: "`isActive` must be a boolean (true or false).",
    }),
  })
  .strict();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid MongoDB ObjectId (24-char hex). */
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Step 1: CSRF check.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  // Step 2: Verify authentication.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  const { id } = await params;

  // Step 3: Validate event ID format.
  if (!isValidObjectId(id)) {
    return notFound("Event not found.");
  }

  // Step 4: Parse and validate the request body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = statusSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const { isActive } = result.data;

  try {
    await connectDB();

    // Step 5: Re-read the role from the database.
    const adminUser = await User.findById(decoded.userId).lean();
    if (!adminUser) {
      return unauthorized("User account not found.");
    }
    if (adminUser.role !== "admin") {
      return forbidden("Admin access is required.");
    }

    // Step 6: Update the isActive flag.
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).lean<{
      _id: { toString(): string };
      isActive: boolean;
    }>();

    if (!updatedEvent) {
      return notFound("Event not found.");
    }

    const message = isActive ? "Event activated." : "Event deactivated.";

    return ok({
      message,
      data: {
        id: updatedEvent._id.toString(),
        isActive: updatedEvent.isActive,
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[PATCH /api/admin/events/${id}/status] Unexpected error:`,
      safeMessage
    );
    return internalError("An unexpected error occurred.");
  }
}
