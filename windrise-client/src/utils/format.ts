import type { Order } from '@/types/order'

export function formatBdt(amount: number): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '৳ 0'
  return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatDate(input: string | Date): string {
  if (!input) return '-'
  const date = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function itemCount(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function orderTotal(order: Order): number {
  return order.totalAmount ?? order.total ?? 0
}

export function percent(part: number, whole: number): number {
  if (!whole || whole === 0) return 0
  return Math.round((part / whole) * 100)
}
