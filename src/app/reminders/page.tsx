"use client";

/**
 * My Reminders page — /reminders
 *
 * Shows all events the authenticated user has saved a reminder for.
 * Users can remove reminders from this page.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, BellOff, Loader2, MapPin, Calendar, Ticket } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { buildEventSlug } from "@/lib/slug";
import type { EventCategory } from "@/types";

interface ReminderItem {
  reminderId: string;
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    city: string;
    date: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
  };
  savedAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatINR(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price);
}

function isEventPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export default function RemindersPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeMsg, setRemoveMsg] = useState<{ eventId: string; text: string; ok: boolean } | null>(null);

  async function fetchReminders() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reminders", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/login?next=/reminders");
        return;
      }
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to load reminders.");
        return;
      }
      const json = await res.json();
      setReminders(json.data ?? []);
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
        const res = await fetch("/api/reminders", { credentials: "include" });
        if (!active) return;
        if (res.status === 401) {
          router.replace("/login?next=/reminders");
          return;
        }
        if (!res.ok) {
          const json = await res.json();
          if (active) setError(json.error?.message ?? "Failed to load reminders.");
          return;
        }
        const json = await res.json();
        if (active) setReminders(json.data ?? []);
      } catch {
        if (active) setError("Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function removeReminder(eventId: string) {
    if (removing) return;
    setRemoving(eventId);
    setRemoveMsg(null);

    // Optimistic update.
    setReminders((prev) => prev.filter((r) => r.event.id !== eventId));

    try {
      const res = await fetch(`/api/reminders/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setRemoveMsg({ eventId, text: "Reminder removed.", ok: true });
      } else {
        // Roll back on failure.
        await fetchReminders();
        const json = await res.json();
        setRemoveMsg({ eventId, text: json.error?.message ?? "Failed to remove reminder.", ok: false });
      }
    } catch {
      await fetchReminders();
      setRemoveMsg({ eventId, text: "Network error.", ok: false });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "var(--space-8) var(--space-4) var(--space-16)",
          flex: 1,
        }}
      >
        {/* Heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-2)",
          }}
        >
          <Bell size={28} color="var(--color-accent-primary)" aria-hidden="true" />
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            My Reminders
          </h1>
        </div>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            margin: "0 0 var(--space-8)",
            lineHeight: 1.6,
          }}
        >
          Events you&apos;ve saved as reminders. Remove them here or visit the event detail page.
        </p>

        {/* Global status */}
        {removeMsg && (
          <div
            role={removeMsg.ok ? "status" : "alert"}
            aria-live="polite"
            style={{
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${removeMsg.ok ? "#A7F3D0" : "var(--color-accent-danger)"}`,
              backgroundColor: removeMsg.ok ? "#D1FAE5" : "#FEF2F2",
              marginBottom: "var(--space-4)",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: removeMsg.ok ? "#065F46" : "#991B1B",
            }}
          >
            {removeMsg.text}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: "var(--space-16)" }}
            role="status"
            aria-label="Loading reminders"
          >
            <Loader2
              size={32}
              color="var(--color-accent-primary)"
              style={{ animation: "spin 1s linear infinite" }}
              aria-hidden="true"
            />
            <span className="sr-only">Loading reminders…</span>
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchReminders} />
        ) : reminders.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            heading="No reminders yet"
            subtext="Browse events and save reminders so you don't miss anything."
            actionLabel="Browse events"
            actionHref="/events"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {reminders.map(({ reminderId, event, savedAt }) => {
              const past = isEventPast(event.date);
              return (
                <article
                  key={reminderId}
                  aria-label={`Reminder: ${event.title}`}
                  style={{
                    backgroundColor: "var(--color-bg-surface)",
                    border: `1px solid ${past ? "var(--color-accent-danger)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-raised)",
                    overflow: "hidden",
                    opacity: past ? 0.75 : 1,
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      width: 120,
                      flexShrink: 0,
                      backgroundColor: "var(--color-bg-sunken)",
                    }}
                    className="reminder-img"
                  >
                    <style>{`@media (max-width: 480px) { .reminder-img { display: none !important; } }`}</style>
                    <Image
                      src={event.imageUrl}
                      alt=""
                      fill
                      sizes="120px"
                      style={{ objectFit: "cover" }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      padding: "var(--space-5) var(--space-6)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-3)",
                    }}
                  >
                    {/* Top row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "var(--space-3)",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                        <CategoryBadge category={event.category as EventCategory} />
                        {past && (
                          <span
                            style={{
                              fontSize: "var(--text-xs)",
                              fontWeight: 600,
                              color: "#991B1B",
                              backgroundColor: "#FEE2E2",
                              padding: "2px var(--space-2)",
                              borderRadius: "var(--radius-sm)",
                              display: "inline-block",
                            }}
                          >
                            This event has passed
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeReminder(event.id)}
                        disabled={removing === event.id}
                        aria-label={`Remove reminder for ${event.title}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-1)",
                          padding: "var(--space-1) var(--space-3)",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--color-accent-danger)",
                          backgroundColor: "#FEF2F2",
                          color: "#991B1B",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          cursor: removing === event.id ? "not-allowed" : "pointer",
                          opacity: removing === event.id ? 0.6 : 1,
                          flexShrink: 0,
                        }}
                      >
                        {removing === event.id ? (
                          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
                        ) : (
                          <BellOff size={12} aria-hidden="true" />
                        )}
                        Remove
                      </button>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontSize: "var(--text-lg)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      <Link
                        href={`/events/${buildEventSlug(event.title, event.id)}`}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                      >
                        {event.title}
                      </Link>
                    </h2>

                    {/* Meta */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          fontSize: "var(--text-sm)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <MapPin size={13} aria-hidden="true" />
                        {event.city}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          fontSize: "var(--text-sm)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <Calendar size={13} aria-hidden="true" />
                        <time dateTime={event.date}>{formatDate(event.date)}</time>
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          fontSize: "var(--text-sm)",
                          fontWeight: 600,
                          color: event.price === 0 ? "#065F46" : "var(--color-text-primary)",
                        }}
                      >
                        <Ticket size={13} aria-hidden="true" />
                        {formatINR(event.price)}
                      </span>
                    </div>

                    {/* Saved at */}
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-disabled)",
                        margin: 0,
                      }}
                    >
                      Saved on{" "}
                      {new Date(savedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
