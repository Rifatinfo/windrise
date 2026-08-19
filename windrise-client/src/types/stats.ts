// Shapes mirror windrise-server's `stats`, `coupon`, `returns` and `marketing` module responses.

export interface Metric {
  value: number;
  previous: number;
  change: number;
}

export interface SalesSummary {
  revenue: Metric;
  orders: Metric;
  customers: Metric;
  aov: Metric;
  productsSold: Metric;
  conversionRate: Metric;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

/** Multi-series time buckets powering the stacked area chart. */
export interface CategoryRevenueSeries {
  categories: string[];
  points: Array<Record<string, string | number>>;
}

export interface OrderStatusOverview {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  failed: number;
  expired: number;
  returned: number;
}

export interface RecentOrderRow {
  id: string;
  orderNo: string;
  customerName: string;
  product: string;
  additionalItems: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

export interface TopProductRow {
  productId: string;
  name: string;
  image: string | null;
  unitsSold: number;
  revenue: number;
  currentStock: number;
  status: string;
}

export interface CategoryBreakdownRow {
  name: string;
  revenue: number;
  unitsSold: number;
  orders: number;
  percentage: number;
}

export interface PaymentMethodRow {
  method: string;
  transactions: number;
  revenue: number;
  percentage: number;
}

export interface LocationRow {
  location: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface CustomersOverview {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  newCustomerGrowth: number;
  returningCustomerGrowth: number;
}

export interface NewVsReturning {
  newCustomers: number;
  returningCustomers: number;
  newPercentage: number;
  returningPercentage: number;
}

export interface ReturnsOverview {
  totalReturnedOrders: number;
  returnRate: number;
  refundRate: number;
  pendingRefunds: number;
  completedRefunds: number;
  refundedAmount: number;
}

export interface ReturnReasonRow {
  reason: string;
  count: number;
  percentage: number;
}

export interface InventoryKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  icon: string;
  tone: string;
}

export interface LowStockAlertRow {
  id: string;
  name: string;
  image: string | null;
  currentStock: number;
  threshold: number;
  status: string;
}

export interface InventorySummary {
  kpis: InventoryKpi[];
  stockByCategory: { name: string; units: number; color: string }[];
  stockHealth: { label: string; percent: number; color: string }[];
  lowStockAlerts: LowStockAlertRow[];
}

export interface CouponPerformanceRow {
  id: string;
  code: string;
  isActive: boolean;
  usedCount: number;
  periodRedemptions: number;
  totalDiscountGiven: number;
  revenueGenerated: number;
}

export interface CouponsPerformance {
  totalCoupons: number;
  activeCoupons: number;
  usedCoupons: number;
  totalDiscountGiven: number;
  revenueGenerated: number;
  mostUsedCoupon: CouponPerformanceRow | null;
  bestPerformingCoupon: CouponPerformanceRow | null;
  coupons: CouponPerformanceRow[];
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count?: { orders: number };
}

export interface DiscountsPerformance {
  activeDiscounts: number;
  totalDiscount: number;
  avgDiscountPerOrder: number;
  discountedOrders: number;
  revenueAfterDiscount: number;
  discountPercentage: number;
  totalOrders: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
  conversionFromPrevious: number;
  conversionFromStart: number;
}

export interface ProductPerformanceRow {
  productId: string;
  name: string;
  views: number;
  addToCart: number;
  orders: number;
  unitsSold: number;
  revenue: number;
  conversionRate: number;
  returnRate: number;
}

export interface SalesTarget {
  month: string;
  targetAmount: number;
  currentRevenue: number;
  remainingRevenue: number;
  completionPercentage: number;
}

export interface DailySnapshot {
  date: string;
  revenue: number;
  orders: number;
  productsSold: number;
  newCustomers: number;
  returningCustomers: number;
  refunds: number;
  discounts: number;
}

export interface BestCustomerRow {
  userId: string;
  name: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string | null;
}

export interface CustomerLifetimeValue {
  averageCLV: number;
  highestCLV: number;
  totalCustomerRevenue: number;
  repeatPurchaseRate: number;
}

export interface AlertRow {
  type: string;
  message: string;
  createdAt: string;
}

export interface BusinessPerformance {
  revenue: Metric;
  orders: Metric;
  customers: Metric;
  productsSold: Metric;
  aov: Metric;
  conversionRate: Metric;
  returnRate: number;
  refundRate: number;
  growthRate: number;
  profit: null;
}

export type NotConnected = { connected: false };
export type ConnectedWithError = { connected: true; error: string };

export interface TrafficOverview {
  connected: true;
  totalVisitors: number;
  uniqueVisitors: number;
  newUsers: number;
  returningUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
}

export interface TrafficSources {
  connected: true;
  sources: { source: string; sessions: number; percentage: number }[];
}

export interface MetaAdsPerformance {
  connected: true;
  spend: number;
  impressions: number;
  clicks: number;
  addToCart: number;
  initiateCheckout: number;
  purchases: number;
  revenue: number;
  costPerPurchase: number;
  roas: number;
}

export interface GoogleAdsPerformance {
  connected: true;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  costPerConversion: number;
  roas: number;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  reason: string;
  note: string | null;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED";
  refundAmount: number | null;
  refundStatus: "PENDING" | "COMPLETED";
  createdAt: string;
  order: { orderNo: string; name: string; totalAmount: number };
}
