"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getRecentOrders } from "@/services/stats/stats";
import type { RecentOrderRow } from "@/types/stats";
import { EmptyState, SectionCard } from "./SectionCard";
import { formatTk } from "./dashboard.utils";

export function RecentOrdersSection() {
  const [rows, setRows] = useState<RecentOrderRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRecentOrders(10)
      .then((res) => !cancelled && setRows(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionCard
      title="Recent Orders"
      subtitle="Latest 10 orders across the store"
      action={
        <Link href="/admin/orders" className="text-xs font-medium text-brand hover:underline">
          View all orders
        </Link>
      }
    >
      {rows === null ? (
        <div className="h-[240px] animate-pulse rounded-xl bg-canvas" />
      ) : rows.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-ink-muted">
                <th className="pb-2 pr-3 font-medium">Order</th>
                <th className="pb-2 pr-3 font-medium">Customer</th>
                <th className="pb-2 pr-3 font-medium">Product</th>
                <th className="pb-2 pr-3 font-medium">Amount</th>
                <th className="pb-2 pr-3 font-medium">Payment</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink">#{o.orderNo}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{o.customerName}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">
                    {o.product}
                    {o.additionalItems > 0 && <span className="text-ink-muted"> +{o.additionalItems} more</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-ink">{formatTk(o.amount)}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{o.paymentMethod}</td>
                  <td className="py-2.5">
                    <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-ink-soft">{o.orderStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
