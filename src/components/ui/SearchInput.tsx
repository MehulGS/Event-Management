"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search events…",
  label = "Search events",
  id = "search-input",
}: SearchInputProps) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      {/* Search icon */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "var(--space-3)",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-text-disabled)",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Search size={16} />
      </div>

      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          width: "100%",
          paddingLeft: "2.25rem",
          paddingRight: value ? "2.25rem" : "var(--space-4)",
          paddingTop: "var(--space-3)",
          paddingBottom: "var(--space-3)",
          backgroundColor: "var(--color-bg-sunken)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-inset)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-primary)",
          outline: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border-focus)";
          e.currentTarget.style.boxShadow =
            "var(--shadow-inset), 0 0 0 2px rgba(167, 139, 250, 0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.boxShadow = "var(--shadow-inset)";
        }}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: "var(--space-3)",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: "var(--radius-full)",
            border: "none",
            backgroundColor: "var(--color-text-disabled)",
            color: "white",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
