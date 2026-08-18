"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2Icon,
  InboxIcon,
  PackageCheckIcon,
  PackageIcon,
  RotateCcwIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";

import { getOrderStatusOverview } from "@/services/stats/stats";
import type { OrderStatusOverview } from "@/types/stats";
import { SectionCard } from "./SectionCard";

const ROWS: { key: keyof OrderStatusOverview; label: string; icon: LucideIcon; tone: string }[] = [
  { key: "pending", label: "Pending", icon: InboxIcon, tone: "bg-slate-100 text-slate-600" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2Icon, tone: "bg-blue-50 text-blue-600" },
  { key: "processing", label: "Processing", icon: PackageIcon, tone: "bg-indigo-50 text-indigo-600" },
  { key: "shipped", label: "Shipped", icon: TruckIcon, tone: "bg-teal-50 text-teal-600" },
  { key: "delivered", label: "Delivered", icon: PackageCheckIcon, tone: "bg-emerald-50 text-emerald-600" },
  { key: "cancelled", label: "Cancelled", icon: XCircleIcon, tone: "bg-rose-50 text-rose-600" },
  { key: "returned", label: "Returned", icon: RotateCcwIcon, tone: "bg-amber-50 text-amber-600" },
];

export function OrderStatusSection({ startDate, endDate }: { startDate: string; endDate: string }) {
  const [data, setData] = useState<OrderStatusOverview | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOrderStatusOverview({ startDate, endDate })
      .then((res) => !cancelled && setData(res))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  return (
    <SectionCard title="Order Status Overview" subtitle={data ? `${data.total} orders in this range` : undefined}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5">
            <span className={`rounded-lg p-1.5 ${row.tone}`}>
              <row.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-ink-muted">{row.label}</p>
              <p className="text-base font-semibold text-ink">{data ? data[row.key] : "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
