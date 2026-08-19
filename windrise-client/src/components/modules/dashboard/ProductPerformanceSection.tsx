"use client";

import { useEffect, useState } from "react";

import { getProductPerformance } from "@/services/stats/stats";
import type { ProductPerformanceRow } from "@/types/stats";
import { EmptyState, SectionCard } from "./SectionCard";
import { formatNumber, formatPercent, formatTk } from "./dashboard.utils";

export function ProductPerformanceSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [rows, setRows] = useState<ProductPerformanceRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProductPerformance({ startDate, endDate, limit: 10 })
      .then((res) => !cancelled && setRows(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <SectionCard
      title="Product Performance"
      subtitle="Views and add-to-cart depend on storefront event tracking — counts start from when it went live"
      // Flex/grid children default to min-width:auto, which lets the wide table
      // push the whole page sideways on small screens instead of scrolling
      // inside its own card. min-w-0 restores the constraint.
      className="min-w-0"
    >
      {rows === null ? (
        <div className="h-[240px] animate-pulse rounded-xl bg-canvas" />
      ) : rows.length === 0 ? (
        <EmptyState message="No product activity in this range yet." />
      ) : (
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-muted">
                <th className="pb-2 pr-3 font-medium">Product</th>
                <th className="pb-2 pr-3 font-medium">Views</th>
                <th className="pb-2 pr-3 font-medium">Add to Cart</th>
                <th className="pb-2 pr-3 font-medium">Orders</th>
                <th className="pb-2 pr-3 font-medium">Units Sold</th>
                <th className="pb-2 pr-3 font-medium">Revenue</th>
                <th className="pb-2 pr-3 font-medium">Conv. Rate</th>
                <th className="pb-2 font-medium">Return Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.productId} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink">{p.name}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{formatNumber(p.views)}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{formatNumber(p.addToCart)}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{formatNumber(p.orders)}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{formatNumber(p.unitsSold)}</td>
                  <td className="py-2.5 pr-3 text-ink">{formatTk(p.revenue)}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{formatPercent(p.conversionRate)}</td>
                  <td className="py-2.5 text-ink-soft">{formatPercent(p.returnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
