/**
 * Shared TypeScript interfaces and constants used across models, services,
 * and API routes. Keep this file free of Mongoose-specific imports so it
 * can be safely imported in both server and client contexts.
 */

import type { Types } from "mongoose";

// ---------------------------------------------------------------------------
// Enums / constant arrays
// ---------------------------------------------------------------------------

/** The five allowed event categories. */
export const EVENT_CATEGORIES = [
  "Music",
  "Workshop",
  "Food",
  "Sports",
  "Kids",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** User roles. */
export const USER_ROLES = ["admin", "user"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** The five card themes defined in docs/DESIGN-SYSTEM.md. */
export const CARD_THEMES = [
  "pastel-cloud",
  "sunset-peach",
  "mint-fresh",
  "sky-blue",
  "lilac-dream",
] as const;

export type CardTheme = (typeof CARD_THEMES)[number];

/**
 * The five allowed sticker values.
 * One sticker per category, keeping the set small and deterministic.
 */
export const CARD_STICKERS = ["🎵", "🌟", "🎉", "🏆", "🍕"] as const;

export type CardSticker = (typeof CARD_STICKERS)[number];

/** Maximum stickers per card design. */
export const MAX_STICKERS = 3;

/** Font style options for card designs. */
export const FONT_STYLES = ["rounded", "serif", "mono"] as const;

export type FontStyle = (typeof FONT_STYLES)[number];

// ---------------------------------------------------------------------------
// Document interface shapes (mirrors Mongoose documents without Mongoose types)
// ---------------------------------------------------------------------------

/** Lean representation of an Event document. */
export interface IEventDocument {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: EventCategory;
  city: string;
  date: Date;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Lean representation of a User document. */
export interface IUserDocument {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  favouriteCategories: EventCategory[];
  createdAt: Date;
  updatedAt: Date;
}

/** Lean representation of a Reminder document. */
export interface IReminderDocument {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  createdAt: Date;
}

/** Lean representation of a CardDesign document. */
export interface ICardDesignDocument {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  theme: CardTheme;
  stickers: string[];
  createdAt: Date;
  updatedAt: Date;
}
