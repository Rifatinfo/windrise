"use client";

import { useEffect, useState } from "react";

import { getBestCustomers, getCustomerLifetimeValue } from "@/services/stats/stats";
import type { BestCustomerRow, CustomerLifetimeValue } from "@/types/stats";
import { EmptyState, SectionCard } from "./SectionCard";
import { formatPercent, formatTk } from "./dashboard.utils";
import { StatCard, StatCardGrid } from "./StatCard";

export function BestCustomersSection() {
  const [rows, setRows] = useState<BestCustomerRow[] | null>(null);
  const [clv, setClv] = useState<CustomerLifetimeValue | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBestCustomers(10)
      .then((res) => !cancelled && setRows(res))
      .catch(() => {});
    getCustomerLifetimeValue()
      .then((res) => !cancelled && setClv(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard title="Best Customers" subtitle="Ranked by lifetime spend">
        {rows === null ? (
          <div className="h-[260px] animate-pulse rounded-xl bg-canvas" />
        ) : rows.length === 0 ? (
          <EmptyState message="No customer orders yet." />
        ) : (
          <ol className="space-y-2.5">
            {rows.map((c, i) => (
              <li key={c.userId} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink-soft">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{c.name}</p>
                  <p className="text-xs text-ink-muted">
                    {c.totalOrders} orders · avg {formatTk(c.avgOrderValue)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-ink">{formatTk(c.totalSpent)}</p>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      <SectionCard title="Customer Lifetime Value">
        {!clv ? (
          <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <StatCardGrid>
            <StatCard label="Average CLV" value={formatTk(clv.averageCLV)} />
            <StatCard label="Highest Customer Value" value={formatTk(clv.highestCLV)} />
            <StatCard label="Total Customer Revenue" value={formatTk(clv.totalCustomerRevenue)} />
            <StatCard label="Repeat Purchase Rate" value={formatPercent(clv.repeatPurchaseRate)} />
          </StatCardGrid>
        )}
      </SectionCard>
    </div>
  );
}
