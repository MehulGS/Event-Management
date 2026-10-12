/**
 * Server Component — fetches featured/upcoming events from the public API
 * and renders them as EventCards. No client-side JavaScript needed.
 */

import React from "react";
import Link from "next/link";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { EventsListResponse } from "@/lib/api-types";

interface FeaturedEventsProps {
  /** Maximum number of events to display */
  limit?: number;
}

async function fetchFeaturedEvents(limit: number): Promise<EventsListResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/events?limit=${limit}&page=1`,
      {
        // Revalidate at most once per 60 seconds (ISR-style)
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return null;
    return (await res.json()) as EventsListResponse;
  } catch {
    return null;
  }
}

export async function FeaturedEvents({ limit = 3 }: FeaturedEventsProps) {
  const result = await fetchFeaturedEvents(limit);

  if (!result) {
    return (
      <div
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          padding: "var(--space-8)",
        }}
      >
        <EmptyState
          icon="⚠️"
          heading="Couldn't load events"
          subtext="The events list is temporarily unavailable. Please check back shortly."
        />
      </div>
    );
  }

  const events = result.data;

  if (events.length === 0) {
    return (
      <EmptyState
        icon="📅"
        heading="No upcoming events yet"
        subtext="Check back soon — administrators post new events regularly."
        actionLabel="Browse all events"
        actionHref="/events"
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
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
          View all events →
        </Link>
      </div>
    </div>
  );
}
