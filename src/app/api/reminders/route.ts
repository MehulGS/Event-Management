/**
 * GET /api/reminders
 * POST /api/reminders
 *
 * ## GET
 * Returns all events for which the authenticated user has saved a reminder.
 * Each item in the response includes the reminder metadata and the full event
 * object (populated from the Event collection). Reminders for events that no
 * longer exist are excluded from the response (orphan documents are skipped).
 *
 * ## POST
 * Saves a new reminder for the specified event.
 * - Validates `eventId` as a 24-character hex ObjectId.
 * - Verifies the event exists and is active + upcoming before saving.
 * - Prevents duplicate reminders via the compound unique index on
 *   `{ user, event }`. A duplicate returns 409 CONFLICT with a clear message.
 * - Returns the created reminder on success (HTTP 201).
 *
 * ## Authorization
 * Both methods require a valid JWT (HttpOnly cookie or Bearer header).
 * The user ID is always sourced from the verified token — never from the body.
 *
 * ## CSRF protection
 * POST enforces the same-origin Origin header check.
 */

import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Reminder from "@/models/Reminder";
import Event from "@/models/Event";
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";
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
// Validation
// ---------------------------------------------------------------------------

const postReminderSchema = z.object({
  eventId: z
    .string()
    .min(1, "eventId is required.")
    .refine(isValidObjectId, { message: "eventId must be a valid ObjectId." }),
});

// ---------------------------------------------------------------------------
// GET /api/reminders
// ---------------------------------------------------------------------------

export async function GET(request: Request): Promise<Response> {
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  try {
    await connectDB();

    // Fetch all reminders for this user and populate the event document.
    // .lean() is used for read performance; populate is needed for event data.
    const reminders = await Reminder.find({ user: decoded.userId })
      .populate<{ event: (IEvent & { _id: { toString(): string } }) | null }>(
        "event"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Filter out orphaned reminders (events that were hard-deleted, if ever).
    const data = reminders
      .filter((r) => r.event !== null)
      .map((r) => ({
        reminderId: (r._id as { toString(): string }).toString(),
        event: serializeEvent(
          r.event as IEvent & { _id: { toString(): string } }
        ),
        savedAt: r.createdAt,
      }));

    return ok({ data });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/reminders] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}

// ---------------------------------------------------------------------------
// POST /api/reminders
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // CSRF check.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  // Parse body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = postReminderSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const { eventId } = result.data;

  try {
    await connectDB();

    const now = new Date();

    // Verify the event exists and is active + upcoming.
    // Reminders for past or inactive events are not allowed.
    const event = await Event.findOne({
      _id: eventId,
      isActive: true,
      date: { $gt: now },
    })
      .select("_id")
      .lean();

    if (!event) {
      return notFound(
        "Event not found, or the event is inactive or in the past."
      );
    }

    // Create reminder. The compound unique index on { user, event } prevents
    // duplicates at the database level. We catch the duplicate key error below
    // and return 409 CONFLICT rather than letting it bubble up as 500.
    const reminder = await Reminder.create({
      user: new mongoose.Types.ObjectId(decoded.userId),
      event: new mongoose.Types.ObjectId(eventId),
    });

    return created({
      message: "Reminder saved.",
      data: {
        reminderId: reminder._id.toString(),
        eventId,
      },
    });
  } catch (error: unknown) {
    // MongoDB / Mongoose duplicate key error code is 11000.
    if (
      error !== null &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: unknown }).code === 11000
    ) {
      return conflict("You already have a reminder saved for this event.");
    }

    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/reminders] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
