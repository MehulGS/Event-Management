/**
 * scripts/seed-admin.ts
 *
 * Idempotent admin account provisioning script.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * The script reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables
 * (via .env in the project root or the shell environment) and:
 *
 * - If no user exists with that email → creates a new user with role "admin".
 * - If a user already exists with that email AND their role is already "admin"
 *   AND the stored hash still matches the configured password → no-op.
 * - If a user exists with that email but their role is "user" → the script
 *   STOPS and reports the conflict. It does NOT silently promote a normal user.
 *   To convert an existing normal user to admin, the DBA must do so manually
 *   and consciously in the MongoDB Atlas console or via a separate migration.
 * - If a user exists with role "admin" but the password has changed in the
 *   environment → updates the hash (credential rotation).
 *
 * ## Running repeatedly
 * Safe to run on every deployment — the idempotency check prevents duplicates
 * and unwanted promotions.
 *
 * ## Credential changes
 * Change ADMIN_PASSWORD in the environment and re-run the script. The stored
 * hash will be updated. The admin must log in again after the change.
 *
 * ## Security
 * - Admin credentials are read from environment variables only.
 * - The plain-text password is never logged or stored.
 * - bcryptjs is used for hashing (saltRounds = 12).
 */

import dotenv from "dotenv";
import path from "path";

// Load .env from the project root (where the script is usually run from).
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// Also try .env.local as a fallback (Next.js convention).
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../src/lib/db";
import User from "../src/models/User";

const SALT_ROUNDS = 12;

async function seedAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(
      "[seed-admin] MONGODB_URI is not set. Add it to .env or .env.local."
    );
    process.exit(1);
  }
  if (!adminEmail) {
    console.error(
      "[seed-admin] ADMIN_EMAIL is not set. Add it to .env or .env.local."
    );
    process.exit(1);
  }
  if (!adminPassword) {
    console.error(
      "[seed-admin] ADMIN_PASSWORD is not set. Add it to .env or .env.local."
    );
    process.exit(1);
  }

  console.log("[seed-admin] Connecting to MongoDB...");
  await connectDB();
  console.log("[seed-admin] Connected.");

  const existing = await User.findOne({ email: adminEmail }).select(
    "+passwordHash"
  );

  if (!existing) {
    // No user with this email — create fresh admin.
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    await User.create({ email: adminEmail, passwordHash, role: "admin" });
    console.log(`[seed-admin] Admin account created: ${adminEmail}`);
  } else if (existing.role !== "admin") {
    // An account exists but it is a normal user — do NOT promote silently.
    console.error(
      `[seed-admin] A normal user account already exists for ${adminEmail}. ` +
        "This script will not silently promote a normal user to admin. " +
        "Promote the user manually in the MongoDB Atlas console if intended."
    );
    await mongoose.disconnect();
    process.exit(1);
  } else {
    // Admin account already exists — check if password has changed.
    const passwordMatches = await bcrypt.compare(
      adminPassword,
      existing.passwordHash
    );
    if (passwordMatches) {
      console.log(
        `[seed-admin] Admin account already exists and password is unchanged: ${adminEmail}`
      );
    } else {
      // Password changed in the environment — rotate the hash.
      const newHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      await User.updateOne(
        { _id: existing._id },
        { $set: { passwordHash: newHash } }
      );
      console.log(
        `[seed-admin] Admin password hash updated for: ${adminEmail}`
      );
    }
  }

  await mongoose.disconnect();
  console.log("[seed-admin] Done.");
}

seedAdmin().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[seed-admin] Fatal error:", message);
  process.exit(1);
});
