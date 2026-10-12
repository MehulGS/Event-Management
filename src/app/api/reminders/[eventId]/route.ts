/**
 * DELETE /api/reminders/[eventId]
 *
 * Removes the authenticated user's reminder for the specified event.
 *
 * ## Behaviour
 * - Deletes only the document that matches both `user: authenticatedUserId`
 *   AND `event: eventId`. This ensures users cannot delete another user's
 *   reminder even if they know the event ID.
 * - Does NOT delete or modify the event itself.
 * - Returns 404 if the reminder does not exist for this user.
 * - Returns 404 if `eventId` is not a valid ObjectId format.
 *
 * ## Authorization
 * Requires a valid JWT. User ID is derived from the verified token only.
 *
 * ## CSRF protection
 * DELETE enforces the same-origin Origin header check.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
): Promise<Response> {
  // CSRF check.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  const { eventId } = await params;

  // Validate ObjectId format. Return 404 (not 400) to avoid revealing the
  // ID format — consistent with the public event detail endpoint pattern.
  if (!isValidObjectId(eventId)) {
    return notFound("Reminder not found.");
  }

  try {
    await connectDB();

    // Delete only the reminder that belongs to THIS user for THIS event.
    // The `user` constraint prevents deleting another user's reminder.
    const result = await Reminder.deleteOne({
      user: new mongoose.Types.ObjectId(decoded.userId),
      event: new mongoose.Types.ObjectId(eventId),
    });

    if (result.deletedCount === 0) {
      return notFound("Reminder not found.");
    }

    return ok({ message: "Reminder removed." });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[DELETE /api/reminders/${eventId}] Unexpected error:`,
      safeMessage
    );
    return internalError("An unexpected error occurred.");
  }
}
