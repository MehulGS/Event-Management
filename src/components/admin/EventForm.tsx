"use client";

/**
 * Reusable admin event form.
 * Used by both create (/admin/events/new) and edit (/admin/events/[id]/edit).
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";

interface EventFormData {
  title: string;
  description: string;
  category: EventCategory | "";
  city: string;
  date: string;       // datetime-local value
  price: string;      // string for input; parsed to number on submit
  imageUrl: string;
  isActive: boolean;
}

interface EventFormProps {
  /** Prefilled values for edit mode. */
  initial?: Partial<EventFormData>;
  /** The event ID — undefined for create mode. */
  eventId?: string;
  mode: "create" | "edit";
}

const EMPTY: EventFormData = {
  title: "",
  description: "",
  category: "",
  city: "",
  date: "",
  price: "0",
  imageUrl: "",
  isActive: true,
};

function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return "";
  // Convert ISO 8601 to "YYYY-MM-DDTHH:mm" for datetime-local input.
  return isoString.slice(0, 16);
}

export function EventForm({ initial, eventId, mode }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<EventFormData>({
    ...EMPTY,
    ...initial,
    date: toDatetimeLocal(initial?.date),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const isEdit = mode === "edit";

  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    setLoading(true);

    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setFieldErrors({ price: ["Price must be a non-negative number."] });
      setLoading(false);
      return;
    }

    // Convert datetime-local to ISO string.
    const dateIso = form.date ? new Date(form.date).toISOString() : "";

    const body: Record<string, unknown> = {
      title: form.title,
      description: form.description,
      category: form.category,
      city: form.city,
      date: dateIso,
      price,
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    };

    const url = isEdit
      ? `/api/admin/events/${eventId}`
      : "/api/admin/events";

    try {
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(isEdit ? "Event updated successfully!" : "Event created successfully!");
        setTimeout(() => router.push("/admin"), 1500);
        return;
      }

      if ((res.status === 400) && json.error?.details) {
        setFieldErrors(json.error.details as Record<string, string[]>);
        setError("Please correct the errors below.");
      } else {
        setError(json.error?.message ?? (isEdit ? "Update failed." : "Create failed."));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-3) var(--space-4)",
    backgroundColor: "var(--color-bg-sunken)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-base)",
    color: "var(--color-text-primary)",
    boxShadow: "var(--shadow-inset)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "var(--text-sm)",
    fontWeight: 600,
    color: "var(--color-text-primary)",
    marginBottom: "var(--space-2)",
  };

  function fieldError(key: string) {
    const errs = fieldErrors[key];
    return errs ? (
      <p role="alert" style={{ fontSize: "var(--text-xs)", color: "#991B1B", marginTop: "var(--space-1)" }}>
        {errs[0]}
      </p>
    ) : null;
  }

  function borderColor(key: string) {
    return fieldErrors[key] ? "var(--color-accent-danger)" : "var(--color-border)";
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.outline = "2px solid var(--color-border-focus)";
    e.target.style.outlineOffset = "2px";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.outline = "none";
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "#FEF2F2",
              border: "1px solid var(--color-accent-danger)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <AlertCircle size={16} color="#991B1B" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: "var(--text-sm)", color: "#991B1B" }}>{error}</span>
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "#D1FAE5",
              border: "1px solid #A7F3D0",
              borderRadius: "var(--radius-md)",
              color: "#065F46",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        {/* 2-column grid on medium+ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {/* Title */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="ef-title" style={labelStyle}>Title <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <input
              id="ef-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Summer Jazz Night"
              maxLength={120}
              style={{ ...inputStyle, borderColor: borderColor("title") }}
              aria-required="true"
              aria-invalid={!!fieldErrors.title}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {fieldError("title")}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="ef-category" style={labelStyle}>Category <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <select
              id="ef-category"
              required
              value={form.category}
              onChange={(e) => set("category", e.target.value as EventCategory)}
              style={{ ...inputStyle, borderColor: borderColor("category"), cursor: "pointer" }}
              aria-required="true"
              aria-invalid={!!fieldErrors.category}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="">Select a category…</option>
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {fieldError("category")}
          </div>

          {/* City */}
          <div>
            <label htmlFor="ef-city" style={labelStyle}>City <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <input
              id="ef-city"
              type="text"
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Coimbatore"
              maxLength={100}
              style={{ ...inputStyle, borderColor: borderColor("city") }}
              aria-required="true"
              aria-invalid={!!fieldErrors.city}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {fieldError("city")}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="ef-date" style={labelStyle}>Date &amp; Time <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <input
              id="ef-date"
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              style={{ ...inputStyle, borderColor: borderColor("date") }}
              aria-required="true"
              aria-invalid={!!fieldErrors.date}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {fieldError("date")}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="ef-price" style={labelStyle}>Price (INR) <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <input
              id="ef-price"
              type="number"
              required
              min={0}
              step="1"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0 = free"
              style={{ ...inputStyle, borderColor: borderColor("price") }}
              aria-required="true"
              aria-invalid={!!fieldErrors.price}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {fieldError("price")}
          </div>

          {/* Image URL */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="ef-image" style={labelStyle}>Image URL <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <input
              id="ef-image"
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ ...inputStyle, borderColor: borderColor("imageUrl") }}
              aria-required="true"
              aria-invalid={!!fieldErrors.imageUrl}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            {fieldError("imageUrl")}
          </div>

          {/* Description */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="ef-description" style={labelStyle}>Description <span aria-hidden style={{ color: "#991B1B" }}>*</span></label>
            <textarea
              id="ef-description"
              required
              rows={5}
              maxLength={2000}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the event…"
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: 120,
                borderColor: borderColor("description"),
              } as React.CSSProperties}
              aria-required="true"
              aria-invalid={!!fieldErrors.description}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-disabled)", marginTop: "var(--space-1)", textAlign: "right" }}>
              {form.description.length} / 2000
            </p>
            {fieldError("description")}
          </div>

          {/* isActive toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <input
              id="ef-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--color-accent-primary)", cursor: "pointer" }}
            />
            <label
              htmlFor="ef-active"
              style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-primary)", cursor: "pointer" }}
            >
              Active (visible to the public)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={{
              padding: "var(--space-3) var(--space-6)",
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
            type="submit"
            disabled={loading}
            aria-busy={loading}
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
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              fontSize: "var(--text-sm)",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" />}
            {loading ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create event"}
          </button>
        </div>
      </div>
    </form>
  );
}
