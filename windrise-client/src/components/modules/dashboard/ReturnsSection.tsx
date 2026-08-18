"use client";

import { useEffect, useState } from "react";

import { getReturnReasons, getReturnsOverview } from "@/services/stats/stats";
import type { ReturnReasonRow, ReturnsOverview } from "@/types/stats";
import { BreakdownBarList } from "./BreakdownBarList";
import { formatNumber, formatPercent, formatTk } from "./dashboard.utils";
import { SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

const REASON_LABEL: Record<string, string> = {
  WRONG_SIZE: "Wrong Size",
  DAMAGED_PRODUCT: "Damaged Product",
  WRONG_PRODUCT: "Wrong Product",
  CHANGED_MIND: "Customer Changed Mind",
  NOT_AS_EXPECTED: "Product Not as Expected",
  OTHER: "Other Reasons",
};

export function ReturnsSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [overview, setOverview] = useState<ReturnsOverview | null>(null);
  const [reasons, setReasons] = useState<ReturnReasonRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReturnsOverview({ startDate, endDate })
      .then((res) => !cancelled && setOverview(res))
      .catch(() => {});
    getReturnReasons({ startDate, endDate })
      .then((res) => !cancelled && setReasons(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard title="Refund & Return Overview">
        {!overview ? (
          <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <StatCardGrid>
            <StatCard label="Returned Orders" value={formatNumber(overview.totalReturnedOrders)} />
            <StatCard label="Return Rate" value={formatPercent(overview.returnRate)} />
            <StatCard label="Refund Rate" value={formatPercent(overview.refundRate)} />
            <StatCard label="Pending Refunds" value={formatNumber(overview.pendingRefunds)} />
            <StatCard label="Completed Refunds" value={formatNumber(overview.completedRefunds)} />
            <StatCard label="Refunded Amount" value={formatTk(overview.refundedAmount)} />
          </StatCardGrid>
        )}
      </SectionCard>

      <SectionCard title="Return Reasons">
        {reasons === null ? (
          <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <BreakdownBarList
            valueFormatter={(v) => `${v}`}
            rows={reasons.map((r) => ({
              name: REASON_LABEL[r.reason] ?? r.reason,
              value: r.count,
              percentage: r.percentage,
            }))}
          />
        )}
      </SectionCard>
    </div>
  );
}
