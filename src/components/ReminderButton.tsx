"use client";

/**
 * ReminderButton — add/remove a reminder for a specific event.
 *
 * Designed to be embedded in the event detail sidebar.
 * Uses optimistic updates with rollback on failure.
 */

import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

interface ReminderButtonProps {
  eventId: string;
  eventTitle: string;
}

type ReminderState = "loading" | "none" | "set" | "error";

export function ReminderButton({ eventId, eventTitle }: ReminderButtonProps) {
  const [state, setState] = useState<ReminderState>("loading");
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load reminder status from the user's reminder list.
  useEffect(() => {
    fetch("/api/reminders", { credentials: "include" })
      .then(async (res) => {
        if (res.status === 401) { setState("error"); return; }
        if (!res.ok) { setState("error"); return; }
        const json = await res.json();
        const found = (json.data ?? []).some(
          (r: { event: { id: string } }) => r.event?.id === eventId
        );
        setState(found ? "set" : "none");
      })
      .catch(() => setState("error"));
  }, [eventId]);

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok });
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setMsg(null), 4000);
  }

  async function toggle() {
    if (working || state === "loading" || state === "error") return;
    setWorking(true);
    const isSet = state === "set";

    // Optimistic update.
    setState(isSet ? "none" : "set");

    try {
      if (isSet) {
        const res = await fetch(`/api/reminders/${eventId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          showMsg("Reminder removed.", true);
        } else {
          setState("set"); // roll back
          const json = await res.json();
          showMsg(json.error?.message ?? "Failed to remove reminder.", false);
        }
      } else {
        const res = await fetch("/api/reminders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });
        if (res.ok || res.status === 409) {
          setState("set");
          showMsg(res.status === 409 ? "Reminder already set." : "Reminder saved!", true);
        } else {
          setState("none"); // roll back
          const json = await res.json();
          showMsg(json.error?.message ?? "Failed to save reminder.", false);
        }
      }
    } catch {
      setState(isSet ? "set" : "none"); // roll back
      showMsg("Network error. Please try again.", false);
    } finally {
      setWorking(false);
    }
  }

  const isSet = state === "set";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <button
        type="button"
        onClick={toggle}
        disabled={working || state === "loading" || state === "error"}
        aria-label={isSet ? `Remove reminder for ${eventTitle}` : `Set reminder for ${eventTitle}`}
        aria-pressed={isSet}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          width: "100%",
          padding: "var(--space-3) var(--space-6)",
          borderRadius: "var(--radius-md)",
          border: `2px solid ${isSet ? "var(--color-accent-primary)" : "var(--color-border)"}`,
          backgroundColor: isSet ? "var(--color-accent-primary)" : "var(--color-bg-surface)",
          color: isSet ? "var(--color-text-inverse)" : "var(--color-text-primary)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          cursor: (working || state === "loading" || state === "error") ? "not-allowed" : "pointer",
          opacity: state === "loading" ? 0.6 : 1,
          boxShadow: "var(--shadow-raised)",
          transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
        }}
      >
        {working ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
        ) : isSet ? (
          <BellRing size={16} aria-hidden="true" />
        ) : state === "loading" ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
        ) : (
          <Bell size={16} aria-hidden="true" />
        )}
        {state === "loading"
          ? "Loading…"
          : working
          ? isSet ? "Removing…" : "Setting…"
          : isSet
          ? "Reminder set"
          : "Set reminder"}
      </button>

      {isSet && !working && (
        <button
          type="button"
          onClick={toggle}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-1)",
            width: "100%",
            padding: "var(--space-2)",
            borderRadius: "var(--radius-md)",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-xs)",
            cursor: "pointer",
          }}
          aria-label={`Remove reminder for ${eventTitle}`}
        >
          <BellOff size={12} aria-hidden="true" />
          Remove reminder
        </button>
      )}

      {/* Feedback message */}
      {msg && (
        <p
          role="status"
          aria-live="polite"
          style={{
            fontSize: "var(--text-xs)",
            color: msg.ok ? "#065F46" : "#991B1B",
            textAlign: "center",
            margin: 0,
          }}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
