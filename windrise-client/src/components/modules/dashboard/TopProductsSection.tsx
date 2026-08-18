"use client";

import { useEffect, useState } from "react";

import { ProductThumb } from "@/components/modules/inventory/ProductThumb";
import { getTopProducts } from "@/services/stats/stats";
import type { TopProductRow } from "@/types/stats";
import { EmptyState, SectionCard } from "./SectionCard";
import { formatNumber, formatTk } from "./dashboard.utils";

const STATUS_LABEL: Record<string, string> = {
  IN_STOCK: "In Stock",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out of Stock",
};

export function TopProductsSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [rows, setRows] = useState<TopProductRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTopProducts({ startDate, endDate, limit: 8 })
      .then((res) => !cancelled && setRows(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <SectionCard title="Top Selling Products" subtitle="Ranked by revenue in the selected range">
      {rows === null ? (
        <div className="h-[280px] animate-pulse rounded-xl bg-canvas" />
      ) : rows.length === 0 ? (
        <EmptyState message="No product sales in this range yet." />
      ) : (
        <ul className="divide-y divide-line/60">
          {rows.map((p) => (
            <li key={p.productId} className="flex items-center gap-3 py-2.5">
              <ProductThumb image={p.image} name={p.name} emoji="📦" size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                <p className="text-xs text-ink-muted">
                  {formatNumber(p.unitsSold)} units · {formatNumber(p.currentStock)} in stock ·{" "}
                  {STATUS_LABEL[p.status] ?? p.status}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-ink">{formatTk(p.revenue)}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
