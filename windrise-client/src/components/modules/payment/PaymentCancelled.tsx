"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";

import { Breadcrumb } from "@/components/modules/addToCart/Breadcrumb";
import { initPayment } from "@/services/payment/payment";

/** Gateway messages that say nothing useful to a customer. */
const GENERIC_MESSAGES = new Set([
  "",
  "payment cancelled",
  "payment canceled",
  "cancel",
  "cancelled",
  "canceled",
]);

export function PaymentCancelled() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") ?? "";
  const orderNo = searchParams.get("orderNo") ?? "";
  const rawAmount = searchParams.get("amount") ?? "";
  const message = searchParams.get("message") ?? "";

  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const amount = Number(rawAmount);
  const hasAmount = rawAmount !== "" && Number.isFinite(amount);

  const reason = GENERIC_MESSAGES.has(message.trim().toLowerCase())
    ? "User cancelled transaction"
    : message;

  const handleTryAgain = async () => {
    if (!orderId) {
      // Nothing to resume — send them back to the bag to start over.
      router.push("/shoppingBag");
      return;
    }

    setRetrying(true);
    setError("");
    try {
      const res = await initPayment(orderId);
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
        return;
      }
      setError("We couldn't reopen the payment page. Please try again.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't reopen the payment page."
      );
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full bg-white">
      {/* The site header is fixed (64px, 80px from lg), so the page clears it
          itself rather than starting underneath it. */}
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-4 pt-[76px] sm:px-10 lg:px-14 lg:pb-6 lg:pt-[96px]">
        <Breadcrumb current="Payment Cancelled" />
      </div>

      <section className="w-full bg-[#fdf6f5] px-5 py-10 sm:px-10 lg:py-16">
        <div className="mx-auto w-full max-w-[890px]">
          <div className="flex justify-center">
            <span className="flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-[#e5484d] lg:h-[46px] lg:w-[46px]">
              <XIcon className="h-[22px] w-[22px] text-white lg:h-[26px] lg:w-[26px]" strokeWidth={3} />
            </span>
          </div>

          <h1 className="mt-4 text-center text-[17px] font-semibold text-[#1a1a1a] lg:text-[26px]">
            Payment Cancelled!
          </h1>
          <p className="mx-auto mt-1.5 max-w-[380px] text-center text-[11px] leading-[17px] text-[#4a4a4a] lg:mt-2 lg:max-w-[460px] lg:text-[14px] lg:leading-[21px]">
            No worries! Your Transaction was cancelled and no charges were made.
          </p>

          {/* What was attempted */}
          <dl className="mx-auto mt-7 w-full max-w-[360px] rounded-[6px] border border-[#e6ddda] bg-white/60 text-[11px] lg:mt-9 lg:text-[12px]">
            <div className="flex items-center justify-between gap-4 border-b border-[#efe6e3] px-3.5 py-2.5">
              <dt className="text-[#8f8f8f]">Attempted Amount</dt>
              {/* Gateway amounts carry their paisa, unlike prices elsewhere */}
              <dd className="font-medium text-[#1a1a1a]">
                {hasAmount ? `৳ ${amount.toFixed(2)}` : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
              <dt className="shrink-0 text-[#8f8f8f]">Reason</dt>
              <dd className="text-right text-[#1a1a1a]">{reason}</dd>
            </div>
            {orderNo && (
              <div className="flex items-center justify-between gap-4 border-t border-[#efe6e3] px-3.5 py-2.5">
                <dt className="text-[#8f8f8f]">Order ID</dt>
                <dd className="font-medium text-[#1a1a1a]">{orderNo}</dd>
              </div>
            )}
          </dl>

          {error && (
            <p role="alert" className="mt-3 text-center text-[11px] text-[#c0342d] lg:text-[12px]">
              {error}
            </p>
          )}

          <div className="mt-7 flex items-center justify-center gap-3 lg:mt-9 lg:gap-4">
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={retrying}
              className="inline-flex h-[34px] w-full max-w-[140px] items-center justify-center gap-2 bg-[#0b0b0b] text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:h-[40px] lg:max-w-[170px] lg:text-[12px]"
            >
              {retrying ? (
                <>
                  <Loader2Icon className="h-[13px] w-[13px] animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Try Again"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-[34px] w-full max-w-[140px] items-center justify-center border border-[#d6d6d6] bg-white text-[11px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] lg:h-[40px] lg:max-w-[170px] lg:text-[12px]"
            >
              Back to Home
            </button>
          </div>

          <p className="mt-5 text-center text-[10px] text-[#9a9a9a] lg:text-[11px]">
            Your order is still saved — nothing was charged to your card or wallet.
          </p>
        </div>
      </section>
    </div>
  );
}
