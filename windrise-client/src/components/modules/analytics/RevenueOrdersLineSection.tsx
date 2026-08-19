"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Label,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getRevenueChart } from "@/services/stats/stats";
import type { RevenuePoint } from "@/types/stats";
import { SectionCard, EmptyState } from "@/components/modules/dashboard/SectionCard";
import { SegmentedControl } from "@/components/modules/dashboard/SegmentedControl";
import {
  formatNumber,
  formatTk,
  formatTkCompact,
} from "@/components/modules/dashboard/dashboard.utils";

type Granularity = "day" | "week" | "month";

const GRANULARITY_OPTIONS: { id: Granularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const SERIES = {
  revenue: { key: "revenue", label: "Revenue", color: "#3987e5", axis: "left" as const },
  orders: { key: "orders", label: "Orders", color: "#16a34a", axis: "right" as const },
  aov: { key: "aov", label: "Avg. Order Value", color: "#a855f7", axis: "left" as const },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function MultiTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-ink">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p: any) => (
          <li key={p.dataKey} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-ink-soft">{p.name}</span>
            <span className="ml-auto font-medium text-ink">
              {p.dataKey === "orders"
                ? `${formatNumber(p.value ?? 0)} orders`
                : formatTk(p.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Multi-line chart on two axes: money series share the left axis, order count
 * uses the right, so a small order count isn't flattened by large ৳ values.
 */
export function RevenueOrdersLineSection({
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
    rows: RevenuePoint[] | null;
    failed: boolean;
  }>({ key: "", rows: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    const key = `${startDate}|${endDate}|${granularity}`;
    getRevenueChart({ startDate, endDate, granularity })
      .then((res) => !cancelled && setResult({ key, rows: res, failed: false }))
      .catch(() => !cancelled && setResult({ key, rows: null, failed: true }));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, granularity]);

  const settled = result.key === requestKey;
  const rows = settled ? result.rows : null;
  const failed = settled && result.failed;

  // AOV isn't returned by the API — it is revenue ÷ orders per bucket.
  const data = rows?.map((row) => ({
    ...row,
    aov: row.orders === 0 ? 0 : Math.round((row.revenue / row.orders) * 100) / 100,
  }));

  const toggle = (name: string) =>
    setHidden((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <SectionCard
      title="Revenue, Orders & AOV"
      subtitle="Three series on two axes — click a legend item to show or hide it"
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
          Couldn&apos;t load the trend for this range.
        </p>
      ) : !data ? (
        <div className="h-[300px] animate-pulse rounded-xl bg-canvas" />
      ) : data.length === 0 ? (
        <EmptyState message="No sales in this range." />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatTkCompact(Number(v))}
                width={64}
              >
                <Label
                  value="Revenue / AOV (৳)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 11, fill: "#94a3b8", textAnchor: "middle" }}
                />
              </YAxis>
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                width={48}
              >
                <Label
                  value="Orders"
                  angle={90}
                  position="insideRight"
                  style={{ fontSize: 11, fill: "#94a3b8", textAnchor: "middle" }}
                />
              </YAxis>
              <Tooltip content={<MultiTooltip />} />
              <Legend
                onClick={(entry) => toggle(String(entry.dataKey ?? entry.value))}
                wrapperStyle={{ fontSize: 12, cursor: "pointer", paddingTop: 8 }}
              />
              {Object.values(SERIES).map((series) => (
                <Line
                  key={series.key}
                  yAxisId={series.axis}
                  type="monotone"
                  dataKey={series.key}
                  name={series.label}
                  stroke={series.color}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  hide={hidden.includes(series.key)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
