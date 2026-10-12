"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/ui/EventCard";
import { EventCardSkeleton } from "@/components/ui/EventCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Pagination } from "@/components/ui/Pagination";
import type { EventsListResponse, PublicEvent, PaginationMeta } from "@/lib/api-types";
import type { EventCategory } from "@/types";

/**
 * Client component that:
 * 1. Reads filter + pagination state from URL search params.
 * 2. Fetches from GET /api/events with those parameters.
 * 3. Renders the grid, skeletons, empty state, or error state.
 * 4. Handles pagination by updating the URL page parameter.
 */
export function EventsGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read all filter params from the URL
  const page = Number(searchParams.get("page") ?? "1");
  const category = (searchParams.get("category") ?? "") as EventCategory | "";
  const city = searchParams.get("city") ?? "";
  const search = searchParams.get("search") ?? "";
  const limit = 12;

  const [retryCount, setRetryCount] = useState(0);

  const fetchEvents = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams();
      qs.set("page", String(page));
      qs.set("limit", String(limit));
      if (category) qs.set("category", category);
      if (city) qs.set("city", city);
      if (search) qs.set("search", search);

      try {
        const res = await fetch(`/api/events?${qs.toString()}`, {
          cache: "no-store",
        });

        if (cancelled) return;

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message =
            body?.error?.message ?? `Request failed with status ${res.status}.`;
          setError(message);
          setEvents([]);
          setPagination(null);
          return;
        }

        const data: EventsListResponse = await res.json();
        if (!cancelled) {
          setEvents(data.data);
          setPagination(data.pagination);
        }
      } catch {
        if (!cancelled) {
          setError("Could not connect to the events service. Please try again.");
          setEvents([]);
          setPagination(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // retryCount is intentionally included so the manual retry button re-runs this effect
  }, [page, category, city, search, limit, retryCount]);

  function handlePageChange(newPage: number) {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", String(newPage));
    router.push(`${pathname}?${qs.toString()}`, { scroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={fetchEvents}
      />
    );
  }
  if (events.length === 0) {
    const hasFilters = !!(category || city || search);
    return (
      <EmptyState
        icon="🔍"
        heading={hasFilters ? "No events match your filters" : "No upcoming events"}
        subtext={
          hasFilters
            ? "Try adjusting or clearing your filters to see more events."
            : "Check back soon — administrators post new events regularly."
        }
        actionLabel={hasFilters ? "Clear filters" : undefined}
        onActionClick={
          hasFilters
            ? () => router.push(pathname, { scroll: false })
            : undefined
        }
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      {/* Results count */}
      {pagination && (
        <p
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            margin: 0,
          }}
        >
          {pagination.total === 1
            ? "1 event found"
            : `${pagination.total} events found`}
          {(category || city || search) && " for the current filters"}
        </p>
      )}

      {/* Event grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: "var(--space-6)",
        }}
        role="list"
        aria-label="Events"
      >
        {events.map((event) => (
          <div key={event.id} role="listitem">
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
