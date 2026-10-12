/**
 * Custom not-found UI for /events/[slug].
 * Shown when notFound() is called from the detail page (missing, inactive,
 * past event, or malformed ID / slug).
 */
import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function EventNotFound() {
  return (
    <>
      <SiteHeader />

      <main
        id="main-content"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--space-16) var(--space-4)",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-raised-lg)",
            padding: "var(--space-16) var(--space-8)",
            textAlign: "center",
            maxWidth: 480,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-5)",
          }}
        >
          <div aria-hidden="true" style={{ fontSize: "3.5rem", lineHeight: 1 }}>
            📅
          </div>

          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Event not found
          </h1>

          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              maxWidth: "36ch",
              margin: 0,
            }}
          >
            This event may have ended, been deactivated, or the link may be
            incorrect. Browse all active, upcoming events below.
          </p>

          <Link
            href="/events"
            style={{
              marginTop: "var(--space-2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-8)",
              backgroundColor: "var(--color-accent-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            Browse events
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
