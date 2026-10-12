import React from "react";
import type { EventCategory } from "@/types";

interface CategoryBadgeProps {
  category: EventCategory;
  className?: string;
}

const categoryStyles: Record<
  EventCategory,
  { bg: string; text: string }
> = {
  Music: {
    bg: "var(--color-cat-music)",
    text: "var(--color-cat-music-text)",
  },
  Workshop: {
    bg: "var(--color-cat-workshop)",
    text: "var(--color-cat-workshop-text)",
  },
  Food: {
    bg: "var(--color-cat-food)",
    text: "var(--color-cat-food-text)",
  },
  Sports: {
    bg: "var(--color-cat-sports)",
    text: "var(--color-cat-sports-text)",
  },
  Kids: {
    bg: "var(--color-cat-kids)",
    text: "var(--color-cat-kids-text)",
  },
};

const categoryEmoji: Record<EventCategory, string> = {
  Music: "🎵",
  Workshop: "🛠️",
  Food: "🍽️",
  Sports: "⚽",
  Kids: "👶",
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const styles = categoryStyles[category];

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        backgroundColor: styles.bg,
        color: styles.text,
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-1) var(--space-3)",
        fontSize: "var(--text-xs)",
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{categoryEmoji[category]}</span>
      {category}
    </span>
  );
}
