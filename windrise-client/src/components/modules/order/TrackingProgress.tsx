"use client";

import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  HomeIcon,
  PackageIcon,
  PackageCheckIcon,
  TruckIcon,
  XCircleIcon,
} from "lucide-react";

import type { TrackedOrder } from "@/types/order";
import {
  buildTrackingSteps,
  isDroppedStatus,
  type TrackingStepKey,
} from "@/utils/orderFlow";

/** "6 Apr, 2026" — the compact form used across the tracking page. */
function trackingDate(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(/^(\d+) (\w+)/, "$1 $2,");
}

const STEP_ICONS: Record<TrackingStepKey, typeof PackageIcon> = {
  placed: PackageIcon,
  processed: PackageCheckIcon,
  on_the_way: TruckIcon,
  delivered: HomeIcon,
};

export function TrackingProgress({ order }: { order: TrackedOrder }) {
  const [copied, setCopied] = useState(false);
  const dropped = isDroppedStatus(order.orderStatus);
  const steps = buildTrackingSteps(order);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is unavailable (insecure origin / denied) — the ID is
      // already on screen, so there is nothing to recover from.
    }
  };

  return (
    <section className="rounded-[10px] border border-[#e6e6e6] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-5 lg:p-6">
      {/* Heading + delivery estimate */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a] lg:text-[15px]">
          Order Status
        </h2>

        {dropped ? (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-[6px] bg-[#fdecec] px-2.5 py-1.5 text-[11px] font-medium text-[#c0342d] lg:text-[12px]">
            <XCircleIcon className="h-[14px] w-[14px]" strokeWidth={1.8} />
            This order was {order.orderStatus.toLowerCase()}
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-[6px] bg-[#e9f7ee] px-2.5 py-1.5 text-[11px] font-medium text-[#1f8a4c] lg:text-[12px]">
            <TruckIcon className="h-[14px] w-[14px]" strokeWidth={1.8} />
            {order.deliveredAt
              ? `Delivered: ${trackingDate(order.deliveredAt)}`
              : `Estimated delivery: ${trackingDate(order.estimatedDeliveryAt)}`}
          </span>
        )}
      </div>

      {/* Order number */}
      <div className="mt-3 flex items-center gap-2">
        <p className="text-[11px] text-[#6b6b6b] lg:text-[12px]">
          Order ID:{" "}
          <span className="font-medium text-[#1a1a1a]">{order.orderNo}</span>
        </p>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy order ID ${order.orderNo}`}
          className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#e0e0e0] text-[#8f8f8f] transition-colors hover:bg-[#f5f5f5] hover:text-[#1a1a1a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1a1a1a]"
        >
          {copied ? (
            <CheckIcon className="h-[12px] w-[12px] text-[#1f8a4c]" strokeWidth={2.4} />
          ) : (
            <CopyIcon className="h-[12px] w-[12px]" strokeWidth={1.8} />
          )}
        </button>
        <span aria-live="polite" className="sr-only">
          {copied ? "Order ID copied" : ""}
        </span>
      </div>

      {dropped ? (
        <p className="mt-5 rounded-[8px] bg-[#faf7f7] px-4 py-4 text-[12px] leading-[19px] text-[#6b6b6b] lg:text-[13px]">
          This order is no longer on its way. If you think that is a mistake,
          contact support with your Order ID and we will look into it.
        </p>
      ) : (
        /* Milestones — a row on tablet and up, stacked on phones */
        <ol className="mt-6 flex flex-col sm:mt-8 sm:flex-row">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.key];
            const reached = step.state !== "upcoming";
            const nextReached =
              index < steps.length - 1 && steps[index + 1].state !== "upcoming";

            return (
              <li
                key={step.key}
                className="relative flex gap-3 pb-7 last:pb-0 sm:min-w-0 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center"
              >
                {/* Connector to the next milestone */}
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[13px] top-[30px] h-[calc(100%-30px)] w-[2px] sm:left-1/2 sm:top-[13px] sm:h-[2px] sm:w-full ${
                      nextReached ? "bg-[#22a25b]" : "bg-[#e6e6e6]"
                    }`}
                  />
                )}

                <span
                  className={`relative z-10 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border-2 ${
                    reached
                      ? "border-[#22a25b] bg-[#22a25b] text-white"
                      : "border-[#e0e0e0] bg-white text-[#b5b5b5]"
                  }`}
                >
                  {reached ? (
                    <CheckIcon className="h-[15px] w-[15px]" strokeWidth={3} />
                  ) : (
                    <Icon className="h-[14px] w-[14px]" strokeWidth={1.8} />
                  )}
                </span>

                <div className="min-w-0 sm:px-1">
                  <p
                    className={`text-[12px] font-semibold leading-[18px] lg:text-[13px] ${
                      step.state === "current"
                        ? "text-[#1f8a4c]"
                        : reached
                          ? "text-[#1a1a1a]"
                          : "text-[#6b6b6b]"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="mt-0.5 text-[11px] leading-[16px] text-[#9a9a9a] lg:text-[12px]">
                      {step.estimated ? "Est. " : ""}
                      {trackingDate(step.at)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
