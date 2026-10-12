/**
 * Seed script — Community Events Board
 *
 * Creates exactly 15 sample events in the `events` collection.
 * Running this script multiple times is safe: each event is identified by a
 * stable `seedId` stored in its title slug, and the script uses `updateOne`
 * with `upsert: true` so no duplicates are created.
 *
 * Distribution:
 *   - All 5 categories covered (Music, Workshop, Food, Sports, Kids)
 *   - 7 Indian cities including Coimbatore
 *   - 9 active upcoming events  (isActive: true,  date > now)
 *   - 2 inactive upcoming events (isActive: false, date > now)
 *   - 4 past events              (isActive: true,  date < now)
 *
 * Usage:
 *   npx tsx scripts/seed-events.ts
 *
 * Prerequisites:
 *   - MONGODB_URI must be set in .env (project root) or .env.local
 *   - The database URI should point to the correct database name
 */

import "dotenv/config"; // picks up .env in cwd
import mongoose from "mongoose";
import Event from "../src/models/Event";

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env or .env.local before running this script."
    );
  }
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Connected to MongoDB.");
}

// ---------------------------------------------------------------------------
// Seed data helpers
// ---------------------------------------------------------------------------

/**
 * Returns a Date object offset from "now" by the given number of days.
 * Positive = future, negative = past.
 */
