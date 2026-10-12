/**
 * PATCH /api/admin/events/[id]
 *
 * Admin-only endpoint to update one or more fields of an existing event.
 * Accepts a partial body — only fields that are explicitly provided are updated.
 *
 * ## Authorization
 * Requires a valid JWT whose corresponding database user has `role: "admin"`.
 *
 * ## CSRF protection
 * Origin header check enforced for all mutations.
 *
 * ## Allowed fields
 * Only the following fields may be updated:
 *   title, description, category, city, date, price, imageUrl, isActive
 *
 * Any other fields in the request body are silently ignored (the schema
 * uses `.strip()` via Zod's default behaviour). Privileged fields
 * (`createdBy`, `_id`, etc.) are never accepted from the client.
 *
 * ## 404 behaviour
 * Returns 404 for any event that does not exist — including events that were
 * never created, were permanently removed, or whose ID format is invalid.
 */

import { z } from "zod";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import { EVENT_CATEGORIES } from "@/types";
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
// Validation schema (all fields optional for partial update)
// ---------------------------------------------------------------------------
const updateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters.")
      .max(120, "Title cannot exceed 120 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .min(1, "Description cannot be empty.")
      .max(2000, "Description cannot exceed 2000 characters.")
      .optional(),

    category: z
      .enum([...EVENT_CATEGORIES] as [string, ...string[]], {
        message: `Category must be one of: ${EVENT_CATEGORIES.join(", ")}.`,
      })
      .optional() as z.ZodOptional<z.ZodType<(typeof EVENT_CATEGORIES)[number]>>,

    city: z
      .string()
      .trim()
      .min(1, "City cannot be empty.")
      .max(100, "City cannot exceed 100 characters.")
      .optional(),

    date: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), {
        message: "Date must be a valid ISO 8601 date string.",
      })
      .refine((v) => new Date(v) > new Date(), {
        message: "Event date must be in the future.",
      })
      .transform((v) => new Date(v))
      .optional(),

    price: z.number().min(0, "Price cannot be negative.").optional(),

    imageUrl: z
      .string()
      .trim()
      .url("imageUrl must be a valid URL.")
      .refine((v) => v.startsWith("http://") || v.startsWith("https://"), {
        message: "imageUrl must use HTTP or HTTPS.",
      })
      .optional(),

    isActive: z.boolean().optional(),
  })
  .strict(); // Reject unrecognised keys so clients cannot send arbitrary fields.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid MongoDB ObjectId (24-char hex). */
function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

/** Serialises an Event document to the safe admin response shape. */
function serializeEvent(doc: {
  _id: { toString(): string };
  title: string;
  description: string;
  category: string;
  city: string;
  date: Date;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Record<string, unknown> {
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

  // Step 3: Validate the event ID format.
  if (!isValidObjectId(id)) {
    return notFound("Event not found.");
  }

  // Step 4: Parse and validate request body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = updateEventSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const updates = result.data;

  // Reject empty update body.
  if (Object.keys(updates).length === 0) {
    return badRequest("Request body must contain at least one field to update.");
  }

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

    // Step 6: Apply the partial update.
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,       // Return the document after update.
        runValidators: true, // Run schema validators on the updated fields.
      }
    ).lean<{
      _id: { toString(): string };
      title: string;
      description: string;
      category: string;
      city: string;
      date: Date;
      price: number;
      imageUrl: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>();

    if (!updatedEvent) {
      return notFound("Event not found.");
    }

    return ok({
      message: "Event updated.",
      data: serializeEvent(updatedEvent),
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `[PATCH /api/admin/events/${id}] Unexpected error:`,
      safeMessage
    );
    return internalError("An unexpected error occurred.");
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/events/[id]
// ---------------------------------------------------------------------------

/**
 * Returns a single event document for admin use (includes inactive/past events).
 * Used by the edit page to pre-populate the EventForm.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Verify authentication.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return notFound("Event not found.");
  }

  try {
    await connectDB();

    // Re-read the role from the database.
    const adminUser = await User.findById(decoded.userId).lean();
    if (!adminUser) {
      return unauthorized("User account not found.");
    }
    if (adminUser.role !== "admin") {
      return forbidden("Admin access is required.");
    }

    const event = await Event.findById(id).lean<{
      _id: { toString(): string };
      title: string;
      description: string;
      category: string;
      city: string;
      date: Date;
      price: number;
      imageUrl: string;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>();

    if (!event) {
      return notFound("Event not found.");
    }

    return ok({ data: serializeEvent(event) });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`[GET /api/admin/events/${id}] Unexpected error:`, safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
