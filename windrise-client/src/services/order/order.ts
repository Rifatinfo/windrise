/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ServerOrder } from "@/types/order";

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

export type ApiListResponse<T> = {
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_URL}/api/v1/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) await handleError(res);
  return res.json();
}

export async function getOrderById(orderId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function getOrderByTransactionId(transactionId: string): Promise<any> {
  const res = await fetch(`${API_URL}/api/v1/order/transaction/${transactionId}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function getAllOrders(): Promise<ApiListResponse<ServerOrder[]>> {
  const res = await fetch(`${API_URL}/api/v1/order`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function getMyOrders(): Promise<ApiListResponse<ServerOrder[]>> {
  const res = await fetch(`${API_URL}/api/v1/order/my-orders`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ApiListResponse<ServerOrder>> {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export async function markOrderCollected(
  orderId: string
): Promise<ApiListResponse<ServerOrder>> {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}/payment-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ paymentStatus: "PAID" }),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}

export type UpdateOrderInfoPayload = {
  name?: string;
  phone?: string;
  state?: string;
  address?: string;
  orderNote?: string | null;
  billingName?: string | null;
  billingPhone?: string | null;
  billingEmail?: string | null;
  billingState?: string | null;
  billingAddress?: string | null;
};

export async function updateOrderInfo(
  orderId: string,
  payload: UpdateOrderInfoPayload
): Promise<ApiListResponse<ServerOrder>> {
  const res = await fetch(`${API_URL}/api/v1/order/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleError(res);
  return res.json();
}
