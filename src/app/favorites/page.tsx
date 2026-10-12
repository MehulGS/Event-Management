"use client";

/**
 * Favorites / Category Preferences page — /favorites
 *
 * Allows authenticated users to select their favourite event categories.
 * Saved preferences power the personalised My Feed.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { EventCategory } from "@/types";

const CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: "Music", label: "Music", emoji: "🎵" },
  { value: "Workshop", label: "Workshops", emoji: "🛠️" },
  { value: "Food", label: "Food & Drink", emoji: "🍕" },
  { value: "Sports", label: "Sports", emoji: "⚽" },
  { value: "Kids", label: "Kids & Family", emoji: "👶" },
];

// CSS class name → category token colour mapping handled inline via style.
const CAT_COLORS: Record<EventCategory, { bg: string; text: string; selectedBg: string; selectedBorder: string }> = {
  Music: { bg: "#F5F3FF", text: "#5B21B6", selectedBg: "#DDD6FE", selectedBorder: "#7C3AED" },
  Workshop: { bg: "#FFFBEB", text: "#92400E", selectedBg: "#FDE68A", selectedBorder: "#D97706" },
  Food: { bg: "#FFF1F2", text: "#991B1B", selectedBg: "#FCA5A5", selectedBorder: "#DC2626" },
  Sports: { bg: "#ECFDF5", text: "#065F46", selectedBg: "#A7F3D0", selectedBorder: "#059669" },
  Kids: { bg: "#FFF0F6", text: "#9D174D", selectedBg: "#FBCFE8", selectedBorder: "#BE185D" },
};

export default function FavoritesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/favourites", { credentials: "include" });
        if (!active) return;
        if (res.status === 401) {
          router.replace("/login?next=/favorites");
          return;
        }
        if (!res.ok) {
          const json = await res.json();
          if (active) setError(json.error?.message ?? "Failed to load preferences.");
          return;
        }
        const json = await res.json();
        if (active) setSelected(json.data?.favouriteCategories ?? []);
      } catch {
        if (active) setError("Network error. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle category ───────────────────────────────────────────
  function toggle(cat: EventCategory) {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setSaveMsg(null);
  }

  // ── Save preferences ──────────────────────────────────────────
  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/favourites", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favouriteCategories: selected }),
      });
      const json = await res.json();
      if (res.ok) {
        setSaveMsg({ text: "Preferences saved! Your feed is now personalised.", ok: true });
        setSelected(json.data?.favouriteCategories ?? selected);
      } else {
        setSaveMsg({ text: json.error?.message ?? "Failed to save.", ok: false });
      }
    } catch {
      setSaveMsg({ text: "Network error. Please try again.", ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        style={{
          maxWidth: 720,
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
            gap: "var(--space-3)",
            marginBottom: "var(--space-2)",
          }}
        >
          <Heart size={28} color="var(--color-accent-secondary)" aria-hidden="true" />
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Favourite Categories
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
          Choose the event categories you care about. Your personalised{" "}
          <Link href="/feed" style={{ color: "var(--color-accent-primary)", fontWeight: 600, textDecoration: "none" }}>
            My Feed
          </Link>{" "}
          will show only events from these categories.
        </p>

        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: "var(--space-16)" }}
            role="status"
            aria-label="Loading preferences"
          >
            <Loader2
              size={32}
              color="var(--color-accent-primary)"
              style={{ animation: "spin 1s linear infinite" }}
              aria-hidden="true"
            />
            <span className="sr-only">Loading preferences…</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-4)",
              backgroundColor: "#FEF2F2",
              border: "1px solid var(--color-accent-danger)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <AlertCircle size={16} color="#991B1B" aria-hidden="true" />
            <span style={{ fontSize: "var(--text-sm)", color: "#991B1B" }}>{error}</span>
          </div>
        ) : (
          <>
            {/* Category cards */}
            <div
              role="group"
              aria-label="Select favourite categories"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "var(--space-4)",
                marginBottom: "var(--space-8)",
              }}
            >
              {CATEGORIES.map(({ value, label, emoji }) => {
                const isSelected = selected.includes(value);
                const colors = CAT_COLORS[value];
                return (
                  <button
                    key={value}
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggle(value)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-6) var(--space-4)",
                      borderRadius: "var(--radius-card)",
                      border: `2px solid ${isSelected ? colors.selectedBorder : "var(--color-border)"}`,
                      backgroundColor: isSelected ? colors.selectedBg : colors.bg,
                      cursor: "pointer",
                      boxShadow: isSelected ? "var(--shadow-raised-lg)" : "var(--shadow-raised)",
                      transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease",
                      transform: isSelected ? "translateY(-2px)" : "none",
                      position: "relative",
                    }}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: "var(--space-2)",
                          right: "var(--space-2)",
                        }}
                      >
                        <CheckCircle2 size={18} color={colors.text} />
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      style={{ fontSize: "2rem", lineHeight: 1 }}
                    >
                      {emoji}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-sm)",
                        fontWeight: 600,
                        color: colors.text,
                      }}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selection summary */}
            <p
              aria-live="polite"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-6)",
              }}
            >
              {selected.length === 0
                ? "No categories selected — your feed will be empty."
                : `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected: ${selected.join(", ")}.`}
            </p>

            {/* Save feedback */}
            {saveMsg && (
              <div
                role={saveMsg.ok ? "status" : "alert"}
                aria-live="polite"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${saveMsg.ok ? "#A7F3D0" : "var(--color-accent-danger)"}`,
                  backgroundColor: saveMsg.ok ? "#D1FAE5" : "#FEF2F2",
                  marginBottom: "var(--space-4)",
                }}
              >
                {saveMsg.ok ? (
                  <CheckCircle2 size={16} color="#065F46" aria-hidden="true" />
                ) : (
                  <AlertCircle size={16} color="#991B1B" aria-hidden="true" />
                )}
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    color: saveMsg.ok ? "#065F46" : "#991B1B",
                  }}
                >
                  {saveMsg.text}
                </span>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={save}
              disabled={saving}
              aria-busy={saving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3) var(--space-8)",
                borderRadius: "var(--radius-md)",
                border: "1px solid transparent",
                backgroundColor: "var(--color-accent-primary)",
                color: "var(--color-text-inverse)",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                fontSize: "var(--text-base)",
                boxShadow: "var(--shadow-raised)",
                transition: "box-shadow 150ms ease",
              }}
            >
              {saving && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />}
              {saving ? "Saving…" : "Save preferences"}
            </button>

            {saveMsg?.ok && (
              <Link
                href="/feed"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  marginLeft: "var(--space-3)",
                  padding: "var(--space-3) var(--space-6)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-surface)",
                  color: "var(--color-text-primary)",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                  textDecoration: "none",
                  boxShadow: "var(--shadow-raised)",
                }}
              >
                View My Feed →
              </Link>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
