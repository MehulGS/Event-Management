
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to .env.local before starting the server."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Prevents buffering commands when the connection is not yet open
        bufferCommands: false,
      })
      .catch((error: unknown) => {
        // Reset so the next request can attempt a fresh connection
        cached.promise = null;
        const message =
          error instanceof Error ? error.message : "Unknown connection error";
        // Do not include the URI — it may contain credentials
        throw new Error(`MongoDB connection failed: ${message}`);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
