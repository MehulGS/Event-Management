/**
 * Mongoose model for the `users` collection.
 *
 * Schema decisions follow docs/DATABASE.md. Key points:
 * - `email` is unique, lowercased, and trimmed.
 * - `passwordHash` is excluded from the default JSON output via `toJSON`
 *   transform — never expose hashed passwords in API responses.
 * - Plain-text passwords are NEVER stored; bcryptjs hashing happens in the
 *   auth service layer (not in this model).
 * - `favouriteCategories` is validated against the same EVENT_CATEGORIES enum.
 * - The model is registered safely for Next.js hot-reload using the
 *   `mongoose.models` reuse pattern.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import {
  EVENT_CATEGORIES,
  USER_ROLES,
  type EventCategory,
  type UserRole,
} from "@/types";

// ---------------------------------------------------------------------------
// Document interface
// ---------------------------------------------------------------------------

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  favouriteCategories: EventCategory[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters."],
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Email must be a valid email address.",
      },
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: USER_ROLES as unknown as string[],
        message: `Role must be one of: ${USER_ROLES.join(", ")}.`,
      },
      default: "user",
    },
    favouriteCategories: {
      type: [String],
      enum: {
        values: EVENT_CATEGORIES as unknown as string[],
        message: `Each favourite category must be one of: ${EVENT_CATEGORIES.join(", ")}.`,
      },
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      /**
       * Strip `passwordHash` from any JSON serialisation so it is never
       * accidentally included in an API response.
       */
      transform(_doc, ret: Record<string, unknown>) {
        delete ret["passwordHash"];
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Unique index on email is declared on the field itself (unique: true).
// An explicit index definition is added here for documentation clarity
// and to allow creating a sparse option in future if needed.
// Note: Mongoose creates the unique index automatically from the field
// definition; this explicit call is intentional for visibility.
userSchema.index({ email: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Model registration (safe for Next.js hot reloads)
// ---------------------------------------------------------------------------

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema);

export default User;
