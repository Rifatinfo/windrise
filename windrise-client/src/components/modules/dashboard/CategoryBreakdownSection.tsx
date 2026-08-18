"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getSalesByCategory, getSalesBySubcategory } from "@/services/stats/stats";
import type { CategoryBreakdownRow } from "@/types/stats";
import { CATEGORICAL, formatNumber, formatPercent, formatTk, formatTkCompact } from "./dashboard.utils";
import { EmptyState, SectionCard } from "./SectionCard";

type Tab = "category" | "subcategory";

export function CategoryBreakdownSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [tab, setTab] = useState<Tab>("category");
  const [rows, setRows] = useState<CategoryBreakdownRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    const fetcher = tab === "category" ? getSalesByCategory : getSalesBySubcategory;
    fetcher({ startDate, endDate })
      .then((res) => !cancelled && setRows(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, tab]);

  return (
    <SectionCard
      title="Sales by Category"
      subtitle="Revenue across product categories"
      action={
        <div className="flex rounded-lg border border-line bg-canvas p-0.5 text-xs font-medium">
          {(["category", "subcategory"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-2.5 py-1 capitalize transition-colors ${
                tab === t ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      }
    >
      {rows === null ? (
        <div className="h-[280px] animate-pulse rounded-xl bg-canvas" />
      ) : rows.length === 0 ? (
        <EmptyState message="No sales for this range yet." />
      ) : (
        <ResponsiveContainer key={tab} width="100%" height={280}>
          <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke="#e1e0d9" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: "#c3c2b7" }}
              tick={{ fontSize: 11, fill: "#52514e" }}
              angle={rows.length > 5 ? -20 : 0}
              textAnchor={rows.length > 5 ? "end" : "middle"}
              height={rows.length > 5 ? 46 : 28}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#898781" }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(v) => formatTkCompact(v)}
            />
            <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={<CategoryTooltip />} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false}>
              {rows.map((row, i) => (
                <Cell key={row.name} fill={CATEGORICAL[i % CATEGORICAL.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
}

interface CategoryTooltipPayload {
  payload: CategoryBreakdownRow;
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: CategoryTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{d.name}</p>
      <p className="mt-1 text-ink-soft">
        Revenue: <span className="font-medium text-ink">{formatTk(d.revenue)}</span>
      </p>
      <p className="text-ink-soft">
        Orders: <span className="font-medium text-ink">{formatNumber(d.orders)}</span> · Units:{" "}
        <span className="font-medium text-ink">{formatNumber(d.unitsSold)}</span>
      </p>
      <p className="mt-1 text-ink-muted">{formatPercent(d.percentage)} of total revenue</p>
    </div>
  );
}
