import type { CostLine, MarginMode, PlatformFeeMode } from "@/utils/pricing";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type PricingTemplate = {
  id: string;
  name: string;
  productName: string | null;
  currency: string;
  costs: CostLine[];
  platformFee: number;
  platformFeeMode: PlatformFeeMode;
  marginMode: MarginMode;
  targetMargin: number;
  taxPercent: number;
  roundTo: number;
  minSellingPrice: number | null;
  maxDiscountPercent: number;
  pricingStrategy: string;
  recommendedMargin: number;
  createdAt: string;
  updatedAt: string;
};

export type TemplatePayload = Omit<
  PricingTemplate,
  "id" | "createdAt" | "updatedAt"
>;

type ApiResponse<T> = { success: boolean; message: string; data: T };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}/api/v1${path}`, { credentials: "include", ...init });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

const json = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const getTemplates = () => request<PricingTemplate[]>("/pricing/templates");

export const saveTemplate = (payload: TemplatePayload) =>
  request<PricingTemplate>("/pricing/templates", { method: "POST", ...json(payload) });

export const updateTemplate = (id: string, payload: TemplatePayload) =>
  request<PricingTemplate>(`/pricing/templates/${id}`, { method: "PATCH", ...json(payload) });

export const deleteTemplate = (id: string) =>
  request<{ id: string }>(`/pricing/templates/${id}`, { method: "DELETE" });

/**
 * Asks the server for the PDF. The figures are recomputed there rather than
 * posted from here, so the report can be trusted on its own.
 */
export async function downloadPricingReport(payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/v1/pricing/report`, {
    method: "POST",
    credentials: "include",
    ...json(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Couldn't build the report");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pricing-${String(payload.productName ?? "report")
    .replace(/[^a-z0-9]+/gi, "-")
    .toLowerCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
