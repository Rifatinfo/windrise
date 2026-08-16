import type { ServerUser } from "@/types/customer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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

export type GetCustomersParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

export async function getAllCustomers(
  params?: GetCustomersParams
): Promise<ApiListResponse<ServerUser[]>> {
  const query = new URLSearchParams({ role: "CUSTOMER" });
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    }
  }
  const qs = query.toString();
  const res = await fetch(`${API_URL}/api/v1/user${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  return res.json();
}
