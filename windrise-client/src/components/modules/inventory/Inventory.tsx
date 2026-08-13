"use client";
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DownloadIcon, PlusIcon } from 'lucide-react'

import { KpiStrip } from './KpiStrip'
import { AnalyticsGrid } from './AnalyticsGrid'
import { StockByCategory } from './StockByCategory'
import { StockHealth } from './StockHealth'
import { ReorderPriority } from './ReorderPriority'
import { ProductStockTable } from './ProductStockTable'
import { ProductDetailModal } from './ProductDetailModal'
import { AddStockModal } from './AddStockModal'
import { DateRangeMenu } from './DateRangeMenu'
import { adjustProductStock, getInventoryOverview } from '@/services/inventory/inventory'
import {
  STATUS_META,
  cardCascade,
  sectionReveal,
  statusOf,
  stockValue,
  thisMonthRange,
  totalUnits,
  type DateRangeSelection,
  type InventoryOverview,
} from './inventory.utils'

const Inventory = ({ initialData }: { initialData: InventoryOverview }) => {
  const [data, setData] = useState<InventoryOverview>(initialData)
  const [range, setRange] = useState<DateRangeSelection>(() => thisMonthRange())
  const [refreshing, setRefreshing] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [stockEditor, setStockEditor] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  })
  const [toast, setToast] = useState<string | null>(null)
  // Bumped whenever a fresh overview lands — re-mounts the card sections so they re-cascade
  const [dataVersion, setDataVersion] = useState(0)

  const items = data.products
  const detailProduct = items.find((item) => item.id === detailId) ?? null

  function openStockEditor(productId: string | null) {
    setDetailId(null)
    setStockEditor({ open: true, productId })
  }

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2600)
  }

  async function applyRange(selection: DateRangeSelection) {
    setRange(selection)
    setRefreshing(true)
    const result = await getInventoryOverview({ start: selection.start, end: selection.end })
    setRefreshing(false)

    if (result.success && result.data) {
      setData(result.data)
    } else {
      notify(result.message || 'Failed to load data for this range')
    }
  }

  async function saveStock(productId: string, deltas: Record<string, number>) {
    const total = Object.values(deltas).reduce((sum, value) => sum + value, 0)
    const result = await adjustProductStock(productId, deltas, { start: range.start, end: range.end })

    if (result.success && result.data) {
      // The API returns the full fresh overview so KPIs and charts stay in sync
      setData(result.data)
      setStockEditor({ open: false, productId: null })
      notify(`Stock updated — ${total > 0 ? `+${total}` : total} units`)
    } else {
      notify(result.message || 'Failed to update stock')
    }
  }

  function exportCsv() {
    const header = ['Product', 'SKU', 'Category', 'Subcategory', 'Units', 'Value (BDT)', 'Status', 'Weekly Sales']
    const lines = items.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.subcategory,
      totalUnits(product),
      Math.round(stockValue(product)),
      STATUS_META[statusOf(product)].label,
      product.avgWeeklySales,
    ])
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `inventory-${range.start}-to-${range.end}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Inventory exported — CSV downloaded')
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="text-[13px] text-subtle">
            <span>Dashboards</span> / <span className="font-semibold text-slate-600">Inventory</span>
          </nav>
          <h1 className="mt-1 text-[26px] font-bold tracking-tight text-ink">Inventory Management</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeMenu value={range.label} onChange={applyRange} />
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
          >
            <DownloadIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            onClick={() => openStockEditor(null)}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
          >
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Add Stock
          </button>
        </div>
      </div>

      <div
        aria-busy={refreshing}
        className={`mt-5 space-y-6 transition-opacity duration-200 ${refreshing ? 'pointer-events-none opacity-60' : ''}`}
      >
         <KpiStrip kpis={data.kpis} />

         <AnalyticsGrid cards={data.analyticsCards} />

        <div  className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr]">
          <StockByCategory data={data.stockByCategory} />
          <StockHealth data={data.stockHealth} totalSkus={data.totalSkus} />
        </div>

        <div >
          <ReorderPriority
            products={items}
            onCreatePurchaseOrder={(product) => notify(`Purchase order drafted for ${product.name}`)}
          />
        </div>

        <div >
          <ProductStockTable
            products={items}
            onView={(product) => setDetailId(product.id)}
            onAddStock={(product) => openStockEditor(product.id)}
          />
        </div>
      </div>

      <AnimatePresence>
        {detailProduct && (
          <ProductDetailModal
            product={detailProduct}
            onClose={() => setDetailId(null)}
            onAddStock={(product) => openStockEditor(product.id)}
          />
        )}
        {stockEditor.open && (
          <AddStockModal
            products={items}
            initialProductId={stockEditor.productId}
            onClose={() => setStockEditor({ open: false, productId: null })}
            onSave={saveStock}
          />
        )}
      </AnimatePresence>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-pop"
        >
          {toast}
        </div>
      )}
    </div>
  )
}

export default Inventory;
