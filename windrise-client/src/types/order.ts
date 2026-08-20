export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processed'
  | 'on_the_way'
  | 'delivered'
  | 'canceled'
  | 'failed'
  | 'expired'

export type PaymentMethod = 'cod' | 'online'

export type PaymentState = 'paid' | 'due' | 'failed' | 'canceled'

export type ShipmentStatus =
  | 'ready_for_dispatch'
  | 'shipped'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'canceled'

/** After-sales handling shown beside the shipment column. */
export type AfterSalesStatus = 'none' | 'completed' | 'return' | 'exchange'

export type OrderEvent = {
  label: string
  at: string
  note?: string
}

/** Raw SSLCommerz gateway fields describing how an online payment was paid. */
export type GatewayInfo = {
  cardType?: string | null
  cardIssuer?: string | null
  cardBrand?: string | null
  cardNo?: string | null
}

export type OrderItemUI = {
  id: string
  name: string
  sku?: string | null
  size?: string | null
  color?: string | null
  quantity: number
  total: number
  image?: string | null
  price: number
}

export type OrderCustomer = {
  name: string
  phone: string
  email?: string | null
  state?: string | null
  address?: string | null
}

export type OrderPayment = {
  method: PaymentMethod
  state: PaymentState
  reference: string
  transactionId?: string | null
  gatewayStatus?: string | null
  paidAt?: string | null
  /** Actual gateway/wallet/card used, e.g. "bKash", "Nagad", "Visa....6652" */
  gatewayLabel?: string | null
  /** Raw gateway fields, used to render the payment method chip */
  gateway?: GatewayInfo | null
  cardType?: string | null
  cardIssuer?: string | null
  bankTranId?: string | null
  riskLevel?: string | null
  riskTitle?: string | null
}

export type Order = {
  id: string
  orderId: string
  orderNo: string
  serial: number
  customer: OrderCustomer
  billing?: OrderCustomer | null
  items: OrderItemUI[]
  image: string
  placedAt: string
  status: OrderStatus
  payment: OrderPayment
  shipment: ShipmentStatus
  afterSales: AfterSalesStatus
  subtotal: number
  deliveryCharge: number
  total: number
  totalAmount: number
  orderNote?: string | null
  invoiceUrl?: string | null
  deliveryType?: string | null
  createdAt: string
  updatedAt?: string | null
}

// Server order response shape (from GET /api/v1/order)
export type ServerOrderItem = {
  id: string
  productId: string
  productName: string
  price: number
  quantity: number
  total: number
  color?: string | null
  size?: string | null
  sku?: string | null
  productImage?: string | null
  variantId?: string | null
}

export type ServerPayment = {
  id: string
  orderId: string
  orderNo: string
  transactionId: string
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'CANCELED'
  paymentMethod?: string | null
  gatewayStatus?: string | null
  bankTranId?: string | null
  cardType?: string | null
  cardIssuer?: string | null
  riskLevel?: string | null
  riskTitle?: string | null
  validationId?: string | null
  storeAmount?: number | string | null
  currencyAmount?: number | string | null
  paymentGatewayData?: Record<string, unknown> | null
  amount?: number | string
  paidAt?: string | null
  cancelledAt?: string | null
  failedAt?: string | null
  invoiceUrl?: string | null
}

export type ServerOrder = {
  id: string
  orderNo: string
  name: string
  phone: string
  state?: string | null
  address?: string | null
  orderNote?: string | null
  checkoutEmail?: string | null
  billingName?: string | null
  billingPhone?: string | null
  billingEmail?: string | null
  billingState?: string | null
  billingAddress?: string | null
  subtotal: number
  totalAmount: number
  deliveryCharge?: number | string | null
  deliveryType?: string | null
  orderStatus: string
  /** Admin override; null means it follows `orderStatus`. */
  shipmentStatus?: string | null
  /** Admin override; null means it follows `orderStatus`. */
  afterSalesStatus?: string | null
  paymentStatus: 'UNPAID' | 'PAID' | 'FAILED' | 'CANCELED'
  paymentMethod: 'COD' | 'ONLINE'
  invoiceUrl?: string | null
  createdAt: string
  updatedAt: string
  items: ServerOrderItem[]
  payment?: ServerPayment | null
  user?: { id: string; email?: string | null; name?: string | null } | null
}

// ─── Public order tracking (POST /order/track) ──────────────────────────────
// Deliberately narrower than ServerOrder: the endpoint is unauthenticated, so
// it returns only what the tracking page renders — no address, email, billing
// or payment records.

export type TrackedOrderItem = {
  id: string
  productName: string
  sku: string | null
  size: string | null
  color: string | null
  quantity: number
  price: number
  total: number
  productImage: string | null
}

/** A recorded status transition, oldest first. */
export type TrackedOrderEvent = {
  /** Prisma OrderStatus, e.g. "PLACED" | "PROCESSED" | "DELIVERED" */
  status: string
  at: string
}

export type TrackedOrder = {
  orderNo: string
  placedAt: string
  updatedAt: string
  orderStatus: string
  shipmentStatus: string | null
  afterSalesStatus: string | null
  history: TrackedOrderEvent[]
  /** Real delivery date once delivered, otherwise null. */
  deliveredAt: string | null
  estimatedDeliveryAt: string
  subtotal: number
  deliveryCharge: number
  discountAmount: number
  totalAmount: number
  items: TrackedOrderItem[]
}
