/* eslint-disable @typescript-eslint/no-explicit-any */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type CartItemDTO = {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  sku?: string;
};

export type DeliveryInfoDTO = {
  name: string;
  phone: string;
  state: string;
  address: string;
};

export type BillingInfoDTO = {
  name: string;
  phone: string;
  email?: string | null;
  state: string;
  address: string;
};

export type CreateOrderPayload = {
  deliveryInfo: DeliveryInfoDTO;
  billingInfo?: BillingInfoDTO;
  deliveryType: string;
  cartItems: CartItemDTO[];
  paymentMethod: "ONLINE" | "COD";
  checkoutEmail?: string;
};

export type CreateOrderResponse = {
  success: boolean;
  message: string;
  data: {
    order: any;
    paymentUrl?: string;
    deliveryCharge?: number;
  };
};

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_URL}/api/v1/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "Failed to place order");
  }

  return res.json();
}

export async function getOrderById(orderId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "Failed to fetch order");
  }
  return res.json();
}
