"use client";

/**
 * Client-only section for event detail pages.
 * Wraps ReminderButton and CardDesigner which require client-side rendering.
 * This component is dynamically imported by the Server Component page
 * without ssr:false issues.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import type { PublicEvent } from "@/lib/api-types";
import { useAuth } from "@/hooks/useAuth";

const ReminderButton = dynamic(
  () => import("@/components/ReminderButton").then((m) => m.ReminderButton),
  { ssr: false }
);

const CardDesigner = dynamic(
  () => import("@/components/CardDesigner").then((m) => m.CardDesigner),
  { ssr: false }
);

interface EventDetailClientSectionProps {
  event: PublicEvent;
}

/**
 * ReminderButtonWrapper — renders the reminder button section.
 * Exported separately so it can be slotted into the sidebar.
 */
export function ReminderButtonWrapper({ eventId, eventTitle }: { eventId: string; eventTitle: string }) {
  return <ReminderButton eventId={eventId} eventTitle={eventTitle} />;
}

/**
 * GuestCTAs — shows signup/login links only to unauthenticated visitors.
 * Hidden while auth state is loading, and not shown to logged-in users.
 */
export function GuestCTAs() {
  const { user, loading } = useAuth();

  // While loading or already authenticated, render nothing.
  if (loading || user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <Link
        href="/signup"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", padding: "var(--space-3) var(--space-6)", backgroundColor: "var(--color-accent-primary)", color: "var(--color-text-inverse)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 700, textDecoration: "none", boxShadow: "var(--shadow-raised)", textAlign: "center" }}
      >
        Sign up to set reminder
      </Link>
      <Link
        href="/login"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-3) var(--space-6)", backgroundColor: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 600, textDecoration: "none", textAlign: "center" }}
      >
        Already have an account? Log in
      </Link>
    </div>
  );
}

/**
 * CardDesignerWrapper — renders the full card designer section below the detail card.
 */
export function CardDesignerWrapper({ event }: EventDetailClientSectionProps) {
  return <CardDesigner event={event} />;
}
