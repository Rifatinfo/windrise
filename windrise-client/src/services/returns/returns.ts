import type { OrderReturn } from "@/types/stats";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export async function getAllReturns(status?: string): Promise<OrderReturn[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetch(`${API_URL}/api/v1/return${qs}`, { credentials: "include" });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export async function createReturn(payload: {
  orderId: string;
  reason: string;
  note?: string;
}): Promise<OrderReturn> {
  const res = await fetch(`${API_URL}/api/v1/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}

export async function updateReturn(
  id: string,
  payload: { status?: string; refundStatus?: string; refundAmount?: number },
): Promise<OrderReturn> {
  const res = await fetch(`${API_URL}/api/v1/return/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleError(res);
  const json = await res.json();
  return json.data;
}
