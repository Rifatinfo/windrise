import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { changeTone, formatPercent } from "./dashboard.utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon?: LucideIcon;
  caption?: string;
}

const TONE_CLASSES: Record<"good" | "bad" | "muted", string> = {
  good: "text-good",
  bad: "text-bad",
  muted: "text-ink-muted",
};

export function StatCard({ label, value, change, icon: Icon, caption }: StatCardProps) {
  const tone = change === undefined ? "muted" : changeTone(change);

  return (
    <article className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card">
      {Icon && (
        <span className="rounded-lg bg-brand-soft p-2 text-brand">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-ink-soft">{label}</p>
        <p className="mt-0.5 text-xl font-semibold text-ink">{value}</p>
        {/* wraps so the "vs previous period" caption can drop to its own line
            in narrow cards instead of pushing the page sideways */}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs">
          {change !== undefined && (
            <span className={`flex items-center gap-0.5 font-medium ${TONE_CLASSES[tone]}`}>
              {tone === "good" && <ArrowUpIcon className="h-3 w-3" aria-hidden="true" />}
              {tone === "bad" && <ArrowDownIcon className="h-3 w-3" aria-hidden="true" />}
              {formatPercent(Math.abs(change))}
            </span>
          )}
          {caption && <span className="text-ink-muted">{caption}</span>}
        </p>
      </div>
    </article>
  );
}

export function StatCardGrid({ children }: { children: ReactNode }) {
  // Sized off the card's own rendered width (container queries), not the viewport — this grid often
  // sits inside a narrowed column (e.g. a 40%/60% split), where a viewport breakpoint would still
  // force too many columns and squeeze/overlap each card's content.
  //
  // The wrapper must declare @container itself: without it these queries resolve
  // against whichever ancestor happens to be a container (the dashboard shell),
  // which forced 3 cramped columns onto a 390px phone.
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @sm:grid-cols-3 @2xl:grid-cols-4 @4xl:grid-cols-6">
        {children}
      </div>
    </div>
  );
}
