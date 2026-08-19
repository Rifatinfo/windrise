"use client";

import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { getBusinessPerformance } from "@/services/stats/stats";
import type { BusinessPerformance } from "@/types/stats";
import { SectionCard } from "@/components/modules/dashboard/SectionCard";
import { changeTone, formatPercent } from "@/components/modules/dashboard/dashboard.utils";

type Tone = "good" | "bad" | "muted";

const TONE_CLASSES: Record<Tone, string> = {
  good: "text-good",
  bad: "text-bad",
  muted: "text-ink-muted",
};

/** Rates where a rise is bad news (returns, refunds) invert the usual colouring. */
function rateTone(value: number): Tone {
  if (value <= 0) return "muted";
  return value >= 10 ? "bad" : "muted";
}

export function BusinessHealthSection({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  // Tagging the result with the range it belongs to means a range change
  // shows the skeleton again without resetting state inside the effect.
  const rangeKey = `${startDate}|${endDate}`;
  const [result, setResult] = useState<{
    key: string;
    data: BusinessPerformance | null;
    failed: boolean;
  }>({ key: "", data: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    const key = `${startDate}|${endDate}`;
    getBusinessPerformance({ startDate, endDate })
      .then((res) => !cancelled && setResult({ key, data: res, failed: false }))
      .catch(() => !cancelled && setResult({ key, data: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const settled = result.key === rangeKey;
  const data = settled ? result.data : null;
  const failed = settled && result.failed;

  return (
    <SectionCard
      title="Business Health"
      subtitle="Growth and after-sales pressure against the previous comparable period"
    >
      {failed ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          Couldn&apos;t load business health for this range.
        </p>
      ) : !data ? (
        <div className="grid grid-cols-1 gap-3 @lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[86px] animate-pulse rounded-xl bg-canvas" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 @lg:grid-cols-3">
          <HealthTile
            label="Sales Growth"
            value={formatPercent(Math.abs(data.growthRate))}
            tone={changeTone(data.growthRate)}
            direction={data.growthRate}
            caption="revenue vs previous period"
          />
          <HealthTile
            label="Return Rate"
            value={formatPercent(data.returnRate)}
            tone={rateTone(data.returnRate)}
            caption="of orders returned"
          />
          <HealthTile
            label="Refund Rate"
            value={formatPercent(data.refundRate)}
            tone={rateTone(data.refundRate)}
            caption="of orders refunded"
          />
        </div>
      )}
    </SectionCard>
  );
}

function HealthTile({
  label,
  value,
  tone,
  direction,
  caption,
}: {
  label: string;
  value: string;
  tone: Tone;
  /** When present, renders an up/down arrow beside the value. */
  direction?: number;
  caption: string;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xs font-medium text-ink-soft">{label}</p>
      <p className={`mt-1 flex items-center gap-1 text-2xl font-semibold ${TONE_CLASSES[tone]}`}>
        {direction !== undefined && direction > 0 && (
          <ArrowUpIcon className="h-4 w-4" aria-hidden="true" />
        )}
        {direction !== undefined && direction < 0 && (
          <ArrowDownIcon className="h-4 w-4" aria-hidden="true" />
        )}
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">{caption}</p>
    </article>
  );
}
