import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-12) var(--space-8)",
        gap: "var(--space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-accent-danger)",
        }}
        aria-hidden="true"
      >
        <AlertCircle size={28} color="#7F1D1D" />
      </div>

      <p
        style={{
          fontSize: "var(--text-base)",
          color: "var(--color-text-secondary)",
          maxWidth: "40ch",
          margin: 0,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            backgroundColor: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3) var(--space-6)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
