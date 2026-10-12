/**
 * GET /api/events/slug/[slug]
 *
 * Public event detail endpoint — looks up an event by its stored slug field.
 *
 * This endpoint is the canonical way for the public event detail page to
 * resolve a URL slug to an event record. The slug is an indexed field on the
 * Event document, so lookup is O(log n) — no full-collection scan.
 *
 * ## Behaviour
 * - Validates the slug format (lowercase letters, digits, hyphens only).
 * - Returns the event only if it is active (`isActive: true`) AND upcoming
 *   (`date > now`). Inactive or past events respond with 404.
 * - Returns 404 for unknown or malformed slugs (does not leak information
 *   about the slug format to callers).
 * - Strips internal Mongoose fields from the response.
 *
 * ## Security
 * - Raw slug input is used only in an exact-match query (`slug: slug`) —
 *   no regex, no user-controlled operators.
 * - Only public, active, upcoming events are ever returned.
 */

import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { ok, notFound, internalError } from "@/lib/api-response";
import { isValidSlug } from "@/lib/slug";
import type { IEvent } from "@/models/Event";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serialises a lean Event document to the safe public response shape. */
function serializeEvent(
  doc: IEvent & { _id: { toString(): string } }
): Record<string, unknown> {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
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
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params;

  // Validate slug format before touching the database.
  // An invalid format returns 404 to avoid leaking format information.
  if (!isValidSlug(slug)) {
    return notFound("Event not found.");
  }

  try {
    await connectDB();

    const now = new Date();

    // Indexed exact-match lookup on the slug field.
    // Only active, upcoming events are surfaced publicly.
    const event = await Event.findOne({
      slug,
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
    console.error(`[GET /api/events/slug/${slug}] Unexpected error:`, safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
