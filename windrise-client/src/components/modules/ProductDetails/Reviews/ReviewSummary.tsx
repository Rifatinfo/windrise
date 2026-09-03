"use client";

import type { ReviewSummary as Summary } from "@/services/review/review";
import { Stars } from "./Stars";

/**
 * The score block that sits in the Reviews tab: the average on the left, the
 * five distribution bars on the right.
 */
export function ReviewSummaryPanel({ summary }: { summary: Summary }) {
  if (summary.total === 0) {
    return (
      <p className="text-[12px] font-light leading-relaxed text-ink lg:text-[15px]">
        Reviews will appear here once customers share their experience.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-9  md:mt-14">
      {/* Average */}
      <div className="flex shrink-0 flex-col items-center gap-1 sm:pr-6 sm:border-r sm:border-[#e9e9e9] lg:pr-9">
        <p className="flex items-baseline gap-1.5">
          <span className="text-[26px] font-semibold leading-none text-[#1a1a1a] lg:text-5xl">
            {summary.average?.toFixed(1)}
          </span>
          <span className="text-[11px] text-[#8f8f8f] lg:text-xl">out of 5</span>
        </p>
        <Stars value={summary.average ?? 0} size={24} />
        <p className="text-[11px] text-[#8f8f8f] lg:text-[16px]">
          ({summary.total} Review{summary.total === 1 ? "" : "s"})
        </p>
      </div>

      {/* Distribution */}
      <dl className="min-w-0 flex-1 space-y-[5px] md:space-y-[10px]">
        {summary.distribution.map((row) => (
          <div key={row.stars} className="flex items-center gap-2.5">
            <dt className="w-[52px] shrink-0 text-[12px] text-[#6f6f6f] lg:text-lg">
              {row.stars} Star
            </dt>
            <dd className="min-w-0 flex-1">
              <span
                className="block h-[5px] md:h-[7px] w-full overflow-hidden rounded-full bg-[#ececec]"
                role="meter"
                aria-valuenow={row.count}
                aria-valuemin={0}
                aria-valuemax={summary.total}
                aria-label={`${row.stars} star: ${row.count} of ${summary.total}`}
              >
                <span
                  style={{ width: `${row.percent}%` }}
                  className="block h-full rounded-full bg-[#1a1a1a] transition-[width] duration-500"
                />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
