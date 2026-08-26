const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ExpenseCategory = {
  id: string;
  name: string;
  color: string;
  isSystem: boolean;
  investmentCount: number;
};

export type ProductOption = {
  id: string;
  name: string;
  sku: string;
};

export type Investment = {
  id: string;
  amount: number;
  description: string;
  spentAt: string;
  vendor: string | null;
  categoryId: string;
  category: { id: string; name: string; color: string };
  productId: string | null;
  product: { id: string; name: string; sku: string } | null;
  createdAt: string;
};

export type InvestmentPayload = {
  amount: number;
  description: string;
  spentAt: string;
  vendor: string | null;
  categoryId: string;
  productId: string | null;
};

export type FinanceOverview = {
  month: string;
  totalInvestment: number;
  revenue: number;
  actualOrderRevenue: number;
  revenueIsManual: boolean;
  grossProfit: number;
  /** null when there is no spend yet — the page shows a dash rather than 0%. */
  roi: number | null;
  profitMargin: number | null;
  byCategory: {
    id: string;
    name: string;
    color: string;
    amount: number;
    percent: number;
  }[];
  series: { month: string; label: string; revenue: number; investment: number }[];
};

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

export const getOverview = (month: string) =>
  request<FinanceOverview>(`/finance/overview?month=${encodeURIComponent(month)}`);

export const setRevenue = (month: string, amount: number) =>
  request<{ month: string; amount: number }>("/finance/revenue", {
    method: "PUT",
    ...json({ month, amount }),
  });

export const getCategories = () => request<ExpenseCategory[]>("/finance/categories");

export const createCategory = (name: string, color: string) =>
  request<ExpenseCategory>("/finance/categories", { method: "POST", ...json({ name, color }) });

export const deleteCategory = (id: string) =>
  request<{ id: string }>(`/finance/categories/${id}`, { method: "DELETE" });

export const getProductOptions = () => request<ProductOption[]>("/finance/products");

export const getInvestments = (params: {
  month?: string;
  categoryId?: string;
  searchTerm?: string;
}) => {
  const query = new URLSearchParams();
  if (params.month) query.set("month", params.month);
  if (params.categoryId && params.categoryId !== "ALL") query.set("categoryId", params.categoryId);
  if (params.searchTerm) query.set("searchTerm", params.searchTerm);
  return request<Investment[]>(`/finance/investments?${query.toString()}`);
};

export const createInvestment = (payload: InvestmentPayload) =>
  request<Investment>("/finance/investments", { method: "POST", ...json(payload) });

export const updateInvestment = (id: string, payload: Partial<InvestmentPayload>) =>
  request<Investment>(`/finance/investments/${id}`, { method: "PATCH", ...json(payload) });

export const deleteInvestment = (id: string) =>
  request<{ id: string }>(`/finance/investments/${id}`, { method: "DELETE" });
