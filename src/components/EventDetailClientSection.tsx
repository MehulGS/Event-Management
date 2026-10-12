"use client";

/**
 * Client-only section for event detail pages.
 * Wraps ReminderButton and CardDesigner which require client-side rendering.
 * This component is dynamically imported by the Server Component page
 * without ssr:false issues.
 */

import dynamic from "next/dynamic";
import type { PublicEvent } from "@/lib/api-types";

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
 * CardDesignerWrapper — renders the full card designer section below the detail card.
 */
export function CardDesignerWrapper({ event }: EventDetailClientSectionProps) {
  return <CardDesigner event={event} />;
}
