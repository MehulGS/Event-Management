/**
 * Client-safe API response types.
 * These mirror the shapes returned by the backend route handlers.
 * No Mongoose or server-only imports — safe for client components.
 */

import type { EventCategory, CardTheme, CardSticker } from "@/types";

/** A single public event as returned by GET /api/events or GET /api/events/:id */
export interface PublicEvent {
  id: string;
  /** URL-safe slug — the sole segment used in public event URLs (/events/<slug>). */
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  city: string;
  date: string;        // ISO 8601 string
  price: number;       // INR; 0 = free
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Pagination metadata returned with list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Shape of GET /api/events response */
export interface EventsListResponse {
  success: true;
  data: PublicEvent[];
  pagination: PaginationMeta;
}

/** Shape of GET /api/events/:id response */
export interface EventDetailResponse {
  success: true;
  data: PublicEvent;
}

/** Query parameters accepted by GET /api/events */
export interface EventsQueryParams {
  page?: number;
  limit?: number;
  category?: EventCategory | "";
  city?: string;
  search?: string;
}

/**
 * Build a URL query string from EventsQueryParams.
 * Omits empty / undefined / default values to keep URLs clean.
 */
export function buildEventsQueryString(params: EventsQueryParams): string {
  const qs = new URLSearchParams();

  if (params.page && params.page > 1) qs.set("page", String(params.page));
  if (params.limit && params.limit !== 12) qs.set("limit", String(params.limit));
  if (params.category) qs.set("category", params.category);
  if (params.city?.trim()) qs.set("city", params.city.trim());
  if (params.search?.trim()) qs.set("search", params.search.trim());

  const str = qs.toString();
  return str ? `?${str}` : "";
}

/** Shape of GET /api/auth/me response */
export interface AuthMeResponse {
  success: true;
  user: {
    id: string;
    email: string;
    role: "admin" | "user";
    favouriteCategories: EventCategory[];
    createdAt: string;
  };
}

/** Shape of GET /api/favourites response */
export interface FavouritesResponse {
  success: true;
  data: {
    favouriteCategories: EventCategory[];
  };
}

/** Shape of GET /api/reminders response item */
export interface ReminderItem {
  reminderId: string;
  event: PublicEvent;
  savedAt: string;
}

/** Shape of GET /api/reminders response */
export interface RemindersResponse {
  success: true;
  data: ReminderItem[];
}

/** Shape of GET /api/events/:id/card-design response */
export interface CardDesignResponse {
  success: true;
  data: {
    id?: string;
    eventId?: string;
    theme: CardTheme;
    stickers: CardSticker[];
    createdAt?: string;
    updatedAt?: string;
  };
}

/** Admin event (includes inactive events) */
export interface AdminEvent extends PublicEvent {
  description: string;
}

/** Shape of GET /api/admin/events response */
export interface AdminEventsResponse {
  success: true;
  data: AdminEvent[];
  pagination: PaginationMeta;
}
