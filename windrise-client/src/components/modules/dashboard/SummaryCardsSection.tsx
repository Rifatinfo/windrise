"use client";

import { useEffect, useState } from "react";
import { BadgeDollarSignIcon, PackageIcon, ReceiptIcon, ShoppingCartIcon, TrendingUpIcon, UsersIcon } from "lucide-react";

import { getSalesSummary } from "@/services/stats/stats";
import type { SalesSummary } from "@/types/stats";
import { StatCard, StatCardGrid } from "./StatCard";
import { formatNumber, formatPercent, formatTk } from "./dashboard.utils";

export function SummaryCardsSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<SalesSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSalesSummary({ startDate, endDate })
      .then((res) => !cancelled && setData(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  if (!data) {
    return (
      <StatCardGrid>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-xl bg-canvas" />
        ))}
      </StatCardGrid>
    );
  }

  return (
    <StatCardGrid>
      <StatCard
        label="Total Revenue"
        value={formatTk(data.revenue.value)}
        change={data.revenue.change}
        icon={BadgeDollarSignIcon}
        caption="vs previous period"
      />
      <StatCard
        label="Total Orders"
        value={formatNumber(data.orders.value)}
        change={data.orders.change}
        icon={ShoppingCartIcon}
        caption="vs previous period"
      />
      <StatCard
        label="Total Customers"
        value={formatNumber(data.customers.value)}
        change={data.customers.change}
        icon={UsersIcon}
        caption="vs previous period"
      />
      <StatCard
        label="Avg. Order Value"
        value={formatTk(data.aov.value)}
        change={data.aov.change}
        icon={ReceiptIcon}
        caption="vs previous period"
      />
      <StatCard
        label="Products Sold"
        value={formatNumber(data.productsSold.value)}
        change={data.productsSold.change}
        icon={PackageIcon}
        caption="vs previous period"
      />
      <StatCard
        label="Conversion Rate"
        value={formatPercent(data.conversionRate.value)}
        change={data.conversionRate.change}
        icon={TrendingUpIcon}
        caption="vs previous period"
      />
    </StatCardGrid>
  );
}
