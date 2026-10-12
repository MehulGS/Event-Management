import React, { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { EventFilters } from "@/components/ui/EventFilters";
import { EventsGrid } from "@/components/EventsGrid";
import { EventCardSkeleton } from "@/components/ui/EventCardSkeleton";

export const metadata: Metadata = {
  title: "Browse Events",
  description:
    "Discover active upcoming community events. Filter by category, city, or keyword.",
};

function GridSkeleton() {
  return (
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
  );
}

/**
 * Events listing page — /events
 *
 * Layout:
 * - Mobile: filters stacked above event grid
 * - Desktop: sidebar filters on the left, event grid on the right
 *
 * Filter state lives in URL query parameters so:
 * - filters are preserved on page refresh and when sharing links
 * - pagination interacts correctly with filters
 * - server-side rendering is possible for initial loads
 */
export default function EventsPage() {
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
        <div style={{ marginBottom: "var(--space-8)" }}>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: "0 0 var(--space-2) 0",
            }}
          >
            Browse events
          </h1>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              margin: 0,
            }}
          >
            Active, upcoming community events — sorted by nearest date first.
          </p>
        </div>

        {/*
          Responsive two-column layout.
          Mobile  (< 768px): single column — filters stack above the grid.
          Desktop (≥ 768px): 300px sidebar on the left, grid on the right.

          The aside uses position:sticky on desktop only. On mobile it is
          static so it flows normally above the event grid, preventing any
          overlap between the filter panel and the first event card.
        */}
        <style>{`
          .events-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: var(--space-6);
            align-items: start;
          }
          .events-layout-aside {
            position: static;
          }
          @media (min-width: 768px) {
            .events-layout {
              grid-template-columns: 300px 1fr;
              gap: var(--space-8);
            }
            .events-layout-aside {
              position: sticky;
              top: 80px;
            }
          }
        `}</style>

        <div className="events-layout">
          {/* Filters sidebar */}
          <aside aria-label="Event filters" className="events-layout-aside">
            <Suspense fallback={null}>
              <EventFilters />
            </Suspense>
          </aside>

          {/* Events grid */}
          <section aria-label="Event listings">
            <Suspense fallback={<GridSkeleton />}>
              <EventsGrid />
            </Suspense>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
