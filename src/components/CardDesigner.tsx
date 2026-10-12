"use client";

/**
 * CardDesigner — interactive card appearance customiser.
 *
 * Allows an authenticated user to choose a theme and up to MAX_STICKERS
 * stickers for a specific event. Saves via PUT /api/events/[id]/card-design.
 * Loads the saved design on mount via GET /api/events/[id]/card-design.
 *
 * Features:
 *  - Live preview with smooth transitions (respects prefers-reduced-motion).
 *  - Three-sticker limit enforced in the UI with a clear message.
 *  - Optimistic preview; save state is clearly signalled.
 *  - Unsaved-changes warning before leaving (via beforeunload).
 */

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Palette, CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { CARD_THEMES, CARD_STICKERS, MAX_STICKERS, type CardTheme, type CardSticker } from "@/types";
import type { PublicEvent } from "@/lib/api-types";

// ── Theme display metadata ────────────────────────────────────
const THEME_META: Record<CardTheme, { label: string; bg: string; bgEnd: string; accent: string; shadow: string }> = {
  "pastel-cloud": { label: "Pastel Cloud", bg: "#FDFBFF", bgEnd: "#EDE9F8", accent: "#A78BFA", shadow: "rgba(90,60,130,0.22)" },
  "sunset-peach": { label: "Sunset Peach", bg: "#FFF7ED", bgEnd: "#FDE2CC", accent: "#FB923C", shadow: "rgba(180,80,30,0.22)" },
  "mint-fresh": { label: "Mint Fresh", bg: "#F0FFF4", bgEnd: "#D1FAE5", accent: "#34D399", shadow: "rgba(6,95,70,0.22)" },
  "sky-blue": { label: "Sky Blue", bg: "#EFF6FF", bgEnd: "#DBEAFE", accent: "#60A5FA", shadow: "rgba(30,58,138,0.22)" },
  "lilac-dream": { label: "Lilac Dream", bg: "#FAF5FF", bgEnd: "#EDE9FE", accent: "#C084FC", shadow: "rgba(109,40,217,0.22)" },
};

const STICKER_LABELS: Record<CardSticker, string> = {
  "🎵": "Music note",
  "🌟": "Star",
  "🎉": "Party popper",
  "🏆": "Trophy",
  "🍕": "Pizza",
};

interface CardDesignerProps {
  event: PublicEvent;
}

interface DesignState {
  theme: CardTheme;
  stickers: CardSticker[];
}

const DEFAULT: DesignState = { theme: "pastel-cloud", stickers: [] };

