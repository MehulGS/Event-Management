/**
 * Mongoose model for the `events` collection.
 *
 * Schema decisions follow docs/DATABASE.md. Key points:
 * - `isActive` gates all public-facing queries (only active events are shown).
 * - Compound indexes support the primary listing query patterns.
 * - A text index on title + description powers keyword search.
 * - `imageUrl` is required and must be a valid HTTP/HTTPS URL.
 * - `price` is in INR and must be >= 0.
 * - The model is registered safely for Next.js hot-reload using the
 *   `mongoose.models` reuse pattern.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import {
  EVENT_CATEGORIES,
  type EventCategory,
} from "@/types";

// ---------------------------------------------------------------------------
// Document interface
// ---------------------------------------------------------------------------

export interface IEvent extends Document {
  title: string;
  description: string;
  category: EventCategory;
  city: string;
  date: Date;
  /** Price in INR (0 = free event). */
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required."],
      trim: true,
      minlength: [3, "Title must be at least 3 characters."],
      maxlength: [120, "Title cannot exceed 120 characters."],
    },
    description: {
      type: String,
      required: [true, "Event description is required."],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      enum: {
        values: EVENT_CATEGORIES as unknown as string[],
        message: `Category must be one of: ${EVENT_CATEGORIES.join(", ")}.`,
      },
    },
    city: {
      type: String,
      required: [true, "City is required."],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters."],
    },
    date: {
      type: Date,
      required: [true, "Event date is required."],
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required."],
      trim: true,
      validate: {
        validator: (v: string) => /^https?:\/\/.+/.test(v),
        message: "imageUrl must be a valid HTTP or HTTPS URL.",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    // Keeps virtual `id` alongside `_id` for serialisation convenience.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Primary public listing: active events sorted by nearest date.
eventSchema.index({ isActive: 1, date: 1 });

// Category filter on public listing (covers isActive + category + date sort).
eventSchema.index({ category: 1, isActive: 1, date: 1 });

// City filter on public listing.
eventSchema.index({ city: 1, isActive: 1, date: 1 });

// Full-text keyword search across title and description.
eventSchema.index({ title: "text", description: "text" });

// ---------------------------------------------------------------------------
// Model registration (safe for Next.js hot reloads)
// ---------------------------------------------------------------------------

const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ??
  mongoose.model<IEvent>("Event", eventSchema);

export default Event;
