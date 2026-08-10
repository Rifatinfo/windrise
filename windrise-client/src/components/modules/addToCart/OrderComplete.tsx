"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOrderById } from "@/services/order/order";

type OrderItem = {
  id: string;
  productName: string;
  sku: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  total: number;
  productImage: string | null;
};

type Order = {
  id: string;
  orderNo: string | null;
  name: string;
  phone: string;
  state: string;
  address: string;
  checkoutEmail: string | null;
  createdAt: string;
  subtotal: number;
  totalAmount: number;
  deliveryCharge: number | null;
  items: OrderItem[];
};

export function OrderComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const status = searchParams.get("status") ?? "";
  const statusMessage = searchParams.get("message") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    getOrderById(orderId)
      .then((res) => {
        if (!cancelled) setOrder(res.data as Order);
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

  const statusTitle =
    status === "fail"
      ? "PAYMENT FAILED"
      : status === "cancel"
        ? "PAYMENT CANCELLED"
        : "THANKS FOR YOUR ORDER!";

  const statusSubtitle =
    status === "fail"
      ? statusMessage || "We couldn't process your payment."
      : status === "cancel"
        ? statusMessage || "You cancelled the payment."
        : null;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <p className="text-[12px] text-[#8f8f8f]">Loading order details...</p>
      </div>
    );
  }

  if (error || (!order && !status)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white">
        {status ? (
          <>
            <h1 className="text-[15px] font-semibold tracking-[0.04em] text-[#1a1a1a]">
              {statusTitle}
            </h1>
            {statusSubtitle && (
              <p className="text-[12px] text-[#8f8f8f]">{statusSubtitle}</p>
            )}
          </>
        ) : (
          <p className="text-[12px] text-[#e0322b]">{error || "Order not found"}</p>
        )}
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

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-white">
        <h1 className="text-[15px] font-semibold tracking-[0.04em] text-[#1a1a1a]">
          {statusTitle}
        </h1>
        {statusSubtitle && (
          <p className="text-[12px] text-[#8f8f8f]">{statusSubtitle}</p>
        )}
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

  const addressLines = [
    order.checkoutEmail,
    order.phone,
    order.address,
    order.state,
  ].filter(Boolean) as string[];

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  const items = order.items ?? [];
  const subtotal = order.subtotal ?? 0;
  const deliveryCharge = order.deliveryCharge ?? 0;
  const total = order.totalAmount ?? 0;

  return (
    <div className="w-full min-h-full bg-white">
      {/* Confirmation band */}
      <section className="w-full bg-[#f1f6f7] px-5 py-10 sm:px-10 lg:py-14">
        <div className="mx-auto w-full max-w-[890px]">
          <h1 className="text-center text-[15px] font-semibold tracking-[0.04em] text-[#1a1a1a] lg:text-[17px]">
            {statusTitle}
          </h1>
          {statusSubtitle && (
            <p className="mt-2 text-center text-[11px] text-[#8f8f8f]">{statusSubtitle}</p>
          )}
          {!statusSubtitle && (
            <p className="mt-2 text-center text-[11px] text-[#8f8f8f]">
              Order No. {order.orderNo || order.id}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-8 text-center sm:grid-cols-3 sm:text-left lg:mt-10">
            <div>
              <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a]">SHIPPING TO</h2>
              <p className="mt-3 text-[12px] font-semibold text-[#1a1a1a]">{order.name}</p>
              <address className="mt-1 space-y-[3px] text-[11px] not-italic text-[#1a1a1a]">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div>
              <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a]">BILLING TO</h2>
              <p className="mt-3 text-[12px] font-semibold text-[#1a1a1a]">{order.name}</p>
              <address className="mt-1 space-y-[3px] text-[11px] not-italic text-[#1a1a1a]">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div>
              <h2 className="text-[10px] tracking-[0.1em] text-[#9a9a9a]">ORDER DATE</h2>
              <p className="mt-3 text-[11px] text-[#1a1a1a]">{orderDate}</p>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-[34px] w-[160px] bg-[#0b0b0b] text-[10px] tracking-[0.1em] text-white transition-opacity hover:opacity-90"
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="px-5 pb-16 pt-10 sm:px-10 lg:pb-24 lg:pt-14">
        <div className="mx-auto w-full max-w-[890px]">
          <h2 className="text-center text-[14px] text-[#1a1a1a]">Your Order Summary</h2>

          <div className="mt-8 grid grid-cols-[1fr_90px_90px] border-b border-[#e6e6e6] pb-2 text-[11px] tracking-[0.08em] text-[#4a4a4a]">
            <span>PRODUCT</span>
            <span className="text-center">QUANTITY</span>
            <span className="text-right">PRICE</span>
          </div>

          <ul>
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[1fr_44px_80px] items-start border-b border-[#ededed] py-5 sm:grid-cols-[1fr_90px_90px]"
              >
                <div className="flex gap-4">
                  <img
                    src={item.productImage || "/placeholder.png"}
                    alt={item.productName}
                    className="h-[110px] w-[80px] shrink-0 bg-[#f4f4f4] object-cover"
                  />
                  <div className="min-w-0 pt-1">
                    <h3 className="text-[13px] font-medium text-[#1a1a1a]">{item.productName}</h3>
                    <dl className="mt-2 space-y-1 text-[11px]">
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Product SKU:</dt>
                        <dd className="text-[#1a1a1a]">{item.sku}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Size:</dt>
                        <dd className="text-[#1a1a1a]">{item.size}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Color:</dt>
                        <dd className="text-[#1a1a1a]">{item.color}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <span className="pt-1 text-center text-[11px] text-[#1a1a1a]">
                  {item.quantity}
                </span>
                <span className="pt-1 text-right text-[14px] text-[#1a1a1a]">
                  ৳ {item.total}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 text-[11px]">
            <div className="flex items-center justify-between border-b border-[#ededed] py-3">
              <dt className="text-[#1a1a1a]">Subtotal</dt>
              <dd className="text-[#1a1a1a]">৳ {subtotal}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-[#ededed] py-3">
              <dt className="text-[#1a1a1a]">Shipping</dt>
              <dd className="text-[#1a1a1a]">৳ {deliveryCharge}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[12px] tracking-[0.06em] text-[#1a1a1a]">TOTAL</dt>
              <dd className="text-[18px] text-[#1a1a1a]">৳ {total}</dd>
            </div>
          </dl>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
            >
              BACK TO HOME
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
