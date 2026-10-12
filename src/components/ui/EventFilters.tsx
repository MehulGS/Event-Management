"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { EVENT_CATEGORIES } from "@/types";
import type { EventCategory } from "@/types";

/**
 * Client component for event filters: category, city, and text search.
 * Writes filter state to URL query parameters so the server component can
 * read them and fetch from the API with the correct parameters.
 *
 * Debounces text/city input to avoid a fetch on every keystroke.
 */
export function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial values from the URL
  const initialCategory = (searchParams.get("category") ?? "") as EventCategory | "";
  const initialCity = searchParams.get("city") ?? "";
  const initialSearch = searchParams.get("search") ?? "";

  const [category, setCategory] = useState<EventCategory | "">(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [search, setSearch] = useState(initialSearch);

  // Debounce timer for text inputs
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Push the current filter state to the URL.
   * Always resets page to 1 when a filter changes.
   */
  const applyFilters = useCallback(
    (updates: { category?: EventCategory | ""; city?: string; search?: string }) => {
      const qs = new URLSearchParams(searchParams.toString());

      const newCategory = updates.category !== undefined ? updates.category : category;
      const newCity = updates.city !== undefined ? updates.city : city;
      const newSearch = updates.search !== undefined ? updates.search : search;

      // Reset page when any filter changes
      qs.delete("page");

      if (newCategory) qs.set("category", newCategory);
      else qs.delete("category");

      if (newCity.trim()) qs.set("city", newCity.trim());
      else qs.delete("city");

      if (newSearch.trim()) qs.set("search", newSearch.trim());
      else qs.delete("search");

      router.push(`${pathname}?${qs.toString()}`, { scroll: false });
    },
    [category, city, search, pathname, router, searchParams]
  );

  /** Handle category chip click */
  function handleCategory(value: EventCategory | "") {
    const next = value === category ? "" : value;
    setCategory(next);
    applyFilters({ category: next });
  }

  /** Handle text inputs with debounce */
  function handleTextChange(
    setter: React.Dispatch<React.SetStateAction<string>>,
    key: "city" | "search",
    value: string
  ) {
    setter(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      applyFilters({ [key]: value });
    }, 400);
  }

  /** Clear all filters */
  function clearFilters() {
    setCategory("");
    setCity("");
    setSearch("");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const qs = new URLSearchParams();
    router.push(`${pathname}?${qs.toString()}`, { scroll: false });
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasFilters = !!(category || city.trim() || search.trim());

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-raised)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          <Filter size={16} aria-hidden="true" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-1)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--space-1) var(--space-2)",
              borderRadius: "var(--radius-sm)",
              transition: "background-color 150ms ease",
            }}
            aria-label="Clear all filters"
          >
            <X size={12} aria-hidden="true" />
            Clear all
          </button>
        )}
      </div>

      {/* Keyword search */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <SearchInput
          id="event-search"
          label="Search events by keyword"
          value={search}
          onChange={(v) => handleTextChange(setSearch, "search", v)}
          placeholder="Search by title or description…"
        />
      </div>

      {/* City input */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label
          htmlFor="city-filter"
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 600,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          City
        </label>
        <input
          id="city-filter"
          type="text"
          value={city}
          onChange={(e) => handleTextChange(setCity, "city", e.target.value)}
          placeholder="e.g. Coimbatore, Mumbai…"
          maxLength={100}
          autoComplete="off"
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            backgroundColor: "var(--color-bg-sunken)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-inset)",
            fontSize: "var(--text-sm)",
            color: "var(--color-text-primary)",
            outline: "none",
            transition: "border-color 150ms ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-focus)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        />
      </div>

      {/* Category chips */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "var(--space-3)",
            }}
          >
            Category
          </legend>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
            }}
          >
            {EVENT_CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategory(cat)}
                  aria-pressed={selected}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: selected
                      ? "1px solid var(--color-accent-primary)"
                      : "1px solid var(--color-border)",
                    backgroundColor: selected
                      ? "var(--color-accent-primary)"
                      : "var(--color-bg-surface)",
                    color: selected
                      ? "var(--color-text-inverse)"
                      : "var(--color-text-secondary)",
                    boxShadow: selected ? "var(--shadow-raised)" : "none",
                    transition: "background-color 150ms ease, color 150ms ease, border-color 150ms ease",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
