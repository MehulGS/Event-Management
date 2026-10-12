"use client";

/**
 * Admin Dashboard — /admin
 *
 * Shows a summary of all events (active/inactive counts) and links to event
 * management. Data is fetched from GET /api/admin/events.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, CheckCircle2, XCircle, LayoutDashboard, Loader2 } from "lucide-react";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { EventCategory } from "@/types";

interface AdminEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  date: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminEventsResponse {
  success: boolean;
  data: AdminEvent[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<AdminEvent | null>(null);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/events?limit=50", { credentials: "include" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message ?? "Failed to load events.");
        return;
      }
      const json: AdminEventsResponse = await res.json();
      setEvents(json.data);
      setTotal(json.pagination.total);
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
        const res = await fetch("/api/admin/events?limit=50", { credentials: "include" });
        if (!active) return;
        if (!res.ok) {
          const json = await res.json();
          if (active) setError(json.error?.message ?? "Failed to load events.");
          return;
        }
        const json: AdminEventsResponse = await res.json();
        if (active) {
          setEvents(json.data);
          setTotal(json.pagination.total);
        }
      } catch {
        if (active) setError("Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function toggleStatus(event: AdminEvent) {
    setConfirmToggle(null);
    setToggling(event.id);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/events/${event.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !event.isActive }),
      });
      const json = await res.json();
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, isActive: !event.isActive } : e))
        );
        setStatusMsg({
          id: event.id,
          text: event.isActive ? "Event deactivated." : "Event activated.",
          ok: true,
        });
      } else {
        setStatusMsg({ id: event.id, text: json.error?.message ?? "Failed to update status.", ok: false });
      }
    } catch {
      setStatusMsg({ id: event.id, text: "Network error.", ok: false });
    } finally {
      setToggling(null);
    }
  }

  const activeCount = events.filter((e) => e.isActive).length;
  const inactiveCount = events.filter((e) => !e.isActive).length;

  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "var(--space-8) var(--space-4) var(--space-16)",
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
          <LayoutDashboard size={28} color="var(--color-accent-primary)" aria-hidden="true" />
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Admin Dashboard
          </h1>
        </div>
        <Link
          href="/admin/events/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-5)",
            backgroundColor: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          <Plus size={16} aria-hidden="true" />
          New Event
        </Link>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        {[
          { label: "Total Events", value: total, color: "var(--color-accent-primary)" },
          { label: "Active", value: activeCount, color: "#065F46" },
          { label: "Inactive", value: inactiveCount, color: "#991B1B" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-raised)",
              padding: "var(--space-6)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {label}
            </span>
            <span style={{ fontSize: "var(--text-3xl)", fontWeight: 700, color }}>
              {loading ? "–" : value}
            </span>
          </div>
        ))}
      </div>

      {/* Events table / list */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "var(--space-16)",
          }}
          role="status"
          aria-label="Loading events"
        >
          <Loader2
            size={32}
            color="var(--color-accent-primary)"
            style={{ animation: "spin 1s linear infinite" }}
            aria-hidden="true"
          />
          <span className="sr-only">Loading events…</span>
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-raised)",
            padding: "var(--space-16)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>
            No events yet
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "var(--space-2)" }}>
            Create your first event to get started.
          </p>
          <Link
            href="/admin/events/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              marginTop: "var(--space-6)",
              padding: "var(--space-3) var(--space-6)",
              backgroundColor: "var(--color-accent-primary)",
              color: "var(--color-text-inverse)",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Create first event
          </Link>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-raised)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "var(--text-sm)",
              }}
              aria-label="Events list"
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--color-bg-sunken)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {["Title", "Category", "City", "Date", "Price", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: event.isActive ? "transparent" : "rgba(252,165,165,0.07)",
                    }}
                  >
                    {/* Title */}
                    <td
                      style={{
                        padding: "var(--space-3) var(--space-4)",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        maxWidth: 200,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <CategoryBadge category={event.category as EventCategory} />
                    </td>

                    {/* City */}
                    <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                      {event.city}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
                      {formatDate(event.date)}
                    </td>

                    {/* Price */}
                    <td style={{ padding: "var(--space-3) var(--space-4)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {formatINR(event.price)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "var(--space-1)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          padding: "2px var(--space-2)",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: event.isActive ? "#D1FAE5" : "#FEE2E2",
                          color: event.isActive ? "#065F46" : "#991B1B",
                        }}
                      >
                        {event.isActive ? (
                          <CheckCircle2 size={12} aria-hidden="true" />
                        ) : (
                          <XCircle size={12} aria-hidden="true" />
                        )}
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                      {statusMsg?.id === event.id && (
                        <span
                          role="status"
                          style={{
                            display: "block",
                            fontSize: "var(--text-xs)",
                            color: statusMsg.ok ? "#065F46" : "#991B1B",
                            marginTop: 2,
                          }}
                        >
                          {statusMsg.text}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "var(--space-3) var(--space-4)", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "var(--space-2)" }}>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: 600,
                            color: "var(--color-accent-primary)",
                            textDecoration: "none",
                            padding: "var(--space-1) var(--space-3)",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            backgroundColor: "var(--color-bg-surface)",
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmToggle(event)}
                          disabled={toggling === event.id}
                          aria-label={event.isActive ? `Deactivate ${event.title}` : `Activate ${event.title}`}
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: 600,
                            color: event.isActive ? "#991B1B" : "#065F46",
                            padding: "var(--space-1) var(--space-3)",
                            borderRadius: "var(--radius-sm)",
                            border: `1px solid ${event.isActive ? "var(--color-accent-danger)" : "#A7F3D0"}`,
                            backgroundColor: event.isActive ? "#FEF2F2" : "#ECFDF5",
                            cursor: toggling === event.id ? "not-allowed" : "pointer",
                            opacity: toggling === event.id ? 0.7 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "var(--space-1)",
                          }}
                        >
                          {toggling === event.id && (
                            <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
                          )}
                          {event.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmToggle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(45,27,78,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
            zIndex: 100,
          }}
          onClick={() => setConfirmToggle(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-raised-lg)",
              padding: "var(--space-8)",
              maxWidth: 420,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            <h2
              id="confirm-title"
              style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}
            >
              {confirmToggle.isActive ? "Deactivate event?" : "Activate event?"}
            </h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", margin: 0 }}>
              {confirmToggle.isActive
                ? `"${confirmToggle.title}" will be hidden from the public listing.`
                : `"${confirmToggle.title}" will become visible to the public.`}
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmToggle(null)}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-surface)",
                  color: "var(--color-text-secondary)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "var(--text-sm)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => toggleStatus(confirmToggle)}
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid transparent",
                  backgroundColor: confirmToggle.isActive ? "var(--color-accent-danger)" : "var(--color-accent-primary)",
                  color: confirmToggle.isActive ? "#7F1D1D" : "var(--color-text-inverse)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "var(--text-sm)",
                  boxShadow: "var(--shadow-raised)",
                }}
              >
                {confirmToggle.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
