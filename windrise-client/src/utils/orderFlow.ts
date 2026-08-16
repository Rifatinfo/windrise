import type {
  GatewayInfo,
  OrderEvent,
  OrderStatus,
  PaymentMethod,
  PaymentState,
  ShipmentStatus,
} from '@/types/order'

export const PIPELINE: OrderStatus[] = [
  'placed',
  'confirmed',
  'processed',
  'on_the_way',
  'delivered',
]

export const DROPPED: OrderStatus[] = ['canceled', 'failed', 'expired']

interface StatusMeta {
  label: string
  timeline: string
  hint: string
  dot: string
  bar: string
  chip: string
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  placed: {
    label: 'Placed',
    timeline: 'Order placed',
    hint: 'Waiting to be reviewed',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-700',
  },
  confirmed: {
    label: 'Confirmed',
    timeline: 'Order confirmed',
    hint: 'Ready to be packed',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700',
  },
  processed: {
    label: 'Processed',
    timeline: 'Packed & labelled',
    hint: 'Waiting for pickup',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700',
  },
  on_the_way: {
    label: 'On the Way',
    timeline: 'Handed to courier',
    hint: 'Out with the courier',
    dot: 'bg-teal-500',
    bar: 'bg-teal-500',
    chip: 'bg-teal-50 text-teal-700',
  },
  delivered: {
    label: 'Delivered',
    timeline: 'Delivered to customer',
    hint: 'Completed this month',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
  },
  canceled: {
    label: 'Canceled',
    timeline: 'Order canceled',
    hint: 'Canceled by shop or customer',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700',
  },
  failed: {
    label: 'Failed',
    timeline: 'Payment failed',
    hint: 'Payment could not be taken',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700',
  },
  expired: {
    label: 'Expired',
    timeline: 'Order expired',
    hint: 'No response in time',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-600',
  },
}