export function CardDesigner({ event }: CardDesignerProps) {
  const router = useRouter();
  const [design, setDesign] = useState<DesignState>(DEFAULT);
  const [saved, setSaved] = useState<DesignState>(DEFAULT);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const saveMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty =
    design.theme !== saved.theme ||
    JSON.stringify(design.stickers.slice().sort()) !== JSON.stringify(saved.stickers.slice().sort());

  // ── Load saved design ─────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadState("loading");
      try {
        const res = await fetch(`/api/events/${event.id}/card-design`, {
          credentials: "include",
        });
        if (!active) return;
        if (res.status === 401) {
          setNeedsAuth(true);
          setLoadState("ready");
          return;
        }
        if (!res.ok) {
          setLoadState("error");
          return;
        }
        const json = await res.json();
        const d: DesignState = {
          theme: (json.data?.theme ?? DEFAULT.theme) as CardTheme,
          stickers: (json.data?.stickers ?? []) as CardSticker[],
        };
        if (active) {
          setDesign(d);
          setSaved(d);
          setLoadState("ready");
        }
      } catch {
        if (active) setLoadState("error");
      }
    })();
    return () => { active = false; };
  }, [event.id]);

  // ── Unsaved-changes warning ───────────────────────────────────
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Theme selection ───────────────────────────────────────────
  function setTheme(t: CardTheme) {
    setDesign((d) => ({ ...d, theme: t }));
    setSaveState("idle");
  }

  // ── Sticker toggle ────────────────────────────────────────────
  function toggleSticker(s: CardSticker) {
    setDesign((d) => {
      const hasIt = d.stickers.includes(s);
      if (!hasIt && d.stickers.length >= MAX_STICKERS) return d; // limit
      return {
        ...d,
        stickers: hasIt ? d.stickers.filter((x) => x !== s) : [...d.stickers, s],
      };
    });
    setSaveState("idle");
  }

  // ── Save ─────────────────────────────────────────────────────
  async function saveDesign() {
    if (saveState === "saving") return;
    setSaveState("saving");
    setSaveError(null);
    if (saveMsgTimerRef.current) clearTimeout(saveMsgTimerRef.current);

    try {
      const res = await fetch(`/api/events/${event.id}/card-design`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: design.theme, stickers: design.stickers }),
      });
      const json = await res.json();
      if (res.ok) {
        setSaved(design);
        setSaveState("success");
        saveMsgTimerRef.current = setTimeout(() => setSaveState("idle"), 3000);
      } else if (res.status === 401) {
        setNeedsAuth(true);
        setSaveState("error");
        setSaveError("You need to be logged in to save a card design.");
        router.push("/login?next=/events/" + event.id);
      } else {
        setSaveState("error");
        setSaveError(json.error?.message ?? "Failed to save design.");
      }
    } catch {
      setSaveState("error");
      setSaveError("Network error. Please try again.");
    }
  }

  const meta = THEME_META[design.theme];
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (needsAuth) return null; // handled by event detail page

  return (
    <section
      aria-labelledby="designer-heading"
      style={{
        marginTop: "var(--space-8)",
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-raised)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--space-6) var(--space-8)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          backgroundColor: "var(--color-bg-sunken)",
        }}
      >
        <Palette size={22} color="var(--color-accent-primary)" aria-hidden="true" />
        <h2
          id="designer-heading"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Card Designer
        </h2>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-disabled)",
            marginLeft: "auto",
          }}
        >
          Personalise how this event card looks
        </span>
      </div>

      <div
        style={{
          padding: "var(--space-8)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-8)",
        }}
        className="designer-grid"
      >
        <style>{`
          @media (min-width: 768px) {
            .designer-grid { grid-template-columns: 1fr 320px !important; }
          }
        `}</style>

        {/* ── Controls ─────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

          {loadState === "loading" ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
              <Loader2 size={28} color="var(--color-accent-primary)" style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
              <span className="sr-only">Loading design…</span>
            </div>
          ) : loadState === "error" ? (
            <p style={{ color: "#991B1B", fontSize: "var(--text-sm)" }}>Failed to load saved design.</p>
          ) : (
            <>
              {/* Themes */}
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-4)",
                    display: "block",
                    padding: 0,
                  }}
                >
                  Background Theme
                </legend>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "var(--space-3)",
                  }}
                >
                  {(CARD_THEMES as readonly CardTheme[]).map((t) => {
                    const tm = THEME_META[t];
                    const isActive = design.theme === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTheme(t)}
                        aria-pressed={isActive}
                        aria-label={`${tm.label} theme`}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          padding: "var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          border: `2px solid ${isActive ? tm.accent : "var(--color-border)"}`,
                          background: `linear-gradient(135deg, ${tm.bg}, ${tm.bgEnd})`,
                          cursor: "pointer",
                          boxShadow: isActive ? `0 0 0 2px ${tm.accent}` : "var(--shadow-raised)",
                          transition: prefersReducedMotion ? "none" : "border-color 150ms ease, box-shadow 150ms ease",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 20,
                            borderRadius: 6,
                            background: `linear-gradient(135deg, ${tm.bg}, ${tm.bgEnd})`,
                            border: `2px solid ${tm.accent}`,
                          }}
                          aria-hidden="true"
                        />
                        <span
                          style={{
                            fontSize: "var(--text-xs)",
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? tm.accent : "var(--color-text-secondary)",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}
                        >
                          {tm.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Stickers */}
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    marginBottom: "var(--space-2)",
                    display: "block",
                    padding: 0,
                  }}
                >
                  Stickers
                </legend>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-secondary)",
                    marginBottom: "var(--space-4)",
                  }}
                  aria-live="polite"
                >
                  {design.stickers.length >= MAX_STICKERS
                    ? `Maximum ${MAX_STICKERS} stickers reached. Remove one to add another.`
                    : `Pick up to ${MAX_STICKERS} stickers (${MAX_STICKERS - design.stickers.length} remaining).`}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
                  {(CARD_STICKERS as readonly CardSticker[]).map((s) => {
                    const isSelected = design.stickers.includes(s);
                    const isDisabled = !isSelected && design.stickers.length >= MAX_STICKERS;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => !isDisabled && toggleSticker(s)}
                        aria-pressed={isSelected}
                        aria-label={`${STICKER_LABELS[s]} sticker${isSelected ? " (selected)" : ""}`}
                        aria-disabled={isDisabled}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "var(--space-1)",
                          padding: "var(--space-3) var(--space-4)",
                          borderRadius: "var(--radius-md)",
                          border: `2px solid ${isSelected ? "var(--color-accent-primary)" : "var(--color-border)"}`,
                          backgroundColor: isSelected ? "var(--color-bg-sunken)" : "var(--color-bg-surface)",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.4 : 1,
                          boxShadow: isSelected ? "var(--shadow-raised-lg)" : "var(--shadow-raised)",
                          transition: prefersReducedMotion ? "none" : "border-color 150ms ease, box-shadow 150ms ease",
                          minWidth: 64,
                        }}
                      >
                        <span aria-hidden="true" style={{ fontSize: "1.75rem", lineHeight: 1 }}>{s}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", textAlign: "center" }}>
                          {STICKER_LABELS[s]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Save */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={saveDesign}
                  disabled={saveState === "saving" || !isDirty}
                  aria-busy={saveState === "saving"}
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
                    cursor: (saveState === "saving" || !isDirty) ? "not-allowed" : "pointer",
                    opacity: (saveState === "saving" || !isDirty) ? 0.6 : 1,
                    fontSize: "var(--text-sm)",
                    boxShadow: "var(--shadow-raised)",
                    transition: prefersReducedMotion ? "none" : "box-shadow 150ms ease",
                  }}
                >
                  {saveState === "saving" ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />
                  ) : saveState === "success" ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : (
                    <Sparkles size={14} aria-hidden="true" />
                  )}
                  {saveState === "saving" ? "Saving…" : saveState === "success" ? "Saved!" : "Save design"}
                </button>

                {isDirty && saveState !== "saving" && (
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                    You have unsaved changes
                  </span>
                )}

                {saveError && (
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-xs)", color: "#991B1B" }}>
                    <AlertCircle size={12} aria-hidden="true" />
                    {saveError}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Live preview ────────────────────────────────────── */}
        <div>
          <p
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-4)",
            }}
          >
            Live Preview
          </p>
          <div
            aria-label="Card design preview"
            role="img"
            style={{
              background: `linear-gradient(135deg, ${meta.bg}, ${meta.bgEnd})`,
              border: `1px solid ${meta.accent}`,
              borderRadius: "var(--radius-card)",
              boxShadow: `4px 4px 16px ${meta.shadow}, -2px -2px 8px rgba(255,255,255,0.7)`,
              padding: "var(--space-6)",
              transition: prefersReducedMotion ? "none" : "background 300ms ease, border-color 300ms ease, box-shadow 300ms ease",
              position: "relative",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* Sticker display */}
            {design.stickers.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "var(--space-3)",
                  right: "var(--space-3)",
                  display: "flex",
                  gap: "var(--space-1)",
                }}
                aria-hidden="true"
              >
                {design.stickers.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    style={{
                      fontSize: "1.25rem",
                      lineHeight: 1,
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Accent strip */}
            <div
              aria-hidden="true"
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: meta.accent,
                transition: prefersReducedMotion ? "none" : "background-color 300ms ease",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: meta.accent,
                  margin: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  transition: prefersReducedMotion ? "none" : "color 300ms ease",
                }}
              >
                {event.category}
              </p>
              <h3
                style={{
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {event.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                {event.city} · {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>

            {/* Theme label */}
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: meta.accent,
                fontWeight: 500,
                margin: 0,
                marginTop: "auto",
                transition: prefersReducedMotion ? "none" : "color 300ms ease",
              }}
            >
              {meta.label} theme
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
