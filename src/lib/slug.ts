/**
 * Event slug utilities.
 *
 * URLs follow the pattern: /events/<slug>-<id>
 * Example: /events/coimbatore-jazz-evening-6acd20dbf9be593f89b0e8dd
 *
 * The 24-character hex ObjectId is always appended as a suffix so:
 *  - Database lookups use the ID, not the slug (reliable + unique).
 *  - If the title changes, old links still resolve (ID is stable).
 *  - Canonical redirect is possible when the slug portion is outdated.
 *
 * Slug generation rules:
 *  - Lowercase
 *  - Non-alphanumeric characters replaced with hyphens
 *  - Consecutive hyphens collapsed
 *  - Leading/trailing hyphens stripped
 *  - Capped at 60 characters before ID suffix
 */

/** Mongo ObjectId regex (24 lowercase hex characters). */
const OBJECT_ID_RE = /^[a-f0-9]{24}$/;

/**
 * Converts an event title into a URL-safe slug.
 * The result is capped at 60 characters.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, ""); // re-trim after slicing
}

/**
 * Builds the full URL slug for an event: `<slug>-<id>`.
 *
 * @param title  — the event's current title
 * @param id     — the event's 24-char hex MongoDB ObjectId string
 */
export function buildEventSlug(title: string, id: string): string {
  const base = slugify(title);
  if (!base) return id; // fallback: id-only if title produces an empty slug
  return `${base}-${id}`;
}

/**
 * Extracts the MongoDB ObjectId from a slug URL segment.
 *
 * Accepts both:
 *   - `<slug>-<id>`  (canonical form)
 *   - `<id>`         (legacy / bare ObjectId)
 *
 * Returns the extracted 24-char hex id, or null if none is found.
 */
export function extractIdFromSlug(segment: string): string | null {
  // The id is always the last 24 lowercase hex characters in the segment.
  const candidate = segment.slice(-24).toLowerCase();
  if (OBJECT_ID_RE.test(candidate)) {
    return candidate;
  }

  // Fallback: maybe the segment IS the bare id.
  const bare = segment.toLowerCase();
  if (OBJECT_ID_RE.test(bare)) {
    return bare;
  }

  return null;
}

/**
 * Returns true if the segment is already the canonical slug for the event.
 * Used to decide whether a redirect is needed.
 *
 * @param segment — the URL segment from the request
 * @param title   — the event's current title
 * @param id      — the event's MongoDB ObjectId
 */
export function isCanonicalSlug(segment: string, title: string, id: string): boolean {
  return segment === buildEventSlug(title, id);
}
