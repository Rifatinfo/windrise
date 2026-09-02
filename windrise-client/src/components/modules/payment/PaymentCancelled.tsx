"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";

import { Breadcrumb } from "@/components/modules/addToCart/Breadcrumb";
import { initPayment } from "@/services/payment/payment";
import Image from "next/image";

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
  // A zero attempt is not a real figure — it means the gateway sent nothing
  // useful. Printing "৳ 0.00" would tell the customer their order was free;
  // a dash at least admits we do not know.
  const hasAmount = rawAmount !== "" && Number.isFinite(amount) && amount > 0;

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
        err instanceof Error
          ? err.message
          : "We couldn't reopen the payment page.",
      );
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full bg-white">
      {/* The site header is fixed (64px, 80px from lg), so the page clears it
          itself rather than starting underneath it. */}
      <div className=" w-full px-6 pb-4 pt-[76px] sm:px-10 lg:px-20 lg:pb-6 lg:pt-[96px]">
        <Breadcrumb current="Payment Cancelled" />
      </div>

      {/*
        Three tiers, and the whole block scales together so the proportions of
        the reference hold at every one: phone, laptop (lg), desktop (xl). The
        panel was previously fixed at phone-ish sizes, which left a small
        cluster marooned in the middle of a wide screen.
      */}
      <section className="w-full bg-[#fdf6f5] px-5 py-12 sm:px-10 lg:py-16 xl:py-20">
        <div className="mx-auto w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[540px]">
          <div className="flex justify-center">
            
             <Image
                src="/assets/payment-cancel-icon.png"
                alt="Close"
                width={65}
                height={65}
                className="h-[45px] w-[45px] object-contain lg:h-[65px] lg:w-[65px] xl:h-[65px] xl:w-[65px]"
              />
          </div>

          <h1 className="mt-4 text-center text-[20px] font-semibold text-[#1a1a1a] lg:mt-5 lg:text-[28px] xl:text-[32px]">
            Payment Cancelled!
          </h1>
          <p className="mx-auto mt-2 max-w-[320px] text-center text-[12.5px] leading-[19px] text-[#4a4a4a] lg:max-w-[440px] lg:text-[14px] lg:leading-[22px] xl:text-[15px] xl:leading-[24px]">
            No worries! Your Transaction was cancelled and no charges were made.
          </p>

          {/* What was attempted */}
          <dl className="mx-auto mt-7 w-full rounded-[6px] border border-[#e6ddda] bg-white/60 text-[12px] lg:mt-9 lg:text-[13px] xl:text-[14px]">
            <div className="flex items-center justify-between gap-4 border-b border-[#efe6e3] px-4 py-3 lg:px-5 lg:py-3.5">
              <dt className="text-[#8f8f8f]">Attempted Amount</dt>
              {/* Gateway amounts carry their paisa, unlike prices elsewhere */}
              <dd className="font-medium text-[#1a1a1a]">
                {hasAmount ? `৳ ${amount.toFixed(2)}` : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-5 lg:py-3.5">
              <dt className="shrink-0 text-[#8f8f8f]">Reason</dt>
              <dd className="text-right text-[#1a1a1a]">{reason}</dd>
            </div>
            {orderNo && (
              <div className="flex items-center justify-between gap-4 border-t border-[#efe6e3] px-4 py-3 lg:px-5 lg:py-3.5">
                <dt className="text-[#8f8f8f]">Order ID</dt>
                <dd className="font-medium text-[#1a1a1a]">{orderNo}</dd>
              </div>
            )}
          </dl>

          {error && (
            <p
              role="alert"
              className="mt-3 text-center text-[12px] text-[#c0342d] lg:text-[13px]"
            >
              {error}
            </p>
          )}

          {/*
            Both buttons share the row evenly rather than sitting at a fixed
            140px, so they stay proportionate as the panel grows. 44px is the
            smallest comfortable tap target; the old 34px was below it.
          */}
          <div className="mt-7 flex items-center justify-center gap-3 lg:mt-9 lg:gap-4">
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={retrying}
              className="inline-flex h-[44px] flex-1 items-center justify-center gap-2 bg-[#0b0b0b] text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:h-[46px] lg:text-[13px] xl:h-[48px] xl:text-[14px]"
            >
              {retrying ? (
                <>
                  <Loader2Icon className="h-[14px] w-[14px] animate-spin" />
                  Redirecting...
                </>
              ) : (
                "Try Again"
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex h-[44px] flex-1 items-center justify-center border border-[#d6d6d6] bg-white text-[12.5px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] lg:h-[46px] lg:text-[13px] xl:h-[48px] xl:text-[14px]"
            >
              Back to Home
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] leading-[17px] text-[#9a9a9a] lg:mt-6 lg:text-[12px]">
            Your order is still saved — nothing was charged to your card or
            wallet.
          </p>
        </div>
      </section>
    </div>
  );
}
