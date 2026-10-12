"use client";

/**
 * My Feed page — /feed
 *
 * Shows a personalised event listing filtered to the user's saved favourite
 * categories. Data is fetched from GET /api/feed.
 * Unauthenticated users are redirected to /login by middleware.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventCard } from "@/components/ui/EventCard";
import { EventCardSkeleton } from "@/components/ui/EventCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { PublicEvent, PaginationMeta } from "@/lib/api-types";

interface FeedResponse {
  success: boolean;
  data: PublicEvent[];
  pagination: PaginationMeta;
}

export default function FeedPage() {
  const router = useRouter();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasPrefs, setHasPrefs] = useState<boolean | null>(null);

  async function fetchFeed(p: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed?page=${p}&limit=12`, { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login?next=/feed");
        return;
      }
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to load feed.");
        return;
      }
      const json: FeedResponse = await res.json();
      setEvents(json.data);
      setPagination(json.pagination);

      // If the feed is empty on page 1, check if the user has preferences.
      if (p === 1 && json.data.length === 0) {
        const prefRes = await fetch("/api/favourites", { credentials: "include" });
        if (prefRes.ok) {
          const prefJson = await prefRes.json();
          const cats = prefJson.data?.favouriteCategories ?? [];
          setHasPrefs(cats.length > 0);
        } else {
          setHasPrefs(false);
        }
      } else {
        setHasPrefs(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/feed?page=${page}&limit=12`, { credentials: "include" });
        if (!active) return;
        if (res.status === 401) {
          router.replace("/login?next=/feed");
          return;
        }
        if (!res.ok) {
          const json = await res.json();
          if (active) setError(json.error?.message ?? "Failed to load feed.");
          return;
        }
        const json: FeedResponse = await res.json();
        if (!active) return;
        setEvents(json.data);
        setPagination(json.pagination);
        if (page === 1 && json.data.length === 0) {
          const prefRes = await fetch("/api/favourites", { credentials: "include" });
          if (!active) return;
          if (prefRes.ok) {
            const prefJson = await prefRes.json();
            const cats = prefJson.data?.favouriteCategories ?? [];
            if (active) setHasPrefs(cats.length > 0);
          } else {
            if (active) setHasPrefs(false);
          }
        } else {
          if (active) setHasPrefs(true);
        }
      } catch {
        if (active) setError("Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
        {/* Page heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            marginBottom: "var(--space-8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Sparkles size={28} color="var(--color-accent-primary)" aria-hidden="true" />
            <div>
              <h1
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                My Feed
              </h1>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  margin: "var(--space-1) 0 0",
                }}
              >
                Events personalised to your favourite categories
              </p>
            </div>
          </div>
          <Link
            href="/favorites"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-2) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg-surface)",
              color: "var(--color-text-secondary)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            Edit preferences
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "var(--space-6)",
            }}
            aria-label="Loading events"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={() => fetchFeed(page)} />
        ) : events.length === 0 ? (
          hasPrefs === false ? (
            <EmptyState
              icon={<Search />}
              heading="No favourite categories set"
              subtext="Select at least one category to personalise your feed."
              actionLabel="Set my favourites"
              actionHref="/favorites"
            />
          ) : (
            <EmptyState
              icon="🎉"
              heading="No events match your preferences"
              subtext="There are no upcoming events in your selected categories right now. Check back soon or explore all events."
              actionLabel="Browse all events"
              actionHref="/events"
            />
          )
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "var(--space-6)",
              }}
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <nav
                aria-label="Feed pagination"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-10)",
                }}
              >
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  aria-label="Previous page"
                  style={{
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-surface)",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                    cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                    opacity: pagination.hasPrevPage ? 1 : 0.5,
                    fontSize: "var(--text-sm)",
                    boxShadow: "var(--shadow-raised)",
                  }}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  aria-label="Next page"
                  style={{
                    padding: "var(--space-2) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-surface)",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                    cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                    opacity: pagination.hasNextPage ? 1 : 0.5,
                    fontSize: "var(--text-sm)",
                    boxShadow: "var(--shadow-raised)",
                  }}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
