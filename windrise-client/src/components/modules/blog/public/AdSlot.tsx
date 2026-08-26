"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { trackClick, trackImpression, type ActiveAd } from "@/services/ads/public";
import { mediaUrl } from "@/services/blog/blog";
import { cn } from "@/lib/utils";

/**
 * One ad position on the storefront.
 *
 * When the placement has an active ad it renders that creative and counts an
 * impression the first time it actually comes into view — counting on mount
 * would inflate every below-the-fold slot. With nothing booked, the slot falls
 * back to a Windrise house promo rather than collapsing, which is what the
 * design shows and keeps the page rhythm intact.
 */
export function AdSlot({
  ad,
  width,
  height,
  className,
  /** Rendered instead of the pixel size when the label should stay generic. */
  sizeLabel,
  /**
   * The box the slot occupies on screen. Defaults to the booked creative's
   * ratio, but a slot sharing a row with post cards has to match *their*
   * shape, not the creative's, or the row goes ragged.
   */
  aspect,
}: {
  ad: ActiveAd | null;
  width: number;
  height: number;
  className?: string;
  sizeLabel?: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!ad || !node || seen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          trackImpression(ad.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad, seen]);

  const label = sizeLabel ?? `${width} X ${height} PX`;

  // ---- A booked ad --------------------------------------------------------
  if (ad) {
    const creative = ad.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl(ad.imageUrl) ?? ""}
        alt={ad.name}
        className="h-full w-full object-cover"
      />
    ) : ad.htmlSnippet ? (
      <div
        className="h-full w-full"
        // Snippets are authored by staff in the Ads dashboard and sanitized
        // server-side before they are stored.
        dangerouslySetInnerHTML={{ __html: ad.htmlSnippet }}
      />
    ) : null;

    const body = (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden bg-[#EDEBE6]", className)}
        style={{ aspectRatio: aspect ?? `${width} / ${height}` }}
      >
        {creative}
        {ad.type === "SPONSORED" && (
          <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white">
            {ad.sponsorName ? `Sponsored · ${ad.sponsorName}` : "Sponsored"}
          </span>
        )}
      </div>
    );

    if (!ad.targetUrl) return body;

    return (
      <a
        href={ad.targetUrl}
        target={ad.openInNewTab ? "_blank" : undefined}
        rel={ad.openInNewTab ? "noopener noreferrer sponsored" : "sponsored"}
        onClick={() => trackClick(ad.id)}
        className="block"
      >
        {body}
      </a>
    );
  }

  // ---- Nothing booked: a house promo --------------------------------------
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col justify-between bg-[#E7E5E0] p-4 text-[#1C1B1A]",
        className
      )}
      style={{ aspectRatio: aspect ?? `${width} / ${height}` }}
    >
      <p className="text-[9px] uppercase leading-tight tracking-[0.12em] text-[#8A8880]">
        Advertisement
        <br />
        {label}
      </p>

      <div>
        <p className="font-serif text-[clamp(15px,1.6vw,22px)] leading-[1.2]">
          New Arrivals
          <br />
          Now Live
        </p>
        <Link
          href="/"
          className="mt-3 inline-block bg-[#1C1B1A] px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
