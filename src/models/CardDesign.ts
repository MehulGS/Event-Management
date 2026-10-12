/**
 * Mongoose model for the `carddesigns` collection.
 *
 * Schema decisions follow docs/DATABASE.md and docs/DESIGN-SYSTEM.md.
 * Key points:
 * - A compound unique index on `{ user, event }` enforces one saved design
 *   per user per event; use `findOneAndUpdate` with `upsert: true` on save.
 * - `theme` is validated against the five themes defined in DESIGN-SYSTEM.md.
 * - `stickers` is validated against the five allowed sticker values and capped
 *   at MAX_STICKERS (3) per design.
 * - The model is registered safely for Next.js hot-reload using the
 *   `mongoose.models` reuse pattern.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  CARD_THEMES,
  CARD_STICKERS,
  MAX_STICKERS,
  type CardTheme,
} from "@/types";

// ---------------------------------------------------------------------------
// Document interface
// ---------------------------------------------------------------------------

export interface ICardDesign extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  theme: CardTheme;
  /** Array of sticker identifiers — max MAX_STICKERS items, from CARD_STICKERS. */
  stickers: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const cardDesignSchema = new Schema<ICardDesign>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required."],
    },
    theme: {
      type: String,
      required: [true, "Theme is required."],
      enum: {
        values: CARD_THEMES as unknown as string[],
        message: `Theme must be one of: ${CARD_THEMES.join(", ")}.`,
      },
      default: "pastel-cloud",
    },
    stickers: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (arr: string[]) => arr.length <= MAX_STICKERS,
          message: `A card design may have at most ${MAX_STICKERS} stickers.`,
        },
        {
          validator: (arr: string[]) =>
            arr.every((s) =>
              (CARD_STICKERS as readonly string[]).includes(s)
            ),
          message: `Each sticker must be one of: ${CARD_STICKERS.join(" ")}.`,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Compound unique index: one design per user per event.
// Use `findOneAndUpdate(..., { upsert: true })` when saving.
cardDesignSchema.index({ user: 1, event: 1 }, { unique: true });

// ---------------------------------------------------------------------------
// Model registration (safe for Next.js hot reloads)
// ---------------------------------------------------------------------------

const CardDesign: Model<ICardDesign> =
  (mongoose.models.CardDesign as Model<ICardDesign>) ??
  mongoose.model<ICardDesign>("CardDesign", cardDesignSchema);

export default CardDesign;
