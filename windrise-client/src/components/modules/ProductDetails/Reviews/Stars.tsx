"use client";

import { StarIcon } from "lucide-react";

/**
 * A row of stars, read-only or pickable.
 *
 * One component for both so a filled star looks identical in the summary, in
 * the list and in the form — three separate implementations would drift.
 */
export function Stars({
  value,
  size = 13,
  onChange,
  className = "",
}: {
  value: number;
  size?: number;
  /** Supply to make the row interactive. */
  onChange?: (rating: number) => void;
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  const dimension = { width: size, height: size };

  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Choose a rating" : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const icon = (
          <StarIcon
            style={dimension}
            className={filled ? "fill-[#1a1a1a] text-[#1a1a1a]" : "fill-[#d8d8d8] text-[#d8d8d8]"}
          />
        );

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === Math.round(value)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            className="cursor-pointer p-[1px] transition-transform hover:scale-110"
          >
            {icon}
          </button>
        );
      })}
    </span>
  );
}