function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  // Normalise to a sensible event time (18:00 IST = 12:30 UTC)
  d.setUTCHours(12, 30, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Seed events
// ---------------------------------------------------------------------------

/**
 * Each event includes a `_seedId` field (stored as part of a compound filter)
 * so the upsert can locate the document on re-runs without relying on `_id`.
 * We use the title as the stable key — titles in this seed set are unique.
 */
const SEED_EVENTS = [
  // ── Active upcoming events (9) ──────────────────────────────────────────

  {
    title: "Coimbatore Jazz Evening",
    description:
      "A relaxed evening of live jazz by local and visiting musicians at the Brookefields rooftop. Bring your own picnic blanket and enjoy the breeze.",
    category: "Music",
    city: "Coimbatore",
    date: daysFromNow(10),
    price: 299,
    imageUrl:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80",
    isActive: true,
  },
  {
    title: "Chennai Indie Music Fest",
    description:
      "Three stages, twelve independent acts, and a food court featuring the city's best street vendors. Day-long celebration of Tamil indie music.",
    category: "Music",
    city: "Chennai",
    date: daysFromNow(20),
    price: 499,
    imageUrl:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    isActive: true,
  },
  {
    title: "Bangalore Web Dev Workshop",
    description:
      "Hands-on full-day workshop covering React, Next.js App Router, and MongoDB. Bring your laptop. Lunch and coffee are included in the ticket price.",
    category: "Workshop",
    city: "Bangalore",
    date: daysFromNow(14),
    price: 1499,
    imageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    isActive: true,
  },
  {
    title: "Coimbatore UI/UX Design Sprint",
    description:
      "A two-day intensive where participants redesign a real product. Facilitated by senior designers from Zoho and Freshworks. Certificate provided.",
    category: "Workshop",
    city: "Coimbatore",
    date: daysFromNow(25),
    price: 999,
    imageUrl:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
    isActive: true,
  },
  {
    title: "Mumbai Street Food Festival",
    description:
      "Over fifty stalls from Mumbai's iconic street food culture — vada pav, bhel puri, pav bhaji, and much more. Free entry; pay per dish.",
    category: "Food",
    city: "Mumbai",
    date: daysFromNow(8),
    price: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    isActive: true,
  },
  {
    title: "Coimbatore Organic Food Fair",
    description:
      "Meet local farmers, taste farm-to-table produce, and attend cooking demonstrations using seasonal ingredients. Suitable for all age groups.",
    category: "Food",
    city: "Coimbatore",
    date: daysFromNow(18),
    price: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80",
    isActive: true,
  },
  {
    title: "Hyderabad 10K Community Run",
    description:
      "Flat, scenic 10 km run along the Hussain Sagar lake front. Timed with chip. Open to all fitness levels. Kit collection at HICC the day before.",
    category: "Sports",
    city: "Hyderabad",
    date: daysFromNow(30),
    price: 350,
    imageUrl:
      "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80",
    isActive: true,
  },
  {
    title: "Delhi Kids Science Carnival",
    description:
      "Interactive experiments, planetarium shows, and robotics demos designed for children aged 5–14. Parents enter free with a child ticket.",
    category: "Kids",
    city: "Delhi",
    date: daysFromNow(12),
    price: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    isActive: true,
  },
  {
    title: "Coimbatore Kids Art Camp",
    description:
      "A weekend art camp for children aged 4–12 at the Suguna Art Academy. Painting, clay modelling, and origami sessions. All materials provided.",
    category: "Kids",
    city: "Coimbatore",
    date: daysFromNow(35),
    price: 400,
    imageUrl:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    isActive: true,
  },

  // ── Inactive upcoming events (2) — hidden from public listing ───────────

  {
    title: "Pune Rock Night [Draft]",
    description:
      "Upcoming rock concert featuring three local Pune bands. Event details are still being finalised — not yet open for ticket sales.",
    category: "Music",
    city: "Pune",
    date: daysFromNow(45),
    price: 599,
    imageUrl:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80",
    isActive: false,
  },
  {
    title: "Coimbatore Marathon Preview [Draft]",
    description:
      "Internal preview event for the annual Coimbatore Marathon. Route testing and volunteer coordination — not open to the public yet.",
    category: "Sports",
    city: "Coimbatore",
    date: daysFromNow(60),
    price: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
    isActive: false,
  },

  // ── Past events (4) — tests upcoming-only filtering ─────────────────────

  {
    title: "Chennai Classical Music Night",
    description:
      "An evening of Carnatic classical music at the Music Academy. Featured artists included several Sangita Kalanidhi award holders.",
    category: "Music",
    city: "Chennai",
    date: daysFromNow(-30),
    price: 150,
    imageUrl:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
    isActive: true,
  },
  {
    title: "Bangalore Python Bootcamp",
    description:
      "Three-day beginner Python bootcamp held at NASSCOM CoE. Participants built two real-world projects by the end of the programme.",
    category: "Workshop",
    city: "Bangalore",
    date: daysFromNow(-15),
    price: 1200,
    imageUrl:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&q=80",
    isActive: true,
  },
  {
    title: "Mumbai Biryani Battle",
    description:
      "Twelve restaurants competed for the title of Mumbai's best biryani. Visitors voted with their tickets and their taste buds.",
    category: "Food",
    city: "Mumbai",
    date: daysFromNow(-45),
    price: 299,
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
    isActive: true,
  },
  {
    title: "Hyderabad Junior Football League",
    description:
      "Weekend league for children aged 8–16 at the Gachibowli Stadium. Six teams participated. Medals and certificates awarded to all.",
    category: "Kids",
    city: "Hyderabad",
    date: daysFromNow(-20),
    price: 100,
    imageUrl:
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
    isActive: true,
  },
] as const;

// ---------------------------------------------------------------------------
// Seeding logic
// ---------------------------------------------------------------------------

async function seedEvents(): Promise<void> {
  let inserted = 0;
  let updated = 0;

  for (const eventData of SEED_EVENTS) {
    // Use the title as the stable deduplication key.
    // `updateOne` with `upsert: true` creates the document if it doesn't
    // exist, or updates the non-identity fields if it does.
    const result = await Event.updateOne(
      { title: eventData.title },
      {
        $set: {
          description: eventData.description,
          category: eventData.category,
          city: eventData.city,
          date: eventData.date,
          price: eventData.price,
          imageUrl: eventData.imageUrl,
          isActive: eventData.isActive,
        },
        $setOnInsert: {
          title: eventData.title,
        },
      },
      { upsert: true, runValidators: true }
    );

    if (result.upsertedCount > 0) {
      inserted++;
    } else if (result.modifiedCount > 0) {
      updated++;
    }
  }

  console.log(
    `Seed complete: ${inserted} inserted, ${updated} updated, ` +
      `${SEED_EVENTS.length - inserted - updated} unchanged.`
  );
}

async function verifyCount(): Promise<void> {
  // Count only the seed events by title
  const titles = SEED_EVENTS.map((e) => e.title);
  const count = await Event.countDocuments({ title: { $in: titles } });
  console.log(`Verification: ${count} of ${SEED_EVENTS.length} seed events found in database.`);

  const activeUpcoming = await Event.countDocuments({
    title: { $in: titles },
    isActive: true,
    date: { $gte: new Date() },
  });
  const inactiveUpcoming = await Event.countDocuments({
    title: { $in: titles },
    isActive: false,
    date: { $gte: new Date() },
  });
  const past = await Event.countDocuments({
    title: { $in: titles },
    date: { $lt: new Date() },
  });
  console.log(
    `  Active upcoming: ${activeUpcoming} | Inactive upcoming: ${inactiveUpcoming} | Past: ${past}`
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

(async () => {
  try {
    await connectDB();
    await seedEvents();
    await verifyCount();
  } catch (err) {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
})();
