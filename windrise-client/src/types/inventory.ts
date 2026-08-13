export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export interface SizeStock {
  size: string
  units: number
  reorderPoint: number
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

export interface AnalyticsCard {
  id: string
  label: string
  value: string
  suffix?: string
  ringPercent: number
  ringLabel: string
  accent: 'violet' | 'blue' | 'teal' | 'red'
  icon: 'currency' | 'trend' | 'cycle' | 'clock'
  detail: string
  trend: string
  trendTone: 'good' | 'bad'
  badge?: { text: string; tone: 'good' | 'teal' | 'bad' }
  footnote?: string
}