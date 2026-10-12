"use client";

/**
 * Admin layout — wraps all /admin/* pages.
 *
 * Performs a client-side auth + role guard. This is a defence-in-depth
 * measure in addition to the Edge middleware. The authoritative authorization
 * check is always the server-side role re-read in each API route handler.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login?next=/admin");
          return;
        }
        const json = await res.json();
        if (json.user?.role !== "admin") {
          // Regular users are not admins — redirect to their feed.
          router.replace("/feed");
          return;
        }
        setAuthorized(true);
      })
      .catch(() => router.replace("/login?next=/admin"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking || !authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-bg-page)",
        }}
        aria-label="Verifying admin access"
        role="status"
      >
        <Loader2
          size={32}
          color="var(--color-accent-primary)"
          style={{ animation: "spin 1s linear infinite" }}
          aria-hidden="true"
        />
        <span className="sr-only">Verifying admin access…</span>
      </div>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
