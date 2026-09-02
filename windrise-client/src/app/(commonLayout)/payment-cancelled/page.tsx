import { Suspense } from "react";
import type { Metadata } from "next";

import { PaymentCancelled } from "@/components/modules/payment/PaymentCancelled";

export const metadata: Metadata = {
  title: "Payment Cancelled | Windrise",
  description: "Your payment was cancelled and no charges were made.",
};

const PaymentCancelledPage = () => (
  // Reads the gateway's redirect params, so it renders on the client.
  <Suspense fallback={<div className="min-h-screen bg-white" />}>
    <PaymentCancelled />
  </Suspense>
);

export default PaymentCancelledPage;
