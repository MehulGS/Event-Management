import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Music,
  Hammer,
  UtensilsCrossed,
  Dumbbell,
  Baby,
  MapPin,
  Users,
  Bell,
  Heart,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FeaturedEvents } from "@/components/FeaturedEvents";
import { EventCardSkeleton } from "@/components/ui/EventCardSkeleton";

export const metadata: Metadata = {
  title: "Community Events Board — Discover Local Events",
  description:
    "Find and save local community events near you — live music, workshops, food fairs, sports meets, and kids activities. Free to browse.",
};

const categories = [
  {
    name: "Music",
    icon: <Music size={28} />,
    color: "var(--color-cat-music)",
    textColor: "var(--color-cat-music-text)",
    description: "Live gigs, concerts & open mics",
  },
  {
    name: "Workshop",
    icon: <Hammer size={28} />,
    color: "var(--color-cat-workshop)",
    textColor: "var(--color-cat-workshop-text)",
    description: "Skills, crafts & learning",
  },
  {
    name: "Food",
    icon: <UtensilsCrossed size={28} />,
    color: "var(--color-cat-food)",
    textColor: "var(--color-cat-food-text)",
    description: "Street food, fairs & tastings",
  },
  {
    name: "Sports",
    icon: <Dumbbell size={28} />,
    color: "var(--color-cat-sports)",
    textColor: "var(--color-cat-sports-text)",
    description: "Runs, leagues & outdoor activities",
  },
  {
    name: "Kids",
    icon: <Baby size={28} />,
    color: "var(--color-cat-kids)",
    textColor: "var(--color-cat-kids-text)",
    description: "Family-friendly fun for all ages",
  },
] as const;

const howItWorksSteps = [
  {
    icon: <MapPin size={24} />,
    title: "Browse events near you",
    description:
      "Filter by city, category, or keyword to find events that match your interests. All listings are admin-curated.",
  },
  {
    icon: <Heart size={24} />,
    title: "Save favourite categories",
    description:
      "Create a free account and pick your favourite event types. Your personalised feed shows only what you care about.",
  },
  {
    icon: <Bell size={24} />,
    title: "Set reminders",
    description:
      "Mark events you want to attend and they'll stay in your reminders list — ready when you are.",
  },
  {
    icon: <Users size={24} />,
    title: "Share with your community",
    description:
      "Events are posted by local administrators. Spread the word and bring your friends.",
  },
];

function SkeletonGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
        gap: "var(--space-6)",
      }}
    >
      {[1, 2, 3].map((i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        {/* Global styles for hover effects on server-rendered links */}
        <style>{`
          .category-card {
            transition: transform 200ms ease, box-shadow 200ms ease;
          }
          .category-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-raised-lg) !important;
          }
          .hero-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: -5px -5px 14px rgba(255,255,255,0.7), 8px 8px 20px rgba(90,60,130,0.4) !important;
          }
          .hero-btn-secondary:hover {
            transform: translateY(-1px);
          }
        `}</style>
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            background:
              "linear-gradient(135deg, var(--color-bg-page) 0%, #E8DDF5 50%, var(--color-bg-page) 100%)",
            padding: "var(--space-16) var(--space-4)",
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
              gap: "var(--space-12)",
              alignItems: "center",
            }}
          >
            {/* Text content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-6)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-full)",
                  padding: "var(--space-2) var(--space-4)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--color-accent-primary)",
                  boxShadow: "var(--shadow-raised)",
                  width: "fit-content",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-accent-success)",
                    display: "inline-block",
                  }}
                />
                Free to browse — no account required
              </div>

              <h1
                id="hero-heading"
                style={{
                  fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Find your next
                <br />
                <span style={{ color: "var(--color-accent-primary)" }}>
                  community event
                </span>
              </h1>

              <p
                style={{
                  fontSize: "var(--text-lg)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                  maxWidth: "50ch",
                  margin: 0,
                }}
              >
                Discover local music gigs, food fairs, workshops, sports meets, and
                kids activities — all in one place, curated by community administrators.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-4)",
                  alignItems: "center",
                }}
              >
                <Link
                  href="/events"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-4) var(--space-8)",
                    backgroundColor: "var(--color-accent-primary)",
                    color: "var(--color-text-inverse)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-base)",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "var(--shadow-raised-lg)",
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
                >
                  Browse events
                </Link>
                <Link
                  href="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-4) var(--space-8)",
                    backgroundColor: "var(--color-bg-surface)",
                    color: "var(--color-text-primary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--text-base)",
                    fontWeight: 600,
                    textDecoration: "none",
                    boxShadow: "var(--shadow-raised)",
                    transition: "transform 150ms ease, box-shadow 150ms ease",
                  }}
                >
                  Create free account
                </Link>
              </div>
            </div>

            {/* Hero illustration panel */}
            <div
              aria-hidden="true"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4)",
              }}
            >
              {/* Stat cards */}
              {[
                { emoji: "🎵", label: "Music events", value: "Live Gigs" },
                { emoji: "🍽️", label: "Food fairs", value: "Street Food" },
                { emoji: "🛠️", label: "Workshops", value: "Skill Building" },
                { emoji: "⚽", label: "Sports", value: "Active Living" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    backgroundColor: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-raised)",
                    padding: "var(--space-5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "1.75rem" }}>{item.emoji}</span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {item.value}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Events ──────────────────────────────────────────── */}
        <section
          aria-labelledby="featured-heading"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "var(--space-16) var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: "var(--space-8)",
            }}
          >
            <div>
              <h2
                id="featured-heading"
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-2) 0",
                }}
              >
                Upcoming events
              </h2>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                The next events happening near you
              </p>
            </div>
            <Link
              href="/events"
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-accent-primary)",
                textDecoration: "none",
              }}
            >
              See all events →
            </Link>
          </div>

          <Suspense fallback={<SkeletonGrid />}>
            <FeaturedEvents limit={3} />
          </Suspense>
        </section>

        {/* ── Category discovery ───────────────────────────────────────── */}
        <section
          aria-labelledby="categories-heading"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
            padding: "var(--space-16) var(--space-4)",
          }}
        >
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
              <h2
                id="categories-heading"
                style={{
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 var(--space-3) 0",
                }}
              >
                Browse by category
              </h2>
              <p
                style={{
                  fontSize: "var(--text-base)",
                  color: "var(--color-text-secondary)",
                  maxWidth: "50ch",
                  margin: "0 auto",
                }}
              >
                Five types of community events — pick what you love
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "var(--space-4)",
              }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/events?category=${cat.name}`}
                  style={{
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-6)",
                    backgroundColor: cat.color,
                    borderRadius: "var(--radius-card)",
                    boxShadow: "var(--shadow-raised)",
                    border: "1px solid transparent",
                    cursor: "pointer",
                  }}
                  aria-label={`Browse ${cat.name} events`}
                  className="category-card"
                >
                  <div
                    aria-hidden="true"
                    style={{
                      color: cat.textColor,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {cat.icon}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "var(--text-base)",
                        fontWeight: 700,
                        color: cat.textColor,
                      }}
                    >
                      {cat.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: cat.textColor,
                        opacity: 0.8,
                        marginTop: "var(--space-1)",
                      }}
                    >
                      {cat.description}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section
          aria-labelledby="how-it-works-heading"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "var(--space-16) var(--space-4)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
            <h2
              id="how-it-works-heading"
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: "0 0 var(--space-3) 0",
              }}
            >
              How it works
            </h2>
            <p
              style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-secondary)",
                maxWidth: "50ch",
                margin: "0 auto",
              }}
            >
              Discover events, personalise your feed, and never miss what matters to you
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: "var(--space-6)",
            }}
          >
            {howItWorksSteps.map((step, idx) => (
              <div
                key={step.title}
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-card)",
                  boxShadow: "var(--shadow-raised)",
                  padding: "var(--space-8) var(--space-6)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--color-bg-sunken)",
                      color: "var(--color-accent-primary)",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div
                    aria-hidden="true"
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 700,
                      color: "var(--color-text-disabled)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    STEP {idx + 1}
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "var(--text-lg)",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA banner ───────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          style={{
            background:
              "linear-gradient(135deg, #7C3AED 0%, var(--color-accent-primary) 50%, #C084FC 100%)",
            padding: "var(--space-16) var(--space-4)",
          }}
        >
          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
              alignItems: "center",
            }}
          >
            <h2
              id="cta-heading"
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 700,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Ready to discover your community?
            </h2>
            <p
              style={{
                fontSize: "var(--text-lg)",
                color: "rgba(255, 255, 255, 0.85)",
                maxWidth: "44ch",
                margin: 0,
              }}
            >
              Browse free — no signup needed. Create an account to save favourites and personalise your feed.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-4)",
                justifyContent: "center",
              }}
            >
              <Link
                href="/events"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "var(--space-4) var(--space-8)",
                  backgroundColor: "#FFFFFF",
                  color: "#5B21B6",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                Explore events
              </Link>
              <Link
                href="/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "var(--space-4) var(--space-8)",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-base)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign up free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
