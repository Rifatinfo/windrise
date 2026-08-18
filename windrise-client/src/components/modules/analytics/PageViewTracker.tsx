"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { trackEvent } from "@/lib/eventTracking";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("PAGE_VIEW");
  }, [pathname]);

  return null;
}
