"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PackageIcon, TruckIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import type { Order } from "@/types/order";
import { getOrderById } from "@/services/order/order";
import { mapServerOrdersToUi } from "@/lib/orderMapper";
import { formatBdt, formatDate, itemCount } from "@/utils/format";
import { buildTimeline, getPaymentMethodDisplay, STATUS_META } from "@/utils/orderFlow";

export function OrderTracking({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOrderById(orderId)
      .then((res) => {
        if (!cancelled) setOrder(mapServerOrdersToUi([res.data])[0]);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const timeline = useMemo(() => {
    if (!order) return [];
    return buildTimeline(order.status, order.placedAt);
  }, [order]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <Loader2Icon className="h-6 w-6 animate-spin text-[#8f8f8f]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-[13px] text-[#e0322b]">{error || "Order not found"}</p>
        <button
          type="button"
          onClick={() => router.push("/my-orders")}
          className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
        >
          MY ORDERS
        </button>
      </div>
    );
  }

  const statusMeta = STATUS_META[order.status];
  const paymentDisplay = getPaymentMethodDisplay(order.payment.method, order.payment.gateway);

  return (
    <div className="w-full min-h-full bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-10 lg:px-14 lg:pt-10 lg:pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[17px] tracking-[0.02em] text-[#1a1a1a]">ORDER TRACKING</h1>
          <button
            type="button"
            onClick={() => router.push("/my-orders")}
            className="h-[30px] border border-[#d6d6d6] px-3 text-[10px] tracking-[0.08em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
          >
            BACK TO ORDERS
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Status card */}
          <div className="rounded-xl border border-[#e6e6e6] p-5 lg:col-span-1">
            
            <div className="mt-5 space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#8f8f8f]">Order Number</span>
                <span className="font-medium text-[#1a1a1a]">#{order.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f8f8f]">Order Date</span>
                <span className="text-[#1a1a1a]">{formatDate(order.placedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f8f8f]">Items</span>
                <span className="text-[#1a1a1a]">{itemCount(order)} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f8f8f]">Total</span>
                <span className="font-medium text-[#1a1a1a]">{formatBdt(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f8f8f]">Payment</span>
                <span className="text-[#1a1a1a]">
                  {paymentDisplay.label} ({order.payment.state})
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-[#e6e6e6] p-5 lg:col-span-2">
            <h2 className="text-[13px] font-semibold text-[#1a1a1a]">Shipment Timeline</h2>
            <ol className="relative mt-5 space-y-0">
              {timeline.map((event, idx) => {
                const isLast = idx === timeline.length - 1;
                return (
                  <li key={idx} className="relative flex gap-4 pb-8 last:pb-0">
                    {!isLast && (
                      <span className="absolute left-[11px] top-6 h-full w-px bg-[#e6e6e6]" />
                    )}
                    <span
                      className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        isLast
                          ? "border-[#1a1a1a] bg-[#1a1a1a]"
                          : "border-[#d4d4d4] bg-white"
                      }`}
                    >
                      {isLast && <CheckCircle2Icon className="h-3.5 w-3.5 text-white" />}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{event.label}</p>
                      <p className="text-[11px] text-[#8f8f8f]">{formatDate(event.at)}</p>
                      {event.note && <p className="mt-1 text-[11px] text-[#8f8f8f]">{event.note}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Items */}
        <div className="mt-8 rounded-xl border border-[#e6e6e6] p-5">
          <h2 className="text-[13px] font-semibold text-[#1a1a1a]">Order Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-4 border-b border-[#ededed] pb-4 last:border-0 last:pb-0">
                <img
                  src={item.image ?? "/placeholder.png"}
                  alt={item.name}
                  className="h-[100px] w-[75px] shrink-0 bg-[#f4f4f4] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</h3>
                  <dl className="mt-2 space-y-1 text-[11px]">
                    {item.sku && (
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">SKU:</dt>
                        <dd className="text-[#1a1a1a]">{item.sku}</dd>
                      </div>
                    )}
                    {item.size && (
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Size:</dt>
                        <dd className="text-[#1a1a1a]">{item.size}</dd>
                      </div>
                    )}
                    {item.color && (
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Color:</dt>
                        <dd className="text-[#1a1a1a]">{item.color}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium text-[#1a1a1a]">{formatBdt(item.total)}</p>
                  <p className="text-[11px] text-[#8f8f8f]">Qty {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
