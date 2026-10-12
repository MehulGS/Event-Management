/**
 * Event slug utilities.
 *
 * URLs follow the pattern: /events/<slug>
 * Example: /events/coimbatore-jazz-evening
 *
 * Slugs are stored on the Event document and must be unique.
 * They are generated from the event title at creation time.
 * If a title change would produce a colliding slug, a numeric suffix
 * (-2, -3, …) is appended — the MongoDB ID is NEVER part of the public URL.
 *
 * Slug generation rules:
 *  - Lowercase
 *  - Non-alphanumeric characters replaced with hyphens
 *  - Consecutive hyphens collapsed
 *  - Leading/trailing hyphens stripped
 *  - Capped at 80 characters
 */

/**
 * Converts an event title into a URL-safe slug base.
 * The result is capped at 80 characters.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, ""); // re-trim after slicing
}

/**
 * Validates that a URL segment is a well-formed slug.
 * A valid slug contains only lowercase letters, digits, and hyphens,
 * does not start or end with a hyphen, and is between 1 and 120 characters.
 */
export function isValidSlug(segment: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(segment) || /^[a-z0-9]$/.test(segment);
}

// ---------------------------------------------------------------------------
// Legacy / compatibility — kept so any code that still imports these symbols
// does not break during the transition period.
// ---------------------------------------------------------------------------

/** @deprecated Use stored event.slug instead. */
export function buildEventSlug(title: string, id: string): string {
  const base = slugify(title);
  if (!base) return id;
  return `${base}-${id}`;
}
