"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, CalendarDays, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // ── Logout ────────────────────────────────────────────────────
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setLoggingOut(false);
      setMobileOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  // ── Derive nav links from auth state ─────────────────────────
  const guestLinks = [
    { href: "/events", label: "Browse Events" },
    { href: "/login", label: "Log in" },
    { href: "/signup", label: "Sign up", isPrimary: true },
  ];

  const userLinks = [
    { href: "/events", label: "Events" },
    { href: "/feed", label: "My Feed" },
    { href: "/favorites", label: "Favourites" },
    { href: "/reminders", label: "My Reminders" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/events", label: "Manage Events" },
  ];

  // Active nav links (without auth action buttons)
  const navLinks = isAdmin ? adminLinks : user ? userLinks : guestLinks.slice(0, 1);

  return (
    <header
      style={{
        backgroundColor: "var(--color-bg-surface)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-subtle)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 var(--space-4)",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          aria-label="Community Events Board — home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-accent-primary)",
              boxShadow: "var(--shadow-raised)",
            }}
          >
            <CalendarDays size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              lineHeight: 1.2,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-secondary)",
                fontWeight: 500,
              }}
            >
              Community
            </span>
            Events Board
          </span>
        </Link>

        {/* ── Desktop nav ─────────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
          }}
          className="header-desktop-nav"
        >
          <style>{`
            @media (max-width: 767px) { .header-desktop-nav, .header-desktop-actions { display: none !important; } }
            @media (min-width: 768px) { .header-mobile-toggle { display: none !important; } }
          `}</style>

          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href || pathname.startsWith(href + "/") ? "page" : undefined}
              style={{
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                textDecoration: "none",
                color:
                  pathname === href || pathname.startsWith(href + "/")
                    ? "var(--color-accent-primary)"
                    : "var(--color-text-secondary)",
                backgroundColor:
                  pathname === href || pathname.startsWith(href + "/")
                    ? "var(--color-bg-sunken)"
                    : "transparent",
                transition: "background-color 150ms ease, color 150ms ease",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right actions ────────────────────────────── */}
        <div
          className="header-desktop-actions"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
        >
          {/* Loading shimmer — prevent auth flash */}
          {loading ? (
            <div
              aria-label="Loading navigation"
              style={{
                width: 120,
                height: 32,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-bg-sunken)",
                animation: "skeleton-pulse 1.5s ease-in-out infinite",
              }}
            />
          ) : user ? (
            /* Authenticated */
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-2) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-surface)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.7 : 1,
                boxShadow: "var(--shadow-raised)",
                transition: "box-shadow 150ms ease",
              }}
            >
              {loggingOut ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <LogOut size={14} aria-hidden="true" />
              )}
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          ) : (
            /* Guest */
            <>
              <Link
                href="/login"
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "var(--color-text-secondary)",
                  transition: "color 150ms ease",
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  textDecoration: "none",
                  backgroundColor: "var(--color-accent-primary)",
                  color: "var(--color-text-inverse)",
                  boxShadow: "var(--shadow-raised)",
                  transition: "box-shadow 150ms ease, transform 100ms ease",
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ─────────────────────────────────── */}
        <button
          className="header-mobile-toggle"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-bg-surface)",
            cursor: "pointer",
            boxShadow: "var(--shadow-raised)",
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile nav drawer ───────────────────────────────────── */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            borderTop: "1px solid var(--color-border)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              aria-current={pathname === href || pathname.startsWith(href + "/") ? "page" : undefined}
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--text-base)",
                fontWeight: 500,
                textDecoration: "none",
                color:
                  pathname === href || pathname.startsWith(href + "/")
                    ? "var(--color-accent-primary)"
                    : "var(--color-text-primary)",
                backgroundColor:
                  pathname === href || pathname.startsWith(href + "/")
                    ? "var(--color-bg-sunken)"
                    : "transparent",
              }}
            >
              {label}
            </Link>
          ))}

          {/* Auth section */}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-3)",
              marginTop: "var(--space-2)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {loading ? (
              <div
                style={{
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--color-bg-sunken)",
                  animation: "skeleton-pulse 1.5s ease-in-out infinite",
                }}
              />
            ) : user ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-bg-surface)",
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  cursor: loggingOut ? "not-allowed" : "pointer",
                  opacity: loggingOut ? 0.7 : 1,
                  width: "100%",
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-base)",
                    fontWeight: 500,
                    textDecoration: "none",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                    textAlign: "center",
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                    textDecoration: "none",
                    backgroundColor: "var(--color-accent-primary)",
                    color: "var(--color-text-inverse)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-raised)",
                  }}
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
