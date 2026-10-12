/**
 * Mongoose model for the `reminders` collection.
 *
 * Schema decisions follow docs/DATABASE.md. Key points:
 * - A compound unique index on `{ user, event }` prevents duplicate reminders
 *   for the same user–event pair.
 * - Only `createdAt` is tracked; `updatedAt` is not meaningful for reminders.
 * - References use `Schema.Types.ObjectId` to keep documents small; populate
 *   in queries only when the full related document is needed.
 * - The model is registered safely for Next.js hot-reload using the
 *   `mongoose.models` reuse pattern.
 */

import mongoose, { Schema, Document, Model, Types } from "mongoose";

// ---------------------------------------------------------------------------
// Document interface
// ---------------------------------------------------------------------------

export interface IReminder extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const reminderSchema = new Schema<IReminder>(
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
  },
  {
    // Only track creation time; a reminder is immutable once saved.
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Compound unique index: prevents duplicate user–event reminders.
// Also serves as the primary lookup index when toggling a reminder.
reminderSchema.index({ user: 1, event: 1 }, { unique: true });

// Single-field index: fetch all reminders for a given user efficiently.
reminderSchema.index({ user: 1 });

// ---------------------------------------------------------------------------
// Model registration (safe for Next.js hot reloads)
// ---------------------------------------------------------------------------

const Reminder: Model<IReminder> =
  (mongoose.models.Reminder as Model<IReminder>) ??
  mongoose.model<IReminder>("Reminder", reminderSchema);

export default Reminder;
