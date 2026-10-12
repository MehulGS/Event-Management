/**
 * GET /api/health
 *
 * Returns the application and database connection status.
 * No authentication is required.
 *
 * Healthy (HTTP 200):
 *   {
 *     "success": true,
 *     "message": "Service is healthy",
 *     "database": { "connected": true, "name": "community_events_board" }
 *   }
 *
 * Degraded (HTTP 503):
 *   {
 *     "success": false,
 *     "message": "Database is unavailable",
 *     "database": { "connected": false, "name": null }
 *   }
 *
 * This endpoint deliberately omits stack traces, connection strings, and any
 * other sensitive information from its responses.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { ok, serviceUnavailable } from "@/lib/api-response";

export async function GET(): Promise<Response> {
  try {
    await connectDB();

    // Mongoose readyState: 0 = disconnected, 1 = connected, 2 = connecting,
    // 3 = disconnecting. Only 1 is considered healthy.
    const isConnected = mongoose.connection.readyState === 1;
    const dbName = mongoose.connection.db?.databaseName ?? null;

    if (!isConnected) {
      return serviceUnavailable("Database is unavailable");
    }

    return ok({
      message: "Service is healthy",
      database: {
        connected: true,
        name: dbName,
      },
    });
  } catch (error: unknown) {
    // Log the error server-side for diagnostics, but never return the raw
    // error message — it may contain the connection string or credentials.
    const safeMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[health] Database connection error:", safeMessage);

    return serviceUnavailable("Database is unavailable");
  }
}
