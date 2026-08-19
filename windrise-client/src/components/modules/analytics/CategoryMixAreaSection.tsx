"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getCategoryRevenueSeries } from "@/services/stats/stats";
import type { CategoryRevenueSeries } from "@/types/stats";
import { SectionCard, EmptyState } from "@/components/modules/dashboard/SectionCard";
import { SegmentedControl } from "@/components/modules/dashboard/SegmentedControl";
import { CATEGORICAL, formatTk, formatTkCompact } from "@/components/modules/dashboard/dashboard.utils";

type Granularity = "day" | "week" | "month";

const GRANULARITY_OPTIONS: { id: Granularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
function StackTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-ink">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p: any) => (
          <li key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-ink-soft">{p.dataKey}</span>
            <span className="ml-auto font-medium text-ink">{formatTk(p.value ?? 0)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 border-t border-line pt-1 text-ink-soft">
        Total <span className="font-semibold text-ink">{formatTk(total)}</span>
      </p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Stacked area — shows how the revenue mix across categories shifts over the
 * selected range, rather than just the totals a single area chart gives.
 */
export function CategoryMixAreaSection({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [hidden, setHidden] = useState<string[]>([]);

  const requestKey = `${startDate}|${endDate}|${granularity}`;
  const [result, setResult] = useState<{
    key: string;
    data: CategoryRevenueSeries | null;
    failed: boolean;
  }>({ key: "", data: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    const key = `${startDate}|${endDate}|${granularity}`;
    getCategoryRevenueSeries({ startDate, endDate, granularity })
      .then((res) => !cancelled && setResult({ key, data: res, failed: false }))
      .catch(() => !cancelled && setResult({ key, data: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, granularity]);

  const settled = result.key === requestKey;
  const data = settled ? result.data : null;
  const failed = settled && result.failed;

  const toggleSeries = (name: string) =>
    setHidden((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <SectionCard
      title="Category Revenue Mix"
      subtitle="Stacked revenue by category — click a legend item to isolate it"
      action={
        <SegmentedControl
          options={GRANULARITY_OPTIONS}
          value={granularity}
          onChange={(id) => setGranularity(id as Granularity)}
        />
      }
    >
      {failed ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          Couldn&apos;t load the category mix for this range.
        </p>
      ) : !data ? (
        <div className="h-[280px] animate-pulse rounded-xl bg-canvas" />
      ) : data.points.length === 0 || data.categories.length === 0 ? (
        <EmptyState message="No category revenue in this range." />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.points} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
              <defs>
                {data.categories.map((name, i) => (
                  <linearGradient key={name} id={`mix-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CATEGORICAL[i % CATEGORICAL.length]} stopOpacity={0.85} />
                    <stop offset="100%" stopColor={CATEGORICAL[i % CATEGORICAL.length]} stopOpacity={0.35} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatTkCompact(Number(v))}
                width={62}
              />
              <Tooltip content={<StackTooltip />} />
              <Legend
                onClick={(entry) => toggleSeries(String(entry.dataKey ?? entry.value))}
                wrapperStyle={{ fontSize: 12, cursor: "pointer", paddingTop: 8 }}
              />
              {data.categories.map((name, i) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stackId="revenue"
                  hide={hidden.includes(name)}
                  stroke={CATEGORICAL[i % CATEGORICAL.length]}
                  fill={`url(#mix-${i})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
