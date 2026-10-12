/**
 * Server-side environment variable validation.
 *
 * Import this module in any server-side code that needs to confirm required
 * variables are present. It throws at call time (not at module load) so that
 * Next.js can still build pages that don't depend on these variables, while
 * any API route that does call validateEnv() will fail fast with a clear
 * message rather than a cryptic "cannot read property of undefined" later.
 *
 * NEVER expose the values of these variables in API responses, logs, or
 * client-side code.
 */

const REQUIRED_SERVER_VARS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
] as const;

type RequiredVar = (typeof REQUIRED_SERVER_VARS)[number];

/**
 * Validates that all required server-side environment variables are defined
 * and non-empty. Throws with a list of missing variable *names* only — never
 * their values.
 */
export function validateEnv(): void {
  const missing: string[] = REQUIRED_SERVER_VARS.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in the values."
    );
  }
}

/**
 * Retrieves a required server-side environment variable.
 * Throws if the variable is not set, naming the key but not any other value.
 */
export function getEnv(key: RequiredVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Environment variable "${key}" is not set. ` +
        "Add it to .env.local before starting the server."
    );
  }
  return value;
}
