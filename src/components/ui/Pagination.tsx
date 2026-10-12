"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  /**
   * Build the list of page numbers to show, with ellipsis for large ranges.
   * Always shows first, last, and pages near the current page.
   */
  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    const delta = 1; // pages around current

    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  }

  const buttonBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    height: 36,
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid var(--color-border)",
    transition: "background-color 150ms ease, box-shadow 150ms ease",
    userSelect: "none",
  };

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        style={{
          ...buttonBase,
          backgroundColor: page <= 1 ? "var(--color-bg-sunken)" : "var(--color-bg-surface)",
          color: page <= 1 ? "var(--color-text-disabled)" : "var(--color-text-primary)",
          cursor: page <= 1 ? "not-allowed" : "pointer",
          padding: "0 var(--space-3)",
          gap: "var(--space-1)",
          boxShadow: page <= 1 ? "none" : "var(--shadow-raised)",
        }}
      >
        <ChevronLeft size={14} aria-hidden="true" />
        <span>Prev</span>
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((p, idx) =>
        p === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            aria-hidden="true"
            style={{
              ...buttonBase,
              border: "none",
              backgroundColor: "transparent",
              cursor: "default",
              color: "var(--color-text-disabled)",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            style={{
              ...buttonBase,
              backgroundColor:
                p === page ? "var(--color-accent-primary)" : "var(--color-bg-surface)",
              color:
                p === page ? "var(--color-text-inverse)" : "var(--color-text-primary)",
              borderColor:
                p === page ? "var(--color-accent-primary)" : "var(--color-border)",
              boxShadow: p === page ? "var(--shadow-raised-lg)" : "var(--shadow-raised)",
              fontWeight: p === page ? 700 : 500,
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        style={{
          ...buttonBase,
          backgroundColor:
            page >= totalPages ? "var(--color-bg-sunken)" : "var(--color-bg-surface)",
          color:
            page >= totalPages ? "var(--color-text-disabled)" : "var(--color-text-primary)",
          cursor: page >= totalPages ? "not-allowed" : "pointer",
          padding: "0 var(--space-3)",
          gap: "var(--space-1)",
          boxShadow: page >= totalPages ? "none" : "var(--shadow-raised)",
        }}
      >
        <span>Next</span>
        <ChevronRight size={14} aria-hidden="true" />
      </button>
    </nav>
  );
}
