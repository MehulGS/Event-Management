/**
 * GET /api/feed
 *
 * Authenticated user's personalised event feed.
 *
 * Returns a paginated list of active, upcoming events filtered to the
 * authenticated user's saved favourite categories. If the user has no
 * favourite categories saved, an empty result set is returned (rather than
 * all events), making it clear that preferences need to be configured first.
 *
 * ## Filter behaviour
 * - Category filter is sourced exclusively from the authenticated user's
 *   `favouriteCategories` field in the database. Client-supplied category
 *   or user-ID query parameters are ignored.
 * - Only `isActive: true` and `date > now` events are returned.
 * - Optional `city` and `search` query parameters apply additional AND filters
 *   (same semantics as GET /api/events).
 *
 * ## Empty preferences
 * An empty `favouriteCategories` array produces an empty feed (HTTP 200,
 * `data: []`) with correct pagination metadata. This is intentional: the
 * empty state signals that the user should configure preferences.
 *
 * ## Pagination
 * Supports the same `page` and `limit` parameters as GET /api/events.
 * Results are sorted by `date` ascending (nearest upcoming first).
 *
 * ## Authorization
 * Requires a valid JWT. User ID is derived from the verified token only.
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Event from "@/models/Event";
import {
  ok,
  badRequest,
  unauthorized,
  internalError,
} from "@/lib/api-response";
import { getAuthFromRequest } from "@/lib/auth";
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
 * Serialises a lean Event document to the safe public response shape,
 * identical to GET /api/events response shape.
 */
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

export async function GET(request: NextRequest): Promise<Response> {
  // Authentication check.
  const decoded = getAuthFromRequest(request);
  if (!decoded) {
    return unauthorized("Authentication is required.");
  }

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

  // city — optional additional filter; same semantics as GET /api/events
  const rawCity = searchParams.get("city");
  if (rawCity !== null && rawCity.length > MAX_CITY_LENGTH) {
    return badRequest(`\`city\` cannot exceed ${MAX_CITY_LENGTH} characters.`);
  }
  const city = rawCity?.trim() || null;

  // search — optional additional filter
  const rawSearch = searchParams.get("search");
  if (rawSearch !== null && rawSearch.length > MAX_SEARCH_LENGTH) {
    return badRequest(
      `\`search\` cannot exceed ${MAX_SEARCH_LENGTH} characters.`
    );
  }
  const search = rawSearch?.trim() || null;

  // ------------------------------------------------------------------
  // 2. Fetch user preferences from the database
  // ------------------------------------------------------------------

  try {
    await connectDB();

    const user = await User.findById(decoded.userId)
      .select("favouriteCategories")
      .lean();

    if (!user) {
      return unauthorized("User account not found.");
    }

    const favouriteCategories = user.favouriteCategories ?? [];

    // Empty preferences → return empty feed immediately, no DB event query needed.
    if (favouriteCategories.length === 0) {
      return ok({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    // ------------------------------------------------------------------
    // 3. Build MongoDB filter
    // ------------------------------------------------------------------

    const now = new Date();

    const filter: QueryFilter<IEvent> = {
      isActive: true,
      date: { $gt: now },
      // Category filter sourced from DB — never from query params.
      category: { $in: favouriteCategories },
    };

    if (city) {
      filter.city = new RegExp(escapeRegex(city), "i");
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // ------------------------------------------------------------------
    // 4. Query the database
    // ------------------------------------------------------------------

    const skip = (page - 1) * limit;

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
      data: events.map(
        (e) => serializeEvent(e as IEvent & { _id: { toString(): string } })
      ),
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
    console.error("[GET /api/feed] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred.");
  }
}
