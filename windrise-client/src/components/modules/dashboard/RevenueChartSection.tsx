"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getRevenueChart } from "@/services/stats/stats";
import type { RevenuePoint } from "@/types/stats";
import { SectionCard, EmptyState } from "./SectionCard";
import { SegmentedControl } from "./SegmentedControl";
import { formatNumber, formatTkCompact, SEQUENTIAL_BLUE } from "./dashboard.utils";

type Granularity = "day" | "week" | "month";
type Metric = "revenue" | "orders";

const GRANULARITY_OPTIONS: { id: Granularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

function ChartTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value as number;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-ink-soft">
        {metric === "revenue" ? formatTkCompact(value) : `${formatNumber(value)} orders`}
      </p>
    </div>
  );
}

export function RevenueChartSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [data, setData] = useState<RevenuePoint[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRevenueChart({ startDate, endDate, granularity })
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setData([]));
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, granularity]);

  return (
    <SectionCard
      title="Revenue & Sales"
      subtitle="Revenue and order volume over the selected range"
      action={
        <div className="flex items-center gap-2">
          <SegmentedControl
            value={metric}
            options={[
              { id: "revenue", label: "Revenue" },
              { id: "orders", label: "Orders" },
            ]}
            onChange={setMetric}
          />
          <SegmentedControl value={granularity} options={GRANULARITY_OPTIONS} onChange={setGranularity} />
        </div>
      }
    >
      {data === null ? (
        <div className="h-[260px] animate-pulse rounded-xl bg-canvas" />
      ) : data.length === 0 ? (
        <EmptyState message="No orders in this range yet." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SEQUENTIAL_BLUE[4]} stopOpacity={0.28} />
                <stop offset="100%" stopColor={SEQUENTIAL_BLUE[4]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={{ stroke: "#c3c2b7" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => (metric === "revenue" ? formatTkCompact(v) : String(v))}
            />
            <Tooltip content={<ChartTooltip metric={metric} />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={SEQUENTIAL_BLUE[4]}
              strokeWidth={2}
              fill="url(#revenueFill)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
}
