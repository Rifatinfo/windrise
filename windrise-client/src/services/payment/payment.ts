const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type InitPaymentResponse = {
  success: boolean;
  message: string;
  data: { paymentUrl?: string };
};

/**
 * Re-open the SSLCommerz gateway for an order whose payment was cancelled or
 * failed. The order keeps its original transaction ID, so this resumes the
 * same attempt rather than creating a second order.
 */
export async function initPayment(orderId: string): Promise<InitPaymentResponse> {
  const res = await fetch(`${API_URL}/api/v1/payment/init-payment/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}
