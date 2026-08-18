"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ProductThumb } from "@/components/modules/inventory/ProductThumb";
import { getInventorySummary } from "@/services/stats/stats";
import type { InventorySummary } from "@/types/stats";
import { EmptyState, SectionCard } from "./SectionCard";

const STATUS_TONE: Record<string, string> = {
  "Out of Stock": "bg-red-50 text-bad",
  Critical: "bg-amber-50 text-warn",
  "Low Stock": "bg-amber-50 text-warn",
};

export function InventorySection() {
  const [data, setData] = useState<InventorySummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInventorySummary()
      .then((res) => !cancelled && setData(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SectionCard
        title="Inventory Overview"
        subtitle="Live stock health across the catalog"
        action={
          <Link href="/admin/inventory-management" className="text-xs font-medium text-brand hover:underline">
            Manage inventory
          </Link>
        }
      >
        {!data ? (
          <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.kpis.map((k) => (
              <div key={k.id} className="rounded-xl border border-line px-3 py-2.5">
                <p className="text-[11px] text-ink-muted">{k.label}</p>
                <p className="text-base font-semibold text-ink">{k.value}</p>
                <p className="text-[11px] text-ink-muted">{k.delta}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Low Stock Alerts" subtitle="Products that need restocking soon">
        {!data ? (
          <div className="h-[160px] animate-pulse rounded-xl bg-canvas" />
        ) : data.lowStockAlerts.length === 0 ? (
          <EmptyState message="Nothing is running low right now." />
        ) : (
          <ul className="divide-y divide-line/60">
            {data.lowStockAlerts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <ProductThumb image={p.image} name={p.name} emoji="📦" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">{p.currentStock} left</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[p.status] ?? "bg-canvas text-ink-soft"}`}>
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
