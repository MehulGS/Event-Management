/**
 * GET /api/events
 *
 * Public event listing endpoint. Returns a paginated list of active, upcoming
 * events. Supports optional filtering by category, city, and keyword search.
 *
 * ## Filter semantics
 * - `category` — exact enum match (case-sensitive, one of the five defined
 *   values). Invalid values return 400.
 * - `city`     — case-insensitive prefix/contains regex match against the
 *   stored `city` field. Special regex characters are escaped before use.
 *   Input is capped at 100 characters.
 * - `search`   — matched against the MongoDB text index on `title` and
 *   `description` using `$text: { $search }`. This supports word-stem
 *   matching but NOT substring/partial-word matching. Input is capped at
 *   200 characters. When `search` is provided alongside other filters all
 *   conditions are combined with AND logic.
 *
 * ## Sort order
 * Events are sorted by `date` ascending (nearest upcoming first) at all times.
 * The text relevance score is NOT used as a sort key so that date order is
 * preserved even when a search term is provided.
 *
 * ## Index usage
 * - No search: `{ isActive: 1, date: 1 }` or `{ category: 1, isActive: 1, date: 1 }`
 * - With city only: `{ city: 1, isActive: 1, date: 1 }`
 * - With search: text index + `{ isActive: 1, date: 1 }` compound filter
 *
 * ## Security
 * - Raw user input is never passed directly to a regex or MongoDB operator.
 * - City input is escaped with `escapeRegex()` before regex construction.
 * - Search input length is bounded to prevent oversized `$text` queries.
 * - Only `isActive: true` and `date > now` events are returned; inactive and
 *   past events are never reachable from this endpoint.
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { EVENT_CATEGORIES } from "@/types";
import {
  ok,
  badRequest,
  internalError,
} from "@/lib/api-response";
import type { QueryFilter } from "mongoose";
import type { IEvent } from "@/models/Event";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const MAX_CITY_LENGTH = 100;
const MAX_SEARCH_LENGTH = 200;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Escapes special MongoDB regex / JavaScript regex metacharacters in a string
 * so that raw user input can be used safely in a RegExp.
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Serialises a Mongoose Event document (or lean object) to a safe public shape.
 * Strips internal Mongoose fields (`__v`) and returns `id` instead of `_id`.
 */
function serializeEvent(
  doc: IEvent | (IEvent & { _id: { toString(): string } })
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

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;

  // ------------------------------------------------------------------
  // 1. Parse and validate query parameters
  // ------------------------------------------------------------------

  // page
  const rawPage = searchParams.get("page") ?? String(DEFAULT_PAGE);
  const page = parseInt(rawPage, 10);
  if (!Number.isInteger(page) || page < 1 || String(page) !== rawPage) {
    return badRequest("`page` must be a positive integer.");
  }

  // limit
  const rawLimit = searchParams.get("limit") ?? String(DEFAULT_LIMIT);
  const limit = parseInt(rawLimit, 10);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT ||
    String(limit) !== rawLimit
  ) {
    return badRequest(`\`limit\` must be an integer between 1 and ${MAX_LIMIT}.`);
  }

  // category
  const rawCategory = searchParams.get("category");
  if (
    rawCategory !== null &&
    !EVENT_CATEGORIES.includes(rawCategory as (typeof EVENT_CATEGORIES)[number])
  ) {
    return badRequest(
      `\`category\` must be one of: ${EVENT_CATEGORIES.join(", ")}.`
    );
  }
  const category = rawCategory as (typeof EVENT_CATEGORIES)[number] | null;

  // city — cap length and escape special characters
  const rawCity = searchParams.get("city");
  if (rawCity !== null && rawCity.length > MAX_CITY_LENGTH) {
    return badRequest(
      `\`city\` cannot exceed ${MAX_CITY_LENGTH} characters.`
    );
  }
  const city = rawCity?.trim() || null;

  // search — cap length
  const rawSearch = searchParams.get("search");
  if (rawSearch !== null && rawSearch.length > MAX_SEARCH_LENGTH) {
    return badRequest(
      `\`search\` cannot exceed ${MAX_SEARCH_LENGTH} characters.`
    );
  }
  const search = rawSearch?.trim() || null;

  // ------------------------------------------------------------------
  // 2. Build MongoDB filter
  // ------------------------------------------------------------------

  const now = new Date();

  const filter: QueryFilter<IEvent> = {
    isActive: true,
    date: { $gt: now },
  };

  if (category) {
    filter.category = category;
  }

  if (city) {
    // Case-insensitive contains match; special chars are escaped.
    filter.city = new RegExp(escapeRegex(city), "i");
  }

  if (search) {
    // MongoDB text index search — word-based matching on title + description.
    filter.$text = { $search: search };
  }

  // ------------------------------------------------------------------
  // 3. Query the database
  // ------------------------------------------------------------------

  try {
    await connectDB();

    const skip = (page - 1) * limit;

    // Use lean() for read-only listing — avoids Mongoose document overhead.
    // Sort by date ascending so the nearest upcoming event appears first.
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean<IEvent[]>(),
      Event.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return ok({
      data: events.map(serializeEvent),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/events] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
