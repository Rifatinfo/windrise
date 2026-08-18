import type { Coupon } from "@/types/stats";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export type CreateCouponPayload = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
};

export async function getAllCoupons(): Promise<Coupon[]> {
  const res = await fetch(`${API_URL}/api/v1/coupon`, { credentials: "include" });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export async function createCoupon(payload: CreateCouponPayload): Promise<Coupon> {
  const res = await fetch(`${API_URL}/api/v1/coupon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export async function updateCoupon(id: string, payload: Partial<CreateCouponPayload>): Promise<Coupon> {
  const res = await fetch(`${API_URL}/api/v1/coupon/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export async function deactivateCoupon(id: string): Promise<Coupon> {
  const res = await fetch(`${API_URL}/api/v1/coupon/${id}/deactivate`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export type ValidateCouponResult = {
  coupon: Coupon;
  discountAmount: number;
};

export async function validateCoupon(code: string, subtotal: number): Promise<ValidateCouponResult> {
  const res = await fetch(`${API_URL}/api/v1/coupon/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}
