import type {
  AfterSalesStatus,
  GatewayInfo,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentState,
  ServerOrder,
  ServerPayment,
  ShipmentStatus,
} from "@/types/order";
import {
  afterSalesForStatus,
  buildGatewayLabel,
  normalizeGatewayLabelString,
  shipmentForStatus,
} from "@/utils/orderFlow";

/** Prisma ShipmentStatus -> UI value. */
const SHIPMENT_MAP: Record<string, ShipmentStatus> = {
  ORDER_CONFIRMED: "ready_for_dispatch",
  PACKAGE_SHIPPED: "shipped",
  ARRIVED_AT_LOCAL_SORT_FACILITY: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELED: "canceled",
};

/** Prisma AfterSalesStatus -> UI value. */
const AFTER_SALES_MAP: Record<string, AfterSalesStatus> = {
  NONE: "none",
  COMPLETED: "completed",
  RETURN: "return",
  EXCHANGE: "exchange",
};

function toUiShipment(value?: string | null): ShipmentStatus | null {
  if (!value) return null;
  return SHIPMENT_MAP[value.trim().toUpperCase()] ?? null;
}

function toUiAfterSales(value?: string | null): AfterSalesStatus | null {
  if (!value) return null;
  return AFTER_SALES_MAP[value.trim().toUpperCase()] ?? null;
}

const STATUS_MAP: Record<string, OrderStatus> = {
  PLACED: "placed",
  CONFIRMED: "confirmed",
  PROCESSED: "processed",
  ON_THE_WAY: "on_the_way",
  DELIVERED: "delivered",
  CANCELED: "canceled",
  FAILED: "failed",
  EXPIRED: "expired",
};

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  COD: "cod",
  ONLINE: "online",
};

function toUiStatus(status: string): OrderStatus {
  const normalized = status?.trim().toUpperCase();
  return (normalized && STATUS_MAP[normalized]) || "placed";
}

function toUiPaymentMethod(method: string): PaymentMethod {
  return PAYMENT_METHOD_MAP[method] ?? "cod";
}

function toUiPaymentState(
  paymentStatus: string,
  method: PaymentMethod
): PaymentState {
  switch (paymentStatus) {
    case "PAID":
      return "paid";
    case "FAILED":
      return "failed";
    case "CANCELED":
      return "canceled";
    case "UNPAID":
    default:
      return method === "cod" ? "due" : "due";
  }
}

function toStringValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str || null;
}

function toGatewayInfo(payment?: ServerPayment | null): GatewayInfo | null {
  if (!payment) return null;
  const gatewayData = (payment.paymentGatewayData ?? {}) as Record<
    string,
    unknown
  >;
  const cardType =
    payment.cardType?.trim() || toStringValue(gatewayData.card_type);
  const cardIssuer =
    payment.cardIssuer?.trim() || toStringValue(gatewayData.card_issuer);
  const cardBrand = toStringValue(gatewayData.card_brand);
  const cardNo = toStringValue(gatewayData.card_no);

  if (!cardType && !cardIssuer && !cardBrand && !cardNo) return null;
  return { cardType, cardIssuer, cardBrand, cardNo };
}

function extractGatewayLabel(payment?: ServerPayment | null): string | null {
  if (!payment) return null;

  const stored = payment.paymentMethod?.trim();
  const gatewayInfo = toGatewayInfo(payment);

  // Use the stored human-readable label, normalized to a clean form
  if (stored && stored !== "SSLCommerz" && stored !== "COD") {
    const normalized = normalizeGatewayLabelString(stored);
    if (normalized) return normalized;
  }

  // Fallback to card/wallet details from gateway data
  if (gatewayInfo) {
    const fromData = buildGatewayLabel(gatewayInfo);
    if (fromData) return fromData;
  }

  return null;
}

export function mapServerOrderToUi(
  order: ServerOrder,
  index?: number
): Order {
  const status = toUiStatus(order.orderStatus);
  const method = toUiPaymentMethod(order.paymentMethod);
  const paymentStatus = order.payment?.paymentStatus ?? order.paymentStatus;
  const paymentState = toUiPaymentState(paymentStatus, method);
  const gatewayInfo = toGatewayInfo(order.payment)
  const gatewayLabel = extractGatewayLabel(order.payment)

  const items =
    order.items?.map((item) => ({
      id: item.id,
      name: item.productName,
      sku: item.sku ?? null,
      size: item.size ?? null,
      color: item.color ?? null,
      quantity: item.quantity,
      total: item.total,
      price: item.price,
      image: item.productImage ?? null,
    })) ?? [];

  const firstImage = items[0]?.image ?? "/placeholder.png";

  const deliveryCharge =
    typeof order.deliveryCharge === "string"
      ? Number(order.deliveryCharge)
      : order.deliveryCharge ?? 0;

  return {
    id: order.id,
    orderId: order.id,
    orderNo: order.orderNo ?? order.id.slice(-6).toUpperCase(),
    serial: typeof index === "number" ? index + 1 : 1,
    customer: {
      name: order.name,
      phone: order.phone,
      email: order.checkoutEmail ?? null,
      state: order.state ?? null,
      address: order.address ?? null,
    },
    billing:
      order.billingName || order.billingPhone
        ? {
            name: order.billingName ?? order.name,
            phone: order.billingPhone ?? order.phone,
            email: order.billingEmail ?? null,
            state: order.billingState ?? null,
            address: order.billingAddress ?? null,
          }
        : null,
    items,
    image: firstImage,
    placedAt: order.createdAt,
    status,
    payment: {
      method,
      state: paymentState,
      reference: order.payment?.transactionId ?? order.orderNo,
      transactionId: order.payment?.transactionId ?? null,
      gatewayStatus: order.payment?.gatewayStatus ?? order.payment?.paymentStatus ?? order.paymentStatus,
      paidAt: order.payment?.paidAt ?? null,
      gatewayLabel,
      gateway: gatewayInfo,
      cardType: order.payment?.cardType ?? null,
      cardIssuer: order.payment?.cardIssuer ?? null,
      bankTranId: order.payment?.bankTranId ?? null,
      riskLevel: order.payment?.riskLevel ?? null,
      riskTitle: order.payment?.riskTitle ?? null,
    },
    // A stored override wins; otherwise both columns follow the order status.
    shipment: toUiShipment(order.shipmentStatus) ?? shipmentForStatus(status),
    afterSales: toUiAfterSales(order.afterSalesStatus) ?? afterSalesForStatus(status),
    subtotal: order.subtotal,
    deliveryCharge,
    total: order.totalAmount,
    totalAmount: order.totalAmount,
    orderNote: order.orderNote ?? null,
    invoiceUrl: order.invoiceUrl ?? null,
    deliveryType: order.deliveryType ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt ?? null,
  };
}

export function mapServerOrdersToUi(orders: ServerOrder[]): Order[] {
  return orders.map((order, index) => mapServerOrderToUi(order, index));
}
