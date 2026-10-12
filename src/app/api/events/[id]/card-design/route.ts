/**
 * GET /api/events/[id]/card-design
 * PUT /api/events/[id]/card-design
 *
 * Per-event card design preferences for the authenticated user.
 *
 * ## GET
 * Returns the authenticated user's saved card design for the specified event.
 * If no design has been saved, returns the documented default values:
 *   { theme: "pastel-cloud", stickers: [] }
 *
 * ## PUT
 * Upserts the card design for this user–event pair.
 * - Validates `theme` against the three themes defined in the task spec and
 *   the five themes allowed by the database schema.
 * - Validates `stickers` against the five allowed sticker values from
 *   `CARD_STICKERS`.
 * - Enforces a maximum of MAX_STICKERS (3) stickers.
 * - Duplicate stickers in the submitted array are silently removed
 *   (normalised to a unique ordered set) before persistence.
 * - Uses `findOneAndUpdate` with `upsert: true` so each user has at most one
 *   saved design per event. The compound unique index on `{ user, event }`
 *   is respected.
 * - The user cannot overwrite another user's design because the filter
 *   always includes `user: authenticatedUserId`.
 *
 * ## Default values
 * If no design exists for this user–event pair:
 *   - theme:    "pastel-cloud"
 *   - stickers: []
 *
 * ## Authorization
 * Both methods require a valid JWT. User ID is derived from the verified
 * token — never from the request body or path params.
 *
 * ## CSRF protection
 * PUT enforces the same-origin Origin header check.
 *
 * ## Event existence
 * The GET endpoint does not require the event to be active or upcoming — it
 * only returns a design document if one exists (or the default). The PUT
 * endpoint validates the ObjectId format but does not gate on event status
 * since a user should be able to save a design for any event they previously
 * viewed.
 */

import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import CardDesign from "@/models/CardDesign";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
import { CARD_THEMES, CARD_STICKERS, MAX_STICKERS } from "@/types";
import type { ICardDesign } from "@/models/CardDesign";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default design returned when no saved document exists. */
const DEFAULT_DESIGN = {
  theme: "pastel-cloud" as const,
  stickers: [] as string[],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid MongoDB ObjectId (24-char hex). */
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/** Serialises a CardDesign document to the safe API response shape. */
function serializeDesign(
  doc: ICardDesign & { _id: { toString(): string } }
): Record<string, unknown> {
  return {
    id: doc._id.toString(),
    eventId: doc.event.toString(),
    theme: doc.theme,
    stickers: doc.stickers,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const putCardDesignSchema = z.object({
  theme: z.enum([...CARD_THEMES] as [string, ...string[]], {
    message: `Theme must be one of: ${CARD_THEMES.join(", ")}.`,
  }),
  stickers: z
    .array(
      z.enum([...CARD_STICKERS] as [string, ...string[]], {
        message: `Each sticker must be one of: ${CARD_STICKERS.join(" ")}.`,
      })
    )
    .max(MAX_STICKERS, `A card design may have at most ${MAX_STICKERS} stickers.`)
    .optional()
    .default([])
    // Deduplicate stickers; duplicates are not meaningful.
    .transform((arr) => [...new Set(arr)]),
});

// ---------------------------------------------------------------------------
// GET /api/events/[id]/card-design
// ---------------------------------------------------------------------------

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  const { id: eventId } = await params;

  if (!isValidObjectId(eventId)) {
    // Return default rather than an error — consistent with the documented
    // "return default if no design exists" contract.
    return ok({ data: DEFAULT_DESIGN });
  }

  try {
    await connectDB();

    const design = await CardDesign.findOne({
      user: new mongoose.Types.ObjectId(decoded.userId),
      event: new mongoose.Types.ObjectId(eventId),
    }).lean<ICardDesign>();

    if (!design) {
      return ok({ data: DEFAULT_DESIGN });
    }

    return ok({
      data: serializeDesign(
        design as ICardDesign & { _id: { toString(): string } }
      ),
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[GET /api/events/${eventId}/card-design] Unexpected error:`,
      safeMessage
    );
    return internalError("An unexpected error occurred.");
  }
}

// ---------------------------------------------------------------------------
// PUT /api/events/[id]/card-design
// ---------------------------------------------------------------------------

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // CSRF check.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  const { id: eventId } = await params;

  if (!isValidObjectId(eventId)) {
    return badRequest("eventId in the path is not a valid ObjectId.");
  }

  // Parse body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = putCardDesignSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const { theme, stickers } = result.data;

  try {
    await connectDB();

    const userId = new mongoose.Types.ObjectId(decoded.userId);
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    // Upsert: create if absent, update if present.
    // The filter includes `user` so a user can never overwrite another user's
    // design regardless of the eventId they supply.
    const design = await CardDesign.findOneAndUpdate(
      { user: userId, event: eventObjectId },
      { $set: { theme, stickers } },
      { new: true, upsert: true, runValidators: true }
    ).lean<ICardDesign>();

    if (!design) {
      return internalError("Failed to save card design.");
    }

    return ok({
      message: "Card design saved.",
      data: serializeDesign(
        design as ICardDesign & { _id: { toString(): string } }
      ),
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[PUT /api/events/${eventId}/card-design] Unexpected error:`,
      safeMessage
    );
    return internalError("An unexpected error occurred.");
  }
}
