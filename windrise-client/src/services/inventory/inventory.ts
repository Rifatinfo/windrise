import type { InventoryOverview } from "@/components/modules/inventory/inventory.utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface InventoryRangeParams {
  start?: string; // yyyy-mm-dd
  end?: string; // yyyy-mm-dd
}

const rangeQuery = (params?: InventoryRangeParams): string => {
  if (!params?.start || !params?.end) return "";
  return `?start=${encodeURIComponent(params.start)}&end=${encodeURIComponent(params.end)}`;
};

export async function getInventoryOverview(params?: InventoryRangeParams): Promise<{
  success: boolean;
  message: string;
  data: InventoryOverview | null;
}> {
  try {
    const res = await fetch(`${API_URL}/api/v1/inventory/overview${rangeQuery(params)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, message: "Failed to load inventory overview", data: null };
    }

    return res.json();
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error?.message || "Something went wrong",
      data: null,
    };
  }
}

export async function adjustProductStock(
  productId: string,
  deltas: Record<string, number>,
  params?: InventoryRangeParams,
): Promise<{
  success: boolean;
  message: string;
  data: InventoryOverview | null;
}> {
  try {
    const res = await fetch(`${API_URL}/api/v1/inventory/product/${productId}/stock${rangeQuery(params)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deltas }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: result?.message ?? "Failed to update stock",
        data: null,
      };
    }

    return result;
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error?.message || "Something went wrong",
      data: null,
    };
  }
}
