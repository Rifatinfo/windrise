// ================= Shared inventory types & helpers =================
// Shapes mirror the payload of GET /api/v1/inventory/overview

import type { Variants } from 'framer-motion'

export interface SizeStock {
  size: string
  units: number
  reorderPoint: number
}

export interface InventoryProduct {
  id: string
  name: string
  sku: string
  category: string
  subcategory: string
  emoji: string
  image: string | null
  price: number
  sizes: SizeStock[]
  totalUnits: number
  avgWeeklySales: number
  reorderQty: number
}

export interface Kpi {
  id: string
  label: string
  value: string
  delta: string
  icon: 'box' | 'alert' | 'x' | 'check'
  tone: 'good' | 'warn' | 'bad' | 'muted'
}

export interface AnalyticsCard {
  id: string
  icon: 'currency' | 'trend' | 'cycle' | 'clock'
  accent: 'violet' | 'blue' | 'teal' | 'red'
  label: string
  value: string
  suffix?: string
  detail: string
  trend: string
  trendTone: 'good' | 'bad'
  badge?: { tone: 'good' | 'teal' | 'bad'; text: string }
  footnote?: string
  ringPercent: number
  ringLabel: string
}

export interface CategoryStock {
  name: string
  units: number
  color: string
}

export interface HealthSlice {
  label: string
  percent: number
  color: string
}

export interface InventoryOverview {
  kpis: Kpi[]
  analyticsCards: AnalyticsCard[]
  stockByCategory: CategoryStock[]
  stockHealth: HealthSlice[]
  totalSkus: number
  products: InventoryProduct[]
}

export interface FilterGroup {
  id: 'category' | 'subcategory' | 'status' | 'value'
  label: string
  options: string[]
}

// ================= Constants =================

export const periodOptions = ['This Week', 'This Month', 'This Quarter', 'This Year']

export type StockLevelStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export const STATUS_META: Record<
  StockLevelStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  'in-stock': { label: 'In Stock', bg: 'bg-green-50', text: 'text-good', dot: 'bg-good' },
  'low-stock': { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-warn', dot: 'bg-warn' },
  'out-of-stock': { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-bad', dot: 'bg-bad' },
}

const VALUE_BANDS = ['Under ৳25k', '৳25k – ৳75k', 'Over ৳75k']

// ================= Helpers =================

export function totalUnits(product: InventoryProduct): number {
  if (product.sizes.length === 0) return product.totalUnits
  return product.sizes.reduce((sum, size) => sum + size.units, 0)
}

export function statusOf(product: InventoryProduct): StockLevelStatus {
  if (totalUnits(product) === 0) return 'out-of-stock'
  if (product.sizes.some((size) => size.units <= size.reorderPoint)) return 'low-stock'
  return 'in-stock'
}

export function sizeStatus(size: SizeStock): 'out' | 'low' | 'good' {
  if (size.units === 0) return 'out'
  if (size.units <= size.reorderPoint) return 'low'
  return 'good'
}

export function stockValue(product: InventoryProduct): number {
  return totalUnits(product) * product.price
}

export function formatTk(value: number): string {
  return `৳${Math.round(value).toLocaleString('en-US')}`
}

export function daysUntilStockout(product: InventoryProduct): number {
  const units = totalUnits(product)
  if (units === 0) return 0
  if (product.avgWeeklySales <= 0) return 999
  return Math.ceil((units / product.avgWeeklySales) * 7)
}

// Filter groups are built from the live product list so options always match the data
export function buildFilterGroups(products: InventoryProduct[]): FilterGroup[] {
  const categories = [...new Set(products.map((product) => product.category))].sort()
  const subcategories = [...new Set(products.map((product) => product.subcategory))].sort()
  return [
    { id: 'category', label: 'Category', options: categories },
    { id: 'subcategory', label: 'Subcategory', options: subcategories },
    { id: 'status', label: 'Status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
    { id: 'value', label: 'Stock Value', options: [...VALUE_BANDS] },
  ]
}

// ================= Date ranges (shared by the server page & the client dropdown) =================

export interface DateRangeSelection {
  label: string
  /** Inclusive boundaries as yyyy-mm-dd */
  start: string
  end: string
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildQuickRanges(today: Date): DateRangeSelection[] {
  const year = today.getFullYear()
  const month = today.getMonth()
  const end = toISODate(today)

  const thisMonthStart = new Date(year, month, 1)

  const lastMonthStart = new Date(year, month - 1, 1)
  const lastMonthEnd = new Date(year, month, 0)

  const last30Start = new Date(year, month, today.getDate() - 29)

  // Previous calendar quarter, e.g. in August → Q2 (Apr 1 – Jun 30)
  const currentQuarterStartMonth = Math.floor(month / 3) * 3
  const lastQuarterStart = new Date(year, currentQuarterStartMonth - 3, 1)
  const lastQuarterEnd = new Date(year, currentQuarterStartMonth, 0)
  const lastQuarterLabel = `Last Quarter (Q${Math.floor(lastQuarterStart.getMonth() / 3) + 1} ${lastQuarterStart.getFullYear()})`

  const yearStart = new Date(year, 0, 1)

  return [
    { label: 'This Month', start: toISODate(thisMonthStart), end },
    { label: 'Last Month', start: toISODate(lastMonthStart), end: toISODate(lastMonthEnd) },
    { label: 'Last 30 Days', start: toISODate(last30Start), end },
    { label: lastQuarterLabel, start: toISODate(lastQuarterStart), end: toISODate(lastQuarterEnd) },
    { label: 'Year to Date', start: toISODate(yearStart), end },
  ]
}

/** Default range shown when the dashboard first loads */
export function thisMonthRange(): DateRangeSelection {
  return buildQuickRanges(new Date())[0]
}

/**
 * Presets for the Analytics page — rolling windows suited to trend analysis,
 * rather than the calendar-month ranges used on Sales Overview / Inventory.
 */
export function buildAnalyticsRanges(today: Date): DateRangeSelection[] {
  const year = today.getFullYear()
  const month = today.getMonth()
  const day = today.getDate()
  const end = toISODate(today)

  const daysAgo = (count: number) => toISODate(new Date(year, month, day - (count - 1)))

  return [
    { label: 'Today', start: end, end },
    { label: 'Last 7 Days', start: daysAgo(7), end },
    { label: 'Last 30 Days', start: daysAgo(30), end },
    { label: 'Last 90 Days', start: daysAgo(90), end },
    { label: 'This Year', start: toISODate(new Date(year, 0, 1)), end },
  ]
}

/** Default range shown when Analytics first loads */
export function last30DaysRange(): DateRangeSelection {
  return buildAnalyticsRanges(new Date())[2]
}

// ================= Motion variants =================
// Parent sections use `cardCascade`; each card child uses `cardRise` (no initial/animate
// props of its own) so framer-motion orchestrates the stagger through variant inheritance.

export const cardCascade: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

export const cardRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
}

/** Below-the-fold sections: reveal once when scrolled into view */
export const sectionReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
}
