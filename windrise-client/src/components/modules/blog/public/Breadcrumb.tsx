import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * "Home / Stories / …" — the hairline trail at the top of every Stories page.
 *
 * Laid out in normal flow; callers decide where it sits (the hero overlays it
 * with an absolutely positioned wrapper). Positioning it here as well left it
 * unable to size against its container, which is what made a long post title
 * wrap and strand its separator on a line of its own.
 *
 * Only the final crumb can be long, so it is the one allowed to shrink and
 * truncate; the ancestors keep their full labels.
 */
export function Breadcrumb({
  trail,
}: {
  trail: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[#9E9E9E] md:text-lg ">
      <ol className="flex items-center gap-x-1.5">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;

          return (
            <li
              key={`${crumb.label}-${index}`}
              className={cn(
                "flex items-center gap-1.5",
                // `min-w-0` is what lets the truncation actually bite.
                isLast ? "min-w-0" : "shrink-0"
              )}
            >
              {index > 0 && (
                <span aria-hidden="true" className="shrink-0">
                  /
                </span>
              )}

              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="whitespace-nowrap transition-opacity hover:opacity-60"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate" title={crumb.label}>
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
