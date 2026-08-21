"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, SearchIcon } from "lucide-react";

import { Breadcrumb } from "@/components/modules/addToCart/Breadcrumb";
import { trackOrder } from "@/services/order/order";
import type { TrackedOrder } from "@/types/order";
import { formatBdt } from "@/utils/format";
import { TrackingProgress } from "./TrackingProgress";

export function OrderTrackingLookup() {
  const router = useRouter();

  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Credentials of the order on screen, kept so it can be re-checked. */
  const tracked = useRef<{ orderNo: string; phone: string } | null>(null);

  /**
   * Re-check the order that is already on screen. The status shown has to
   * follow the dashboard: an admin moving the order along should reach the
   * customer without them re-submitting the form.
   */
  const refresh = useCallback(async () => {
    const current = tracked.current;
    if (!current) return;
    try {
      const res = await trackOrder(current.orderNo, current.phone);
      setOrder((previous) =>
        // Only re-render when something actually moved.
        previous && JSON.stringify(previous) === JSON.stringify(res.data)
          ? previous
          : res.data
      );
    } catch {
      // A failed background re-check must never replace the order already on
      // screen with an error — the next attempt can recover.
    }
  }, []);

  useEffect(() => {
    if (!order) return;

    // Poll while the tab is in front, and re-check the moment it comes back,
    // so a status change is picked up straight away rather than on a timer.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [order, refresh]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedOrderNo = orderNo.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedOrderNo || !trimmedPhone) {
      setError("Enter both your Order ID and the phone number on the order.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await trackOrder(trimmedOrderNo, trimmedPhone);
      tracked.current = { orderNo: trimmedOrderNo, phone: trimmedPhone };
      setOrder(res.data);
    } catch (err) {
      tracked.current = null;
      setOrder(null);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackAnother = () => {
    tracked.current = null;
    setOrder(null);
    setError("");
    setOrderNo("");
    setPhone("");
  };

  return (
    <div className="min-h-[100vh] w-full bg-white">
      {/* The site header is fixed (64px, 80px from lg), so the page clears it
          itself rather than starting underneath it. */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-4 pt-[76px] sm:px-10 lg:px-[48px] lg:pb-6 lg:pt-[96px]">
        <Breadcrumb current="Order Tracking" />
      </div>

      {order ? (
        <TrackingResult order={order} onTrackAnother={handleTrackAnother} onGoHome={() => router.push("/")} />
      ) : (
        <section className="px-5 pb-20 pt-16 sm:px-10 lg:pb-28 lg:pt-30">
          <div className="mx-auto w-full max-w-[340px]">
            <h1 className="text-[16px] font-medium text-[#1a1a1a] lg:text-[18px]">
              Order Tracking
            </h1>

            <form onSubmit={handleSubmit} className="mt-5 lg:mt-6" noValidate>
              <label htmlFor="track-order-no" className="block text-[11px] text-[#4a4a4a] lg:text-[12px]">
                Order ID
              </label>
              <input
                id="track-order-no"
                name="orderNo"
                value={orderNo}
                onChange={(event) => setOrderNo(event.target.value)}
                placeholder="XXXXXX"
                autoComplete="off"
                inputMode="numeric"
                aria-invalid={Boolean(error)}
                className="mt-1.5 h-[36px] w-full rounded-[4px] border border-[#d9d9d9] px-3 text-[12px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#c2c2c2] focus:border-[#1a1a1a] lg:h-[38px] lg:text-[13px]"
              />

              <label htmlFor="track-phone" className="mt-4 block text-[11px] text-[#4a4a4a] lg:text-[12px]">
                Phone Number
              </label>
              <input
                id="track-phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(error)}
                className="mt-1.5 h-[36px] w-full rounded-[4px] border border-[#d9d9d9] px-3 text-[12px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#c2c2c2] focus:border-[#1a1a1a] lg:h-[38px] lg:text-[13px]"
              />

              {error && (
                <p role="alert" className="mt-3 text-[11px] leading-[17px] text-[#c0342d] lg:text-[12px]">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-5 inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-[4px] bg-[#0b0b0b] text-[11px] font-medium tracking-[0.02em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:h-[38px] lg:text-[12px]"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="h-[14px] w-[14px] animate-spin" />
                    Tracking...
                  </>
                ) : (
                  "Track Order"
                )}
              </button>
            </form>

            <p className="mt-4 text-[11px] leading-[17px] text-[#9a9a9a]">
              Your Order ID is on the confirmation email and the invoice sent
              when you placed the order.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function TrackingResult({
  order,
  onTrackAnother,
  onGoHome,
}: {
  order: TrackedOrder;
  onTrackAnother: () => void;
  onGoHome: () => void;
}) {
  return (
    <section className="px-5 pb-16 pt-2 sm:px-10 lg:pb-24 lg:pt-4">
      <div className="mx-auto w-full max-w-[890px]">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <h1 className="text-[16px] font-semibold text-[#1a1a1a] sm:order-2 lg:text-[20px]">
            Track Your Order!
          </h1>
          <button
            type="button"
            onClick={onTrackAnother}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#6b6b6b] underline underline-offset-2 transition-colors hover:text-[#1a1a1a] sm:order-1 lg:text-[12px]"
          >
            <SearchIcon className="h-[13px] w-[13px]" strokeWidth={1.8} />
            Track another order
          </button>
          {/* Balances the flex row so the heading stays centred on tablet up */}
          <span aria-hidden="true" className="hidden sm:order-3 sm:block sm:w-[140px]" />
        </div>

        <div className="mt-6 lg:mt-8">
          <TrackingProgress order={order} />
        </div>

        {/* Items */}
        <h2 className="mt-9 text-[13px] font-medium text-[#1a1a1a] lg:mt-12 lg:text-[14px]">
          Items from the order
        </h2>

        {/* Column headings only make sense once the row is a table. On phones
            each item is a card and the quantity moves in with the details. */}
        <div className="mt-4 hidden border-b border-[#e6e6e6] pb-2 text-[10px] tracking-[0.08em] text-[#4a4a4a] sm:grid sm:grid-cols-[1fr_90px_90px] lg:text-[11px]">
          <span>PRODUCT</span>
          <span className="text-center">QUANTITY</span>
          <span className="text-right">PRICE</span>
        </div>

        <ul className="mt-4 border-t border-[#e6e6e6] sm:mt-0 sm:border-t-0">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="border-b border-[#ededed] py-4 sm:grid sm:grid-cols-[1fr_90px_90px] sm:items-start sm:py-5"
            >
              <div className="flex gap-3 sm:gap-4">
                <img
                  src={item.productImage || "/placeholder.png"}
                  alt={item.productName}
                  className="h-[92px] w-[68px] shrink-0 bg-[#f4f4f4] object-cover sm:h-[110px] sm:w-[80px]"
                />
                <div className="min-w-0 flex-1 pt-1">
                  <h3 className="text-[12px] font-medium text-[#1a1a1a] lg:text-[13px]">
                    {item.productName}
                  </h3>
                  <dl className="mt-1.5 space-y-1 text-[10px] lg:text-[11px]">
                    {item.sku && (
                      <div className="flex gap-1">
                        <dt className="text-[#a3a3a3]">Product SKU:</dt>
                        <dd className="truncate text-[#1a1a1a]">{item.sku}</dd>
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
                    <div className="flex gap-1 sm:hidden">
                      <dt className="text-[#a3a3a3]">Quantity:</dt>
                      <dd className="text-[#1a1a1a]">{item.quantity}</dd>
                    </div>
                  </dl>
                </div>

                {/* Sits on the last detail line, as in the mobile design */}
                <span className="self-end text-right text-[13px] text-[#1a1a1a] sm:hidden">
                  {formatBdt(item.total)}
                </span>
              </div>

              <span className="hidden pt-1 text-center text-[11px] text-[#1a1a1a] sm:block">
                {item.quantity}
              </span>
              <span className="hidden pt-1 text-right text-[12px] text-[#1a1a1a] sm:block lg:text-[14px]">
                {formatBdt(item.total)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 text-[11px]">
          <div className="flex items-center justify-between border-b border-[#ededed] py-3">
            <dt className="text-[#1a1a1a]">Subtotal</dt>
            <dd className="text-[#1a1a1a]">{formatBdt(order.subtotal)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between border-b border-[#ededed] py-3">
              <dt className="text-[#1a1a1a]">Discount</dt>
              <dd className="text-[#1f8a4c]">- {formatBdt(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-b border-[#ededed] py-3">
            <dt className="text-[#1a1a1a]">Shipping</dt>
            <dd className="text-[#1a1a1a]">{formatBdt(order.deliveryCharge)}</dd>
          </div>
          <div className="flex items-center justify-between py-3">
            <dt className="text-[12px] tracking-[0.06em] text-[#1a1a1a]">TOTAL</dt>
            <dd className="text-[16px] text-[#1a1a1a] lg:text-[18px]">
              {formatBdt(order.totalAmount)}
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex justify-center lg:mt-10">
          <button
            type="button"
            onClick={onGoHome}
            className="h-[34px] w-[130px] border border-[#d6d6d6] text-[10px] tracking-[0.1em] text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
          >
            BACK TO HOME
          </button>
        </div>
      </div>
    </section>
  );
}
