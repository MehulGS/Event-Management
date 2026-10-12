/**
 * Public event detail page — /events/[slug]
 *
 * URL format: /events/<title-slug>-<24-char-objectid>
 * Example:    /events/coimbatore-jazz-evening-6acd20dbf9be593f89b0e8dd
 *
 * The MongoDB ObjectId is always the last 24 characters of the slug segment.
 * The slug prefix is derived from the event title for readability; it is not
 * used for database lookup (only the ID is). This means:
 *  - Old links with a stale slug continue to resolve (canonical redirect issued).
 *  - Bare ObjectId URLs (/events/<id>) also resolve via redirect.
 *  - Invalid or unresolvable segments return the friendly 404 page.
 *
 * States handled:
 *  - Found + canonical slug → full detail layout
 *  - Found + stale slug     → 301 redirect to canonical URL
 *  - Not found / inactive / past → 404-style "not found" page
 *  - API error → friendly error with back link
 */

export const instant = false;

import { connection } from "next/server";
import { redirect, notFound } from "next/navigation";

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Ticket,
  ArrowLeft,
  Tag,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import {
  ReminderButtonWrapper,
  CardDesignerWrapper,
  GuestCTAs,
} from "@/components/EventDetailClientSection";
import type { EventDetailResponse, PublicEvent } from "@/lib/api-types";
import type { EventCategory } from "@/types";
import { extractIdFromSlug, buildEventSlug, isCanonicalSlug } from "@/lib/slug";

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchEvent(id: string): Promise<PublicEvent | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/events/${id}`, {
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const json: EventDetailResponse = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;

  const id = extractIdFromSlug(slug);
  if (!id) return { title: "Event not found" };

  const event = await fetchEvent(id);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.imageUrl ? [{ url: event.imageUrl }] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatINR(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;

  // Extract the MongoDB ObjectId from the slug segment.
  const id = extractIdFromSlug(slug);
  if (!id) {
    notFound();
  }

  const event = await fetchEvent(id);

  if (!event) {
    notFound();
  }

  // Canonical slug check — redirect if the slug is stale or bare-ID.
  const canonical = buildEventSlug(event.title, event.id);
  if (!isCanonicalSlug(slug, event.title, event.id)) {
    redirect(`/events/${canonical}`);
  }

  const formattedDate = formatEventDate(event.date);
  const formattedPrice = formatINR(event.price);

  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--space-8) var(--space-4) var(--space-16)",
          flex: 1,
        }}
      >
        {/* Back link */}
        <div style={{ marginBottom: "var(--space-6)" }}>
          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textDecoration: "none",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-surface)",
              boxShadow: "var(--shadow-raised)",
              transition: "background-color 150ms ease",
            }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to events
          </Link>
        </div>

        {/* Detail card */}
        <article
          aria-labelledby="event-title"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-raised-lg)",
            overflow: "hidden",
          }}
        >
          {/* Hero image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "21 / 9",
              backgroundColor: "var(--color-bg-sunken)",
              overflow: "hidden",
            }}
          >
            <Image
              src={event.imageUrl}
              alt={`Photo for ${event.title}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              style={{ objectFit: "cover" }}
            />

            {/* Category badge overlay */}
            <div
              style={{
                position: "absolute",
                top: "var(--space-4)",
                left: "var(--space-4)",
              }}
            >
              <CategoryBadge category={event.category as EventCategory} />
            </div>
          </div>

          {/* Content body */}
          <div
            style={{
              padding: "var(--space-8) var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
            }}
            className="event-detail-body"
          >
            <style>{`
              @media (min-width: 768px) {
                .event-detail-body {
                  padding: var(--space-10) var(--space-10) !important;
                }
                .event-detail-grid {
                  display: grid !important;
                  grid-template-columns: 1fr 320px !important;
                  gap: var(--space-10) !important;
                  align-items: start !important;
                }
              }
            `}</style>

            <div className="event-detail-grid" style={{ display: "block" }}>
              {/* Left: title + description */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-6)",
                }}
              >
                {/* Title — the primary user-facing identifier, never the raw ID */}
                <h1
                  id="event-title"
                  style={{
                    fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {event.title}
                </h1>

                {/* Description */}
                <p
                  style={{
                    fontSize: "var(--text-base)",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.75,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {event.description}
                </p>
              </div>

              {/* Right: details card */}
              <aside
                aria-label="Event details"
                style={{
                  backgroundColor: "var(--color-bg-sunken)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  padding: "var(--space-6)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-5)",
                  marginTop: "var(--space-6)",
                  boxShadow: "var(--shadow-inset)",
                }}
                className="event-detail-sidebar"
              >
                <style>{`
                  @media (min-width: 768px) {
                    .event-detail-sidebar {
                      margin-top: 0 !important;
                    }
                  }
                `}</style>

                {/* Date */}
                <div
                  style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-bg-surface)",
                      boxShadow: "var(--shadow-raised)",
                      flexShrink: 0,
                      color: "var(--color-accent-primary)",
                    }}
                  >
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Date &amp; Time
                    </div>
                    <time
                      dateTime={event.date}
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                        lineHeight: 1.4,
                      }}
                    >
                      {formattedDate}
                    </time>
                  </div>
                </div>

                {/* City */}
                <div
                  style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-bg-surface)",
                      boxShadow: "var(--shadow-raised)",
                      flexShrink: 0,
                      color: "var(--color-accent-primary)",
                    }}
                  >
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      City
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 500,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {event.city}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div
                  style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-bg-surface)",
                      boxShadow: "var(--shadow-raised)",
                      flexShrink: 0,
                      color: "var(--color-accent-primary)",
                    }}
                  >
                    <Tag size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Category
                    </div>
                    <CategoryBadge category={event.category as EventCategory} />
                  </div>
                </div>

                {/* Price */}
                <div
                  style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-bg-surface)",
                      boxShadow: "var(--shadow-raised)",
                      flexShrink: 0,
                      color: "var(--color-accent-primary)",
                    }}
                  >
                    <Ticket size={16} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "var(--space-1)",
                      }}
                    >
                      Ticket Price
                    </div>
                    <span
                      style={{
                        fontSize: "var(--text-lg)",
                        fontWeight: 700,
                        color:
                          event.price === 0
                            ? "var(--color-cat-sports-text)"
                            : "var(--color-text-primary)",
                      }}
                    >
                      {formattedPrice}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div
                  aria-hidden="true"
                  style={{
                    height: 1,
                    backgroundColor: "var(--color-border)",
                    margin: "var(--space-1) 0",
                  }}
                />

                {/* Reminder button */}
                <ReminderButtonWrapper eventId={event.id} eventTitle={event.title} />

                {/* Guest CTAs — shown only to unauthenticated visitors */}
                <GuestCTAs />
              </aside>
            </div>
          </div>
        </article>

        {/* Card Designer */}
        <CardDesignerWrapper event={event} />

        {/* Browse more */}
        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <Link
            href="/events"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-8)",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            ← Browse more events
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
