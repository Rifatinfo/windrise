"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { getSalesFunnel } from "@/services/stats/stats";
import type { FunnelStage } from "@/types/stats";
import { CATEGORICAL, formatNumber, formatPercent } from "./dashboard.utils";
import { EmptyState, SectionCard } from "./SectionCard";

export function SalesFunnelSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [stages, setStages] = useState<FunnelStage[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSalesFunnel({ startDate, endDate })
      .then((res) => !cancelled && setStages(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const hasData = stages && stages.some((s) => s.value > 0);

  return (
    <SectionCard title="Sales Funnel" subtitle="Visitors → Product Views → Add to Cart → Checkout → Purchase">
      {stages === null ? (
        <div className="h-[240px] animate-pulse rounded-xl bg-canvas" />
      ) : !hasData ? (
        <EmptyState message="No funnel activity in this range yet." />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stages} layout="vertical" margin={{ top: 4, right: 44, left: 0, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke="#e1e0d9" strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stage"
              width={92}
              tick={{ fontSize: 11, fill: "#52514e" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "rgba(11,11,11,0.04)" }} content={<FunnelTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} isAnimationActive={false}>
              {stages.map((s, i) => (
                <Cell key={s.stage} fill={CATEGORICAL[i % CATEGORICAL.length]} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={(v: unknown) => formatNumber(Number(v ?? 0))}
                style={{ fontSize: 11, fontWeight: 600, fill: "#0b0b0b" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
}

interface FunnelTooltipPayload {
  payload: FunnelStage;
}

function FunnelTooltip({ active, payload }: { active?: boolean; payload?: FunnelTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-ink">{d.stage}</p>
      <p className="mt-1 text-ink-soft">
        Count: <span className="font-medium text-ink">{formatNumber(d.value)}</span>
      </p>
      <p className="text-ink-muted">{formatPercent(d.conversionFromPrevious)} of previous stage</p>
      <p className="text-ink-muted">{formatPercent(d.conversionFromStart)} of visitors</p>
    </div>
  );
}
