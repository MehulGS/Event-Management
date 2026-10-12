import React from "react";

/**
 * Loading skeleton that matches the EventCard shape.
 * Uses the skeleton-pulse animation from globals.css.
 */
export function EventCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-raised)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image placeholder */}
      <div
        className="skeleton-pulse"
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          backgroundColor: "var(--color-bg-sunken)",
        }}
      />

      {/* Body */}
      <div
        style={{
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {/* Badge */}
        <div
          className="skeleton-pulse"
          style={{
            width: 72,
            height: 22,
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-bg-sunken)",
          }}
        />

        {/* Title lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <div
            className="skeleton-pulse"
            style={{
              width: "90%",
              height: 18,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-bg-sunken)",
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              width: "65%",
              height: 18,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-bg-sunken)",
            }}
          />
        </div>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                width: i === 1 ? "50%" : "70%",
                height: 14,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-bg-sunken)",
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div
            className="skeleton-pulse"
            style={{
              width: 60,
              height: 16,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-bg-sunken)",
            }}
          />
          <div
            className="skeleton-pulse"
            style={{
              width: 90,
              height: 16,
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--color-bg-sunken)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
