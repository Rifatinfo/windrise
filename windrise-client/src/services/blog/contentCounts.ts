"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ContentCounts = { posts: number; ads: number };

/**
 * Badge numbers for the sidebar's Content section. Refreshes when the tab
 * regains focus so publishing a post updates the count without a reload.
 */
export function useContentCounts(enabled: boolean): ContentCounts | null {
  const [counts, setCounts] = useState<ContentCounts | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/blog/content-counts`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const body = await res.json();
        if (!cancelled) setCounts(body.data);
      } catch {
        // A missing badge is not worth surfacing an error for.
      }
    };

    void load();
    window.addEventListener("focus", load);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", load);
    };
  }, [enabled]);

  return counts;
}
