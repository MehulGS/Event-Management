/**
 * POST /api/auth/login
 *
 * Authenticates a user with email + password.
 * On success, issues a signed JWT stored in an HTTP-only cookie.
 *
 * Security notes:
 * - A constant-time bcrypt compare is used for password verification.
 * - Both "email not found" and "wrong password" return the same generic 401
 *   message to prevent user enumeration.
 * - The JWT is delivered only via an HTTP-only, SameSite=Strict cookie.
 * - The JWT payload contains only userId and role; no sensitive data.
 * - The role stored in the JWT comes from the database, never from the client.
 * - An Origin check guards against CSRF on this state-changing endpoint.
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  ok,
  badRequest,
  unauthorized,
  internalError,
  forbidden,
} from "@/lib/api-response";
import {
  signToken,
  buildAuthCookie,
  getCookieMaxAge,
} from "@/lib/auth";
import { isSameOrigin } from "@/lib/csrf";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .max(254, "Email cannot exceed 254 characters.")
    .transform((v) => v.toLowerCase().trim()),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password cannot exceed 128 characters."),
});

// Generic message used for both wrong email and wrong password to prevent
// user enumeration.
const INVALID_CREDENTIALS_MSG = "Invalid email address or password.";

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

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return badRequest(
      "Validation failed.",
      result.error.flatten().fieldErrors
    );
  }

  const { email, password } = result.data;

  try {
    await connectDB();

    // Fetch the user including passwordHash (excluded from toJSON by default,
    // so we select it explicitly with `+passwordHash`).
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return unauthorized(INVALID_CREDENTIALS_MSG);
    }

    // Compare the submitted password with the stored hash.
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return unauthorized(INVALID_CREDENTIALS_MSG);
    }

    // Sign the JWT with the role sourced from the database.
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const maxAge = getCookieMaxAge();
    const cookieHeader = buildAuthCookie(token, maxAge);

    // Build the response with the auth cookie header.
    const responseBody = ok({
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    });

    // Clone the response to inject the Set-Cookie header.
    const responseWithCookie = new Response(responseBody.body, {
      status: responseBody.status,
      headers: {
        ...Object.fromEntries(responseBody.headers.entries()),
        "Set-Cookie": cookieHeader,
      },
    });

    return responseWithCookie;
  } catch (error: unknown) {
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[login] Unexpected error:", safeMessage);
    return internalError("An unexpected error occurred. Please try again.");
  }
}
