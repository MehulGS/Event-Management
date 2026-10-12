/**
 * scripts/backfill-slugs.ts
 *
 * One-time migration: adds a unique `slug` field to every existing Event
 * document that does not yet have one.
 *
 * ## Safety guarantees
 * - Only writes to documents where `slug` is missing/falsy.
 * - Never deletes or overwrites any other field.
 * - Generates slugs from the event title; appends a numeric suffix (-2, -3, …)
 *   when the base slug is already taken.
 * - Logs every write so you can verify the result.
 * - Dry-run mode: set DRY_RUN=true to preview changes without writing.
 *
 * ## Usage
 *   npx ts-node --project tsconfig.json scripts/backfill-slugs.ts
 *   DRY_RUN=true npx ts-node --project tsconfig.json scripts/backfill-slugs.ts
 *
 * Run once before deploying the new slug-based routing. After all documents
 * have slugs, the migration can be removed.
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load .env / .env.local
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI environment variable is not set.");
  process.exit(1);
}

const DRY_RUN = process.env.DRY_RUN === "true";
if (DRY_RUN) {
  console.log("DRY RUN MODE — no writes will be performed.\n");
}

// ---------------------------------------------------------------------------
// Minimal schema — we only need _id, title, and slug for this migration.
// ---------------------------------------------------------------------------

const eventSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
  },
  { collection: "events", strict: false }
);

const Event = mongoose.model("Event", eventSchema);

// ---------------------------------------------------------------------------
// Slug utilities (copied inline to avoid circular imports)
// ---------------------------------------------------------------------------

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Set of slugs already assigned during this run (in-memory dedup). */
const assigned = new Set<string>();

/**
 * Generates a slug unique within both the database and the current run.
 * Excludes the current document's own ID so an already-correct slug
 * (if somehow partial migration happened) does not conflict with itself.
 */
async function generateUniqueSlug(title: string, excludeId: string): Promise<string> {
  const base = slugify(title) || "event";

  // Try the base slug.
  if (!assigned.has(base)) {
    const exists = await Event.exists({ slug: base, _id: { $ne: excludeId } });
    if (!exists) {
      assigned.add(base);
      return base;
    }
  }

  // Try numeric suffixes.
  let suffix = 2;
  while (suffix < 10_000) {
    const candidate = `${base}-${suffix}`;
    if (!assigned.has(candidate)) {
      const exists = await Event.exists({
        slug: candidate,
        _id: { $ne: excludeId },
      });
      if (!exists) {
        assigned.add(candidate);
        return candidate;
      }
    }
    suffix++;
  }

  // Fallback (extremely unlikely).
  const ts = `${base}-${Date.now()}`;
  assigned.add(ts);
  return ts;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function run() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  console.log("Connected.\n");

  // Find all events without a slug.
  const events = await Event.find({ $or: [{ slug: { $exists: false } }, { slug: "" }, { slug: null }] })
    .select("_id title slug")
    .lean<{ _id: mongoose.Types.ObjectId; title: string; slug?: string }[]>();

  console.log(`Found ${events.length} event(s) without a slug.\n`);

  if (events.length === 0) {
    console.log("Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const event of events) {
    const id = event._id.toString();
    const title = event.title ?? "";
    const slug = await generateUniqueSlug(title, id);

    if (DRY_RUN) {
      console.log(`[DRY RUN] Would set slug "${slug}" on event "${title}" (${id})`);
      skipped++;
    } else {
      await Event.updateOne({ _id: event._id }, { $set: { slug } });
      console.log(`✓ Set slug "${slug}" on event "${title}" (${id})`);
      updated++;
    }
  }

  console.log(`\n${DRY_RUN ? "Dry run complete" : "Migration complete"}.`);
  if (!DRY_RUN) {
    console.log(`  Updated: ${updated} document(s)`);
    console.log(`  Skipped: ${skipped} document(s)`);
  }

  await mongoose.disconnect();
  console.log("Disconnected.");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