export const SHIPMENT_META: Record<ShipmentStatus, { label: string; dot: string; chip: string }> = {
  not_shipped: { label: 'Not Shipped', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700' },
  package_shipped: {
    label: 'Package Shipped',
    dot: 'bg-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700',
  },
  at_sort_facility: {
    label: 'At Local Sort Facility',
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    dot: 'bg-teal-500',
    chip: 'bg-teal-50 text-teal-700',
  },
  delivered: { label: 'Delivered', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  canceled: { label: 'Canceled', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700' },
}

export interface GatewayColorMeta {
  /** Brand hex color, e.g. "#e2136e" for bKash */
  color: string
  chip: string
  bar: string
}

const ONLINE_COLOR: GatewayColorMeta = {
  color: '#1f3a8a',
  chip: 'bg-blue-50 text-blue-700',
  bar: 'bg-blue-500',
}

const BANK_COLOR: GatewayColorMeta = {
  color: '#0f766e',
  chip: 'bg-teal-50 text-teal-700',
  bar: 'bg-teal-500',
}

export const GATEWAY_COLORS: Record<string, GatewayColorMeta> = {
  bKash: { color: '#e2136e', chip: 'bg-pink-50 text-pink-700', bar: 'bg-pink-500' },
  Nagad: { color: '#ee7623', chip: 'bg-orange-50 text-orange-700', bar: 'bg-orange-500' },
  Rocket: { color: '#8c3494', chip: 'bg-purple-50 text-purple-700', bar: 'bg-purple-500' },
  Upay: { color: '#c026d3', chip: 'bg-fuchsia-50 text-fuchsia-700', bar: 'bg-fuchsia-500' },
  Mcash: { color: '#4d7c0f', chip: 'bg-lime-50 text-lime-700', bar: 'bg-lime-500' },
  uCash: { color: '#a16207', chip: 'bg-yellow-50 text-yellow-700', bar: 'bg-yellow-500' },
  'OK Wallet': { color: '#0e7490', chip: 'bg-cyan-50 text-cyan-700', bar: 'bg-cyan-500' },
  Tap: { color: '#334155', chip: 'bg-slate-50 text-slate-700', bar: 'bg-slate-500' },
  Visa: { color: '#1f3a8a', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  Mastercard: { color: '#1f3a8a', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  Amex: { color: '#1f3a8a', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  Discover: { color: '#1f3a8a', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  JCB: { color: '#1f3a8a', chip: 'bg-blue-50 text-blue-700', bar: 'bg-blue-500' },
  Bank: BANK_COLOR,
  'Internet Banking': BANK_COLOR,
}

/** Resolve the channel color for a display label like "bKash" or "Visa....6652". */
export function getGatewayColorMeta(channel?: string | null): GatewayColorMeta {
  if (!channel) return ONLINE_COLOR
  const base = channel.split('....')[0].trim()
  return GATEWAY_COLORS[base] ?? BANK_COLOR
}

/** Base channel name of a display label, e.g. "Visa....6652" -> "Visa". */
export function gatewayChannelName(gatewayLabel?: string | null): string | null {
  if (!gatewayLabel) return null
  const base = gatewayLabel.split('....')[0].trim()
  return base || null
}

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; short: string; chip: string; bar: string; color: string; kind: string }
> = {
  cod: {
    label: 'Cash on Delivery',
    short: 'COD',
    chip: 'bg-slate-100 text-slate-700',
    bar: 'bg-slate-500',
    color: '#64748b',
    kind: 'Collect on delivery',
  },
  online: {
    label: 'SSLCommerz Online',
    short: 'Online',
    chip: 'bg-blue-50 text-blue-700',
    bar: 'bg-blue-500',
    color: '#2563eb',
    kind: 'Gateway',
  },
}

/**
 * Build a display label for an online payment that reveals the actual
 * gateway / wallet / card used (e.g. bKash, Nagad, Visa).
 */
export function getPaymentMethodDisplay(
  method: PaymentMethod,
  gateway?: GatewayInfo | string | null
): { label: string; short: string; chip: string; color: string } {
  const meta = PAYMENT_METHOD_META[method]

  if (method === 'online') {
    const label =
      gateway && typeof gateway === 'object'
        ? buildGatewayLabel(gateway)
        : normalizeGatewayLabelString(gateway as string | null)

    if (label) {
      const color = getGatewayColorMeta(label)
      return { label, short: label, chip: color.chip, color: color.color }
    }
  }

  return { label: meta.label, short: meta.short, chip: meta.chip, color: meta.color }
}

const WALLET_LABELS: Record<string, string> = {
  BKASH: 'bKash',
  NAGAD: 'Nagad',
  ROCKET: 'Rocket',
  DBBL: 'Rocket',
  UPAY: 'Upay',
  MCASH: 'Mcash',
  UCASH: 'uCash',
  OK: 'OK Wallet',
  TAP: 'Tap',
}

const CARD_BRAND_LABELS: Record<string, string> = {
  VISA: 'Visa',
  MASTER: 'Mastercard',
  MASTERCARD: 'Mastercard',
  AMEX: 'Amex',
  AMERICANEXPRESS: 'Amex',
  AMERICAN_EXPRESS: 'Amex',
  DISCOVER: 'Discover',
  JCB: 'JCB',
}

type GatewayMatch = { kind: 'wallet' | 'card'; name: string }

function detectGateway(value?: string | null): GatewayMatch | null {
  if (!value) return null
  const upper = value.trim().toUpperCase()
  const code = upper.split('-')[0].trim()

  const wallet = WALLET_LABELS[code]
  if (wallet) return { kind: 'wallet', name: wallet }

  const brand = CARD_BRAND_LABELS[code]
  if (brand) return { kind: 'card', name: brand }

  for (const [key, name] of Object.entries(WALLET_LABELS)) {
    if (upper.includes(key) || upper.includes(name.toUpperCase())) {
      return { kind: 'wallet', name }
    }
  }

  return null
}

function lastFour(cardNo?: string | null): string | null {
  if (!cardNo) return null
  const digits = cardNo.replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : null
}

/**
 * Build a clean display label from raw SSLCommerz gateway data.
 * Wallets -> "bKash", "Nagad", "Rocket". Cards -> "Visa....6652".
 */
export function buildGatewayLabel(info: GatewayInfo): string | null {
  const match =
    detectGateway(info.cardType) ??
    detectGateway(info.cardBrand) ??
    detectGateway(info.cardIssuer)
  if (!match) return null

  if (match.kind === 'wallet') return match.name

  const last4 = lastFour(info.cardNo)
  return last4 ? `${match.name}....${last4}` : match.name
}

/**
 * Normalize a previously-stored label string
 * (e.g. "SSLCommerz - BKASH-BKash" -> "bKash", "Visa....6652" stays).
 */
export function normalizeGatewayLabelString(raw?: string | null): string | null {
  if (!raw) return null
  const value = raw.replace(/^SSLCommerz\s*[-–—:]*\s*/i, '').trim()
  if (!value) return null
  if (/^(online|gateway|sslcommerz)$/i.test(value)) return null
  return buildGatewayLabel({ cardType: value }) ?? value
}

export const PAYMENT_STATE_META: Record<
  PaymentState,
  { label: string; dot: string; text: string; chip: string }
> = {
  paid: {
    label: 'Paid',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-700',
  },
  due: {
    label: 'COD Due',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-rose-500',
    text: 'text-rose-600',
    chip: 'bg-rose-50 text-rose-700',
  },
  canceled: {
    label: 'Canceled',
    dot: 'bg-rose-500',
    text: 'text-rose-600',
    chip: 'bg-rose-50 text-rose-700',
  },
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = PIPELINE.indexOf(status)
  if (index === -1 || index === PIPELINE.length - 1) return null
  return PIPELINE[index + 1]
}

export function isDropped(status: OrderStatus): boolean {
  return DROPPED.includes(status)
}

export function shipmentForStatus(status: OrderStatus): ShipmentStatus {
  switch (status) {
    case 'placed':
      return 'not_shipped'
    case 'confirmed':
      return 'package_shipped'
    case 'processed':
      return 'at_sort_facility'
    case 'on_the_way':
      return 'out_for_delivery'
    case 'delivered':
      return 'delivered'
    default:
      return 'canceled'
  }
}

const DROP_NOTE: Partial<Record<OrderStatus, string>> = {
  canceled: 'Canceled after the payment attempt failed',
  failed: 'Gateway declined the transaction',
  expired: 'Customer never responded to confirmation',
}

export function buildTimeline(status: OrderStatus, placedAt: string): OrderEvent[] {
  const start = new Date(placedAt).getTime()
  const step = 1000 * 60 * 60 * 7

  if (isDropped(status)) {
    return [
      { label: STATUS_META.placed.timeline, at: new Date(start).toISOString() },
      {
        label: STATUS_META[status].timeline,
        at: new Date(start + step).toISOString(),
        note: DROP_NOTE[status],
      },
    ]
  }

  const index = PIPELINE.indexOf(status)
  return PIPELINE.slice(0, index + 1).map((stage, i) => ({
    label: STATUS_META[stage].timeline,
    at: new Date(start + i * step).toISOString(),
  }))
}
