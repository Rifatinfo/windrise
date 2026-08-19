import type {
  AlertRow,
  BestCustomerRow,
  BusinessPerformance,
  CategoryBreakdownRow,
  CategoryRevenueSeries,
  CouponsPerformance,
  CustomerLifetimeValue,
  CustomersOverview,
  DailySnapshot,
  DiscountsPerformance,
  FunnelStage,
  InventorySummary,
  LocationRow,
  NewVsReturning,
  OrderStatusOverview,
  PaymentMethodRow,
  ProductPerformanceRow,
  RecentOrderRow,
  ReturnReasonRow,
  ReturnsOverview,
  RevenuePoint,
  SalesSummary,
  SalesTarget,
  TopProductRow,
} from "@/types/stats";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type DateRangeParams = {
  startDate?: string;
  endDate?: string;
};

async function handleError(res: Response): Promise<never> {
  const error = await res.json().catch(() => ({}));
  throw new Error(error.message ?? `Request failed with status ${res.status}`);
}

async function get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const query = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    }
  }
  const qs = query.toString();
  const res = await fetch(`${API_URL}/api/v1/stats${path}${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export const getSalesSummary = (params: DateRangeParams) => get<SalesSummary>("/summary", params);

export const getRevenueChart = (params: DateRangeParams & { granularity?: "day" | "week" | "month" }) =>
  get<RevenuePoint[]>("/revenue-chart", params);

export const getCategoryRevenueSeries = (
  params: DateRangeParams & { granularity?: "day" | "week" | "month" }
) => get<CategoryRevenueSeries>("/category-revenue-series", params);

export const getOrderStatusOverview = (params: DateRangeParams) =>
  get<OrderStatusOverview>("/order-status", params);

export const getRecentOrders = (limit = 10) => get<RecentOrderRow[]>("/recent-orders", { limit });

export const getTopProducts = (params: DateRangeParams & { limit?: number }) =>
  get<TopProductRow[]>("/top-products", params);

export const getSalesByCategory = (params: DateRangeParams) =>
  get<CategoryBreakdownRow[]>("/sales-by-category", params);

export const getSalesBySubcategory = (params: DateRangeParams) =>
  get<CategoryBreakdownRow[]>("/sales-by-subcategory", params);

export const getSalesByPaymentMethod = (params: DateRangeParams) =>
  get<PaymentMethodRow[]>("/sales-by-payment-method", params);

export const getSalesByLocation = (params: DateRangeParams) =>
  get<LocationRow[]>("/sales-by-location", params);

export const getCustomersOverview = (params: DateRangeParams) =>
  get<CustomersOverview>("/customers-overview", params);

export const getNewVsReturning = (params: DateRangeParams) =>
  get<NewVsReturning>("/new-vs-returning", params);

export const getReturnsOverview = (params: DateRangeParams) =>
  get<ReturnsOverview>("/returns-overview", params);

export const getReturnReasons = (params: DateRangeParams) =>
  get<ReturnReasonRow[]>("/return-reasons", params);

export const getInventorySummary = () => get<InventorySummary>("/inventory-summary");

export const getCouponsPerformance = (params: DateRangeParams) =>
  get<CouponsPerformance>("/coupons-performance", params);

export const getDiscountsPerformance = (params: DateRangeParams) =>
  get<DiscountsPerformance>("/discounts-performance", params);

export const getSalesFunnel = (params: DateRangeParams) => get<FunnelStage[]>("/sales-funnel", params);

export const getProductPerformance = (params: DateRangeParams & { limit?: number }) =>
  get<ProductPerformanceRow[]>("/product-performance", params);

export const getSalesTarget = () => get<SalesTarget>("/sales-target");

export async function updateSalesTarget(targetAmount: number): Promise<SalesTarget> {
  const res = await fetch(`${API_URL}/api/v1/stats/sales-target`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ targetAmount }),
  });
  if (!res.ok) await handleError(res);
  const json: ApiResponse<SalesTarget> = await res.json();
  return json.data;
}

export const getDailySnapshot = () => get<DailySnapshot>("/daily-snapshot");

export const getBestCustomers = (limit = 10) => get<BestCustomerRow[]>("/best-customers", { limit });

export const getCustomerLifetimeValue = () => get<CustomerLifetimeValue>("/customer-lifetime-value");

export const getAlerts = () => get<AlertRow[]>("/alerts");

export const getBusinessPerformance = (params: DateRangeParams) =>
  get<BusinessPerformance>("/business-performance", params);

export type ExportType = "sales" | "orders" | "customers" | "products" | "payments" | "refunds";
export type ExportFormat = "csv" | "xlsx" | "pdf";

export async function exportReport(
  type: ExportType,
  format: ExportFormat,
  params: DateRangeParams,
): Promise<void> {
  const query = new URLSearchParams({ type, format });
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const res = await fetch(`${API_URL}/api/v1/stats/export?${query.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) await handleError(res);

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filenameMatch = disposition.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? `${type}-report.${format}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
