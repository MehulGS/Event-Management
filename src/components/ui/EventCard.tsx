"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Ticket } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import type { EventCategory } from "@/types";

export interface EventCardData {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  city: string;
  date: string;
  price: number;
  imageUrl: string;
}

interface EventCardProps {
  event: EventCardData;
}

/**
 * Formats a price in Indian Rupee conventions.
 * ₹0 → "Free"
 * ₹1500 → "₹1,500"
 * ₹150000 → "₹1,50,000"
 */
function formatINR(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formats a date string as: "Sat, 18 Oct, 6:30 PM"
 */
function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function EventCard({ event }: EventCardProps) {
  const formattedDate = formatEventDate(event.date);
  const formattedPrice = formatINR(event.price);

  return (
    <article
      aria-label={`${event.title} — ${event.category} in ${event.city}`}
      style={{
        backgroundColor: "var(--color-bg-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-raised)",
        overflow: "hidden",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-raised-lg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-raised)";
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          backgroundColor: "var(--color-bg-sunken)",
          flexShrink: 0,
        }}
      >
        <Image
          src={event.imageUrl}
          alt={`Photo for ${event.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div
        style={{
          padding: "var(--space-6)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          flexGrow: 1,
        }}
      >
        {/* Category badge */}
        <div>
          <CategoryBadge category={event.category} />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            lineHeight: 1.3,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.title}
        </h3>

        {/* Meta: city and date */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            <MapPin size={14} aria-hidden="true" />
            <span>{event.city}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Calendar size={14} aria-hidden="true" />
            <time dateTime={event.date}>{formattedDate}</time>
          </div>
        </div>

        {/* Footer: price + link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: "var(--space-3)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              color: event.price === 0
                ? "var(--color-cat-sports-text)"
                : "var(--color-text-primary)",
            }}
          >
            <Ticket size={14} aria-hidden="true" />
            <span>{formattedPrice}</span>
          </div>

          <Link
            href={`/events/${event.id}`}
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: "var(--color-accent-primary)",
              textDecoration: "none",
              borderRadius: "var(--radius-sm)",
              padding: "var(--space-1) var(--space-3)",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-bg-sunken)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }}
            aria-label={`View details for ${event.title}`}
          >
            View details →
          </Link>
        </div>
      </div>
    </article>
  );
}
