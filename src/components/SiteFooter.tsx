import React from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export function SiteFooter() {
  // Hardcoded to prevent Next.js prerender instability warning.
  // Update this value annually or move to a client component if preferred.
  const currentYear = 2026;

  return (
    <footer
      style={{
        backgroundColor: "var(--color-bg-surface)",
        borderTop: "1px solid var(--color-border)",
        boxShadow: "0 -2px 8px rgba(90, 60, 130, 0.06)",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "var(--space-12) var(--space-4) var(--space-8)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-10)",
            marginBottom: "var(--space-10)",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                textDecoration: "none",
              }}
              aria-label="Community Events Board — home"
            >
              <div
                aria-hidden="true"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-accent-primary)",
                }}
              >
                <CalendarDays size={18} color="white" />
              </div>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                Community Events Board
              </span>
            </Link>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                maxWidth: "28ch",
                margin: 0,
              }}
            >
              Discover local community events near you — music, food, sports, workshops, and more.
            </p>
          </div>

          {/* Discover */}
          <nav aria-label="Discover links">
            <h3
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-4)",
                margin: "0 0 var(--space-4) 0",
              }}
            >
              Discover
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {[
                { href: "/events", label: "Browse all events" },
                { href: "/events?category=Music", label: "Music" },
                { href: "/events?category=Workshop", label: "Workshops" },
                { href: "/events?category=Food", label: "Food & Drink" },
                { href: "/events?category=Sports", label: "Sports" },
                { href: "/events?category=Kids", label: "Kids & Family" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color 150ms ease",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account links">
            <h3
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 var(--space-4) 0",
              }}
            >
              Account
            </h3>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {[
                { href: "/signup", label: "Create account" },
                { href: "/login", label: "Log in" },
                { href: "/feed", label: "My Feed" },
                { href: "/admin", label: "Admin login" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color 150ms ease",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-disabled)",
              margin: 0,
            }}
          >
            © {currentYear} Community Events Board. Built for educational purposes.
          </p>
          <p
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-disabled)",
              margin: 0,
            }}
          >
            Events are managed by administrators. Public listing shows active, upcoming events only.
          </p>
        </div>
      </div>
    </footer>
  );
}
