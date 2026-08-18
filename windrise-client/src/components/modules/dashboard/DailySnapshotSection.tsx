"use client";

import { useEffect, useState } from "react";

import { getDailySnapshot } from "@/services/stats/stats";
import type { DailySnapshot } from "@/types/stats";
import { formatNumber, formatTk } from "./dashboard.utils";
import { SectionCard } from "./SectionCard";
import { StatCard, StatCardGrid } from "./StatCard";

export function DailySnapshotSection() {
  const [data, setData] = useState<DailySnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDailySnapshot()
      .then((res) => !cancelled && setData(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionCard title="Today's Snapshot" subtitle={data?.date}>
      {!data ? (
        <div className="h-[100px] animate-pulse rounded-xl bg-canvas" />
      ) : (
        <StatCardGrid>
          <StatCard label="Revenue" value={formatTk(data.revenue)} />
          <StatCard label="Orders" value={formatNumber(data.orders)} />
          <StatCard label="Products Sold" value={formatNumber(data.productsSold)} />
          <StatCard label="New Customers" value={formatNumber(data.newCustomers)} />
          <StatCard label="Returning Customers" value={formatNumber(data.returningCustomers)} />
          <StatCard label="Refunds" value={formatNumber(data.refunds)} />
          <StatCard label="Discounts Given" value={formatTk(data.discounts)} />
        </StatCardGrid>
      )}
    </SectionCard>
  );
}
