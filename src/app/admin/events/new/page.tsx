"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { EventForm } from "@/components/admin/EventForm";

export default function AdminNewEventPage() {
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
        <PlusCircle size={28} color="var(--color-accent-primary)" aria-hidden="true" />
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Create new event
        </h1>
      </div>

      {/* Form card */}
      <div
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-raised)",
          padding: "var(--space-8)",
        }}
      >
        <EventForm mode="create" />
      </div>
    </div>
  );
}
