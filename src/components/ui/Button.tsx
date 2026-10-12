"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-accent-primary)",
    color: "var(--color-text-inverse)",
    border: "1px solid transparent",
  },
  secondary: {
    backgroundColor: "var(--color-bg-surface)",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border)",
  },
  danger: {
    backgroundColor: "var(--color-accent-danger)",
    color: "#7F1D1D",
    border: "1px solid transparent",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid transparent",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "var(--space-2) var(--space-4)", fontSize: "var(--text-xs)" },
  md: { padding: "var(--space-3) var(--space-6)", fontSize: "var(--text-sm)" },
  lg: { padding: "var(--space-4) var(--space-8)", fontSize: "var(--text-base)" },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: "var(--radius-md)",
        fontWeight: "var(--font-semibold)" as React.CSSProperties["fontWeight"],
        boxShadow: "var(--shadow-raised)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        transition: "box-shadow 150ms ease, transform 100ms ease, opacity 150ms ease",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        lineHeight: 1.25,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...style,
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-pressed)";
        }
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-raised)";
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-raised)";
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading && (
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      {children}
    </button>
  );
}
