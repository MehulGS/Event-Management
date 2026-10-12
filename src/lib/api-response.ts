/**
 * Shared API response helpers.
 *
 * All API routes should use these helpers so every response follows the
 * contract defined in docs/API.md.
 *
 * Success shape:
 *   { "success": true, ...payload }
 *
 * Error shape:
 *   { "error": { "code": string, "message": string, "details"?: unknown } }
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApiSuccessBody<T = unknown> {
  success: true;
  [key: string]: unknown;
  data?: T;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Error codes (mirrors docs/API.md § Error Response Format)
// ---------------------------------------------------------------------------

export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCodeKey = keyof typeof ErrorCode;

// ---------------------------------------------------------------------------
// Success responses
// ---------------------------------------------------------------------------

/**
 * Returns a 200 OK JSON response with the provided payload merged in.
 * The `success: true` field is always added.
 */
export function ok(payload: Record<string, unknown>, status = 200): Response {
  return Response.json({ success: true, ...payload }, { status });
}

/**
 * Returns a 201 Created JSON response.
 */
export function created(payload: Record<string, unknown>): Response {
  return ok(payload, 201);
}

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

/**
 * Returns a structured JSON error response.
 *
 * @param status  HTTP status code
 * @param code    Machine-readable error code (see ErrorCode)
 * @param message Human-readable description — must NOT contain secrets
 * @param details Optional extra context (e.g. Zod field errors)
 */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown
): Response {
  const body: ApiErrorBody = { error: { code, message } };
  if (details !== undefined) {
    body.error.details = details;
  }
  return Response.json(body, { status });
}

export function badRequest(message: string, details?: unknown): Response {
  return errorResponse(400, ErrorCode.VALIDATION_ERROR, message, details);
}

export function unauthorized(
  message = "Authentication is required."
): Response {
  return errorResponse(401, ErrorCode.UNAUTHORIZED, message);
}

export function forbidden(
  message = "You do not have permission to perform this action."
): Response {
  return errorResponse(403, ErrorCode.FORBIDDEN, message);
}

export function notFound(message = "The requested resource was not found."): Response {
  return errorResponse(404, ErrorCode.NOT_FOUND, message);
}

export function conflict(message: string): Response {
  return errorResponse(409, ErrorCode.CONFLICT, message);
}

export function serviceUnavailable(message: string): Response {
  return errorResponse(503, ErrorCode.SERVICE_UNAVAILABLE, message);
}

export function internalError(message = "An unexpected error occurred."): Response {
  return errorResponse(500, ErrorCode.INTERNAL_ERROR, message);
}
