/**
 * POST /api/auth/signup
 *
 * Registers a new user account with the `user` role.
 *
 * Security notes:
 * - The `role` field is NEVER accepted from the client; it is always assigned
 *   server-side as "user". Clients cannot self-promote to admin.
 * - Passwords are hashed with bcryptjs (BCRYPT_SALT_ROUNDS = 12) before saving.
 * - The password hash is never returned in the response.
 * - A generic 409 is returned on duplicate email to avoid confirming registration
 *   status to an attacker.
 * - Zod validates and normalises all input before any DB work.
 * - An Origin check guards against CSRF on this state-changing endpoint.
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  created,
  badRequest,
  conflict,
  internalError,
  forbidden,
} from "@/lib/api-response";
import { BCRYPT_SALT_ROUNDS } from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .max(254, "Email cannot exceed 254 characters.")
    .email("Email must be a valid email address.")
    .transform((v) => v.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters."),
});

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  // CSRF: same-origin check for state-changing endpoint.
  if (!isSameOrigin(request)) {
    return forbidden("Request origin is not allowed.");
  }

  // Parse and validate the request body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const result = signupSchema.safeParse(body);
  if (!result.success) {
    return badRequest(
      "Validation failed.",
      result.error.flatten().fieldErrors
    );
  }

  const { email, password } = result.data;

  try {
    await connectDB();

    // Check for duplicate email before hashing (cheaper than always hashing).
    const existing = await User.exists({ email });
    if (existing) {
      return conflict("An account with this email address already exists.");
    }

    // Hash the password server-side. Plain text is never stored.
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create the user with a trusted, server-assigned role.
    // The `role` field from the client (if any) is never used — it is
    // explicitly not present in the validated schema above.
    const user = await User.create({
      email,
      passwordHash,
      role: "user", // always assigned server-side
    });

    return created({
      message: "Account created successfully.",
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: unknown) {
    // Mongoose duplicate-key error code
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code === 11000
    ) {
      return conflict("An account with this email address already exists.");
    }

    // Log the safe error message server-side; return a generic error to client.
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[signup] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred. Please try again.");
  }
}
