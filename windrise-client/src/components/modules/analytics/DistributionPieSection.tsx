"use client";

import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getOrderStatusOverview, getSalesByPaymentMethod } from "@/services/stats/stats";
import type { OrderStatusOverview, PaymentMethodRow } from "@/types/stats";
import { SectionCard, EmptyState } from "@/components/modules/dashboard/SectionCard";
import { SegmentedControl } from "@/components/modules/dashboard/SegmentedControl";
import {
  CATEGORICAL,
  formatNumber,
  formatPercent,
  formatTk,
} from "@/components/modules/dashboard/dashboard.utils";

type Mode = "status" | "payment";

const MODE_OPTIONS: { id: Mode; label: string }[] = [
  { id: "status", label: "Order Status" },
  { id: "payment", label: "Payment" },
];

type Slice = { name: string; value: number; isMoney: boolean };

/* eslint-disable @typescript-eslint/no-explicit-any */
function PieTooltip({ active, payload, total }: any) {
  if (!active || !payload?.length) return null;
  const slice = payload[0];
  const value = slice.value as number;
  const share = total === 0 ? 0 : (value / total) * 100;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-ink">{slice.name}</p>
      <p className="mt-0.5 text-ink-soft">
        {slice.payload.isMoney ? formatTk(value) : `${formatNumber(value)} orders`} ·{" "}
        {formatPercent(share)}
      </p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Donut chart with a toggle between two distributions that are both
 * genuinely "share of a whole": order status and payment method.
 */
export function DistributionPieSection({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const [mode, setMode] = useState<Mode>("status");

  const requestKey = `${startDate}|${endDate}|${mode}`;
  const [result, setResult] = useState<{
    key: string;
    slices: Slice[] | null;
    failed: boolean;
  }>({ key: "", slices: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    const key = `${startDate}|${endDate}|${mode}`;

    const load = async (): Promise<Slice[]> => {
      if (mode === "payment") {
        const rows: PaymentMethodRow[] = await getSalesByPaymentMethod({ startDate, endDate });
        return rows
          .filter((r) => r.revenue > 0)
          .map((r) => ({ name: r.method, value: r.revenue, isMoney: true }));
      }
      const s: OrderStatusOverview = await getOrderStatusOverview({ startDate, endDate });
      return (
        [
          ["Placed", s.pending],
          ["Confirmed", s.confirmed],
          ["Processing", s.processing],
          ["Shipped", s.shipped],
          ["Delivered", s.delivered],
          ["Cancelled", s.cancelled],
          ["Failed", s.failed],
        ] as const
      )
        .filter(([, count]) => count > 0)
        .map(([name, count]) => ({ name, value: count, isMoney: false }));
    };

    load()
      .then((slices) => !cancelled && setResult({ key, slices, failed: false }))
      .catch(() => !cancelled && setResult({ key, slices: null, failed: true }));

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, mode]);

  const settled = result.key === requestKey;
  const slices = settled ? result.slices : null;
  const failed = settled && result.failed;
  const total = slices?.reduce((sum, s) => sum + s.value, 0) ?? 0;

  return (
    <SectionCard
      title="Distribution"
      subtitle={
        mode === "status"
          ? "Share of orders by status in this range"
          : "Share of revenue by payment method"
      }
      action={
        <SegmentedControl
          options={MODE_OPTIONS}
          value={mode}
          onChange={(id) => setMode(id as Mode)}
        />
      }
    >
      {failed ? (
        <p className="py-10 text-center text-sm text-ink-muted">
          Couldn&apos;t load this distribution.
        </p>
      ) : !slices ? (
        <div className="h-[280px] animate-pulse rounded-xl bg-canvas" />
      ) : slices.length === 0 ? (
        <EmptyState message="Nothing to show for this range." />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="80%"
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {slices.map((slice, i) => (
                  <Cell key={slice.name} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip total={total} />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}
