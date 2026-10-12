import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  subtext?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon,
  heading,
  subtext,
  actionLabel,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-16) var(--space-8)",
        gap: "var(--space-4)",
      }}
    >
      {icon && (
        <div
          aria-hidden="true"
          style={{
            fontSize: "3.5rem",
            lineHeight: 1,
            marginBottom: "var(--space-2)",
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: 0,
        }}
      >
        {heading}
      </h3>

      {subtext && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            maxWidth: "36ch",
            margin: 0,
          }}
        >
          {subtext}
        </p>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            marginTop: "var(--space-2)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            backgroundColor: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
            border: "1px solid transparent",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-6)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "var(--shadow-raised)",
            transition: "box-shadow 150ms ease, transform 100ms ease",
          }}
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionHref && onActionClick && (
        <button
          onClick={onActionClick}
          style={{
            marginTop: "var(--space-2)",
            display: "inline-flex",
            alignItems: "center",
            backgroundColor: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
            border: "1px solid transparent",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-6)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
