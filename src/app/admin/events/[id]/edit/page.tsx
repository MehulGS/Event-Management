"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface AdminEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  date: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}

export default function AdminEditEventPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/events/${id}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json();
          setError(json.error?.message ?? "Failed to load event.");
          return;
        }
        const json = await res.json();
        const found = json.data as AdminEvent | undefined;
        if (!found) {
          setError("Event not found.");
        } else {
          setEvent(found);
        }
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "var(--space-8) var(--space-4) var(--space-16)",
      }}
    >
      {/* Back */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/admin"
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
          }}
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>

      {/* Heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-8)",
        }}
      >
        <Pencil size={28} color="var(--color-accent-primary)" aria-hidden="true" />
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Edit event
          {event && (
            <span
              style={{
                fontSize: "var(--text-base)",
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                marginLeft: "var(--space-3)",
              }}
            >
              — {event.title}
            </span>
          )}
        </h1>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "var(--space-16)" }}
          role="status"
          aria-label="Loading event"
        >
          <Loader2
            size={32}
            color="var(--color-accent-primary)"
            style={{ animation: "spin 1s linear infinite" }}
            aria-hidden="true"
          />
          <span className="sr-only">Loading event…</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : event ? (
        <div
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-raised)",
            padding: "var(--space-8)",
          }}
        >
          <EventForm
            mode="edit"
            eventId={event.id}
            initial={{
              title: event.title,
              description: event.description,
              category: event.category as import("@/types").EventCategory,
              city: event.city,
              date: event.date,
              price: String(event.price),
              imageUrl: event.imageUrl,
              isActive: event.isActive,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
