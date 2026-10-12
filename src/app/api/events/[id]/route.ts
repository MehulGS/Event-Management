/**
 * GET /api/events/[id]
 *
 * Public event detail endpoint. Returns the full details of a single active,
 * upcoming event.
 *
 * ## Security
 * - The path parameter is validated as a 24-character hex MongoDB ObjectId
 *   before any database query is made. An invalid format returns 404 to
 *   avoid leaking information about the ID format.
 * - Only events where `isActive: true` and `date > now` are returned.
 * - Inactive or past events respond with 404 as if they do not exist.
 * - The `__v` field and other internal Mongoose fields are stripped from the
 *   response.
 */

import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import {
  ok,
  notFound,
  internalError,
} from "@/lib/api-response";
import type { IEvent } from "@/models/Event";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid MongoDB ObjectId (24-char hex). */
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/** Serialises a lean Event document to the safe public response shape. */
function serializeEvent(
  doc: IEvent & { _id: { toString(): string } }
): Record<string, unknown> {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    city: doc.city,
    date: doc.date,
    price: doc.price,
    imageUrl: doc.imageUrl,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  // Validate the ID format before touching the database.
  // An invalid format returns 404 (not 400) so callers cannot probe the
  // format of internal identifiers.
  if (!isValidObjectId(id)) {
    return notFound("Event not found.");
  }

  try {
    await connectDB();

    const now = new Date();

    // Fetch only active, upcoming events. Inactive or past events are treated
    // as non-existent from the public API's perspective.
    const event = await Event.findOne({
      _id: id,
      isActive: true,
      date: { $gt: now },
    }).lean<IEvent>();

    if (!event) {
      return notFound("Event not found.");
    }

    return ok({
      data: serializeEvent(event as IEvent & { _id: { toString(): string } }),
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[GET /api/events/${id}] Unexpected error:`, safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
