/**
 * useAuth hook — client-side authentication state.
 *
 * Fetches the current user from GET /api/auth/me. The JWT stays in an
 * HttpOnly cookie — this hook never reads or stores the token itself.
 *
 * States:
 *  - loading: true while the initial fetch is in flight
 *  - user: populated once authenticated, null when guest/error
 *  - isAdmin: derived from user.role === "admin"
 *
 * The hook is called by SiteHeader so it fires once on mount. Components
 * that need auth can import this hook directly.
 */

"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user";
  favouriteCategories: string[];
}

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (active) setUser(json.user ?? null);
        } else {
          if (active) setUser(null);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return {
    user,
    loading,
    isAdmin: user?.role === "admin",
  };
}
