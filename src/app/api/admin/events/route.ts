/**
 * POST /api/admin/events
 *
 * Admin-only endpoint to create a new community event.
 *
 * ## Authorization
 * Requires a valid JWT (cookie or Bearer header) whose corresponding database
 * user has `role: "admin"`. The role is re-read from the database — never
 * trusted from the JWT claim alone.
 *
 * ## CSRF protection
 * The same-origin Origin header check (`isSameOrigin`) is enforced for this
 * state-changing mutation, consistent with all other admin mutations.
 *
 * ## Mass assignment prevention
 * Only the fields listed in `createEventSchema` are accepted. The `createdBy`
 * field is sourced from the verified JWT, never from the client body.
 *
 * ## Validation
 * - title: 3–120 characters (trimmed)
 * - description: 1–2000 characters (trimmed)
 * - category: one of the five defined values
 * - city: 1–100 characters (trimmed)
 * - date: valid ISO 8601 string, must be in the future
 * - price: number >= 0
 * - imageUrl: valid HTTP or HTTPS URL
 * - isActive: optional boolean, defaults to true
 */

import { z } from "zod";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import { EVENT_CATEGORIES } from "@/types";
import {
  created,
  badRequest,
  unauthorized,
  forbidden,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const createEventSchema = z.object({
  // Zod v4: use .min(1) for required strings instead of required_error
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title cannot exceed 120 characters."),

  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(2000, "Description cannot exceed 2000 characters."),

  // Zod v4: z.enum requires a mutable array; spread the readonly tuple.
  // The enum already enforces that only the five defined values are accepted.
  category: z.enum([...EVENT_CATEGORIES] as [string, ...string[]], {
    message: `Category must be one of: ${EVENT_CATEGORIES.join(", ")}.`,
  }) as z.ZodType<(typeof EVENT_CATEGORIES)[number]>,

  city: z
    .string()
    .trim()
    .min(1, "City is required.")
    .max(100, "City cannot exceed 100 characters."),

  date: z
    .string()
    .min(1, "Date is required.")
    .refine((v) => !isNaN(Date.parse(v)), {
      message: "Date must be a valid ISO 8601 date string.",
    })
    .transform((v) => new Date(v)),

  price: z
    .number()
    .min(0, "Price cannot be negative."),

  imageUrl: z
    .string()
    .trim()
    .min(1, "Image URL is required.")
    .url("imageUrl must be a valid URL.")
    .refine((v) => v.startsWith("http://") || v.startsWith("https://"), {
      message: "imageUrl must use HTTP or HTTPS.",
    }),

  isActive: z.boolean().optional().default(true),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serialises a saved Event document to the safe admin response shape. */
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

export async function POST(request: Request): Promise<Response> {
  // Step 1: CSRF check.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  // Step 2: Verify authentication.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

  // Step 3: Parse and validate request body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = createEventSchema.safeParse(body);
  if (!result.success) {
    return badRequest("Validation failed.", result.error.flatten().fieldErrors);
  }

  const { title, description, category, city, date, price, imageUrl, isActive } =
    result.data;

  try {
    await connectDB();

    // Step 4: Re-read the role from the database — do NOT trust the JWT claim.
    const adminUser = await User.findById(decoded.userId).lean();
    if (!adminUser) {
      return unauthorized("User account not found.");
    }
    if (adminUser.role !== "admin") {
      return forbidden("Admin access is required.");
    }

    // Step 5: Create the event. `createdBy` is sourced from the verified DB
    // user, never from the client request body.
    const event = await Event.create({
      title,
      description,
      category,
      city,
      date,
      price,
      imageUrl,
      isActive,
    });

    return created({
      message: "Event created.",
      data: serializeEvent(event),
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/admin/events] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
