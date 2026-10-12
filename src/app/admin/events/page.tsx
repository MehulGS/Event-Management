"use client";

/**
 * /admin/events — redirects to /admin which shows the full event list.
 * This route exists because the header navigation links to it.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminEventsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return null;
}
