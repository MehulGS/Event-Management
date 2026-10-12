/**
 * Event expiry utility.
 *
 * ## Purpose
 * Marks active events whose `date` has passed as `isActive: false`.
 * This keeps expired events in the database (for admin reference) while
 * ensuring they are never served to the public.
 *
 * ## Timezone policy
 * All comparisons use the server's UTC clock (`new Date()`). Event dates
 * are stored in UTC in MongoDB. No client-supplied time is trusted.
 *
 * ## When to call
 * Call `runExpiry()` at the start of any admin-facing data-fetch or
 * admin-listing request. It is intentionally NOT called on every public
 * request because the public queries already filter `date: { $gt: now }`.
 *
 * The function is safe to call concurrently — MongoDB's `updateMany` is
 * atomic at the document level, and the filter is idempotent.
 *
 * ## Scheduled jobs
 * This project runs on Vercel (serverless). Vercel does not support a
 * persistent cron process in the free tier without Vercel Cron Jobs (a
 * paid feature). Therefore, expiry is triggered opportunistically:
 *   - On every GET /api/admin/events request (admin dashboard load).
 *   - On every PATCH /api/admin/events/[id]/status request (admin toggle).
 * This guarantees that the admin dashboard reflects accurate expiry status
 * whenever an admin views or manages events. Public APIs already gate on
 * `date: { $gt: now }` independently and do not need this utility.
 *
 * ## Performance
 * The `{ isActive: 1, date: 1 }` compound index on the Event collection
 * means the filter `{ isActive: true, date: { $lte: now } }` is a fast
 * index range scan. When no events have expired, `updateMany` matches zero
 * documents and returns immediately. The overhead on a warm admin request
 * is negligible.
 */

import Event from "@/models/Event";

let lastRun: Date | null = null;
// Throttle: run at most once per minute per process instance.
const THROTTLE_MS = 60_000;

/**
 * Marks all active events whose scheduled `date` is in the past as inactive.
 *
 * Safe to call on every admin request — returns early if called more than
 * once per minute within the same process instance (serverless warm reuse).
 *
 * @returns The number of events that were expired in this invocation.
 */
export async function runExpiry(): Promise<number> {
  const now = new Date();

  // Throttle within a single warm process instance.
  if (lastRun && now.getTime() - lastRun.getTime() < THROTTLE_MS) {
    return 0;
  }

  lastRun = now;

  try {
    const result = await Event.updateMany(
      { isActive: true, date: { $lte: now } },
      { $set: { isActive: false } }
    );
    const expired = result.modifiedCount ?? 0;
    if (expired > 0) {
      console.info(`[expireEvents] Marked ${expired} event(s) as inactive (expired).`);
    }
    return expired;
  } catch (err) {
    // Non-fatal: log and continue. The public API's own date filter still
    // prevents expired events from being served.
    console.error("[expireEvents] Error running expiry:", err);
    return 0;
  }
}
