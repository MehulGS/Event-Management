"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * /admin/events — redirects to the dashboard which already shows the full list.
 */
export default function AdminEventsIndexPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-8) var(--space-4)" }}>
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
          marginBottom: "var(--space-6)",
        }}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to dashboard
      </Link>
    </div>
  );
}
