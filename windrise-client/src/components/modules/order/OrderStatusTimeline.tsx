"use client";

import { useMemo } from "react";
import {
  CheckIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  PackageCheckIcon,
  PackageOpenIcon,
  TruckIcon,
} from "lucide-react";
import type { Order } from "@/types/order";
import { buildTimeline, isDropped, PIPELINE, STATUS_META } from "@/utils/orderFlow";

interface OrderStatusTimelineProps {
  order: Order;
}

const STEPS: { status: string; label: string; icon: typeof CheckIcon }[] = [
  { status: "placed", label: "Placed", icon: ClipboardListIcon },
  { status: "confirmed", label: "Confirmed", icon: ClipboardCheckIcon },
  { status: "processed", label: "Processed", icon: PackageOpenIcon },
  { status: "on_the_way", label: "On the Way", icon: TruckIcon },
  { status: "delivered", label: "Delivered", icon: PackageCheckIcon },
];

function formatDateOnly(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const dropped = useMemo(() => isDropped(order.status), [order]);
  const currentIndex = dropped ? -1 : PIPELINE.indexOf(order.status);
  const timeline = useMemo(() => buildTimeline(order.status, order.placedAt), [order]);
  const progress = currentIndex < 0 ? 0 : currentIndex * 20;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <TruckIcon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-ink">Order Status</h3>
      </div>

      <div
        role="group"
        aria-label={`Order status — ${STATUS_META[order.status].label}`}
        className="px-4 py-6 sm:px-6"
      >
        {/* Icons + progress line */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-slate-200"
          />
          <div
            aria-hidden="true"
            className="absolute left-[10%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-brand transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <ol className="relative flex list-none">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx < currentIndex || (idx === currentIndex && idx === STEPS.length - 1);
              const isCurrent = idx === currentIndex && idx < STEPS.length - 1;

              return (
                <li key={step.status} className="flex flex-1 justify-center">
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 sm:h-10 sm:w-10 ${
                      isDone
                        ? "bg-brand text-white"
                        : isCurrent
                          ? "bg-brand text-white ring-4 ring-brand/20"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isDone ? (
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    ) : (
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Labels + secondary value */}
        <div className="mt-2.5 flex">
          {STEPS.map((step, idx) => {
            const isReached = currentIndex >= idx;
            return (
              <div key={step.status} className="flex-1 px-0.5 text-center sm:px-1">
                <p
                  className={`text-[11px] font-medium leading-tight sm:text-xs ${
                    isReached ? "text-ink" : "text-ink-muted"
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 min-h-3 text-[10px] tabular-nums text-ink-muted sm:text-[11px]">
                  {isReached && timeline[idx] ? formatDateOnly(timeline[idx].at) : ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
