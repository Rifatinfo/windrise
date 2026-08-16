"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PackageIcon, EyeIcon } from "lucide-react";
import type { Order } from "@/types/order";
import { getMyOrders } from "@/services/order/order";
import { mapServerOrdersToUi } from "@/lib/orderMapper";
import { formatBdt, formatDate, itemCount } from "@/utils/format";
import { STATUS_META, getPaymentMethodDisplay } from "@/utils/orderFlow";

export function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMyOrders()
      .then((res) => {
        if (!cancelled) setOrders(mapServerOrdersToUi(res.data ?? []));
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load orders");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <Loader2Icon className="h-6 w-6 animate-spin text-[#8f8f8f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-[13px] text-[#e0322b]">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <PackageIcon className="h-10 w-10 text-[#bdbdbd]" />
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">No orders yet</h1>
        <p className="text-[12px] text-[#8f8f8f]">You haven&apos;t placed any orders.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
        >
          SHOP NOW
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 sm:px-10 lg:px-14 lg:pt-10 lg:pb-24">
        <h1 className="text-[17px] tracking-[0.02em] text-[#1a1a1a]">MY ORDERS</h1>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#e6e6e6]">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e6e6] bg-[#fafafa] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8f8f8f]">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const meta = STATUS_META[order.status];
                const paymentDisplay = getPaymentMethodDisplay(order.payment.method, order.payment.gateway);
                return (
                  <tr
                    key={order.id}
                    className="border-b border-[#ededed] align-middle transition-colors hover:bg-[#fafafa]"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-[#1a1a1a]">#{order.orderNo}</p>
                      <p className="text-[10px] text-[#8f8f8f]">{paymentDisplay.short}</p>
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#4a4a4a]">
                      {formatDate(order.placedAt)}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#4a4a4a]">
                      {itemCount(order)} items
                    </td>
                    <td className="px-4 py-4 text-[13px] font-semibold text-[#1a1a1a]">
                      {formatBdt(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-medium ${meta.chip}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/order-tracking/${order.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#d6d6d6] px-3 py-1.5 text-[11px] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                      >
                        <EyeIcon className="h-3.5 w-3.5" />
                        Track
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
