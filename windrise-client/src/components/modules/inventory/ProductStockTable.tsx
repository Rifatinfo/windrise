import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'

import { FiltersPopover, emptyFilters, type FilterState } from './FiltersPopover'
import { ProductThumb } from './ProductThumb'
import {
  STATUS_META,
  buildFilterGroups,
  formatTk,
  sizeStatus,
  statusOf,
  stockValue,
  totalUnits,
  type InventoryProduct,
  type StockLevelStatus,
} from './inventory.utils'

const TABS: { id: 'all' | StockLevelStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'low-stock', label: 'Low Stock' },
  { id: 'out-of-stock', label: 'Out of Stock' },
]

const LOAD_STEP = 5

const sizePillTone = {
  out: 'bg-red-50 text-bad',
  low: 'bg-amber-50 text-warn',
  good: 'bg-green-50 text-good',
} as const

interface ProductStockTableProps {
  products: InventoryProduct[]
  onView: (product: InventoryProduct) => void
  onAddStock: (product: InventoryProduct) => void
}

function matchesValueBand(value: number, bands: string[]): boolean {
  if (bands.length === 0) return true
  return bands.some((band) => {
    if (band.startsWith('Under')) return value < 25000
    if (band.startsWith('Over')) return value > 75000
    return value >= 25000 && value <= 75000
  })
}

export function ProductStockTable({ products, onView, onAddStock }: ProductStockTableProps) {
  const [tab, setTab] = useState<'all' | StockLevelStatus>('all')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [visibleCount, setVisibleCount] = useState(LOAD_STEP)

  const filterGroups = useMemo(() => buildFilterGroups(products), [products])

  const rows = useMemo(() => {
    return products.filter((product) => {
      const status = statusOf(product)
      if (tab !== 'all' && status !== tab) return false
      if (query.trim()) {
        const needle = query.trim().toLowerCase()
        const haystack = `${product.name} ${product.sku} ${product.category} ${product.subcategory}`.toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (filters.category.length && !filters.category.includes(product.category)) return false
      if (filters.subcategory.length && !filters.subcategory.includes(product.subcategory)) return false
      if (filters.status.length && !filters.status.includes(STATUS_META[status].label)) return false
      if (!matchesValueBand(stockValue(product), filters.value)) return false
      return true
    })
  }, [products, tab, query, filters])

  const visible = rows.slice(0, visibleCount)
  const remaining = rows.length - visible.length

  function resetVisible<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setVisibleCount(LOAD_STEP)
    }
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      aria-labelledby="product-stock-levels"
    >
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <h2 id="product-stock-levels" className="text-[17px] font-bold tracking-tight text-ink">
          Product Stock Levels
        </h2>

        <div className="flex rounded-xl bg-canvas p-1" role="tablist" aria-label="Filter by stock status">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => resetVisible(setTab)(item.id)}
              className={[
                'rounded-lg px-3.5 py-1.5 text-sm transition-colors duration-150',
                tab === item.id ? 'bg-white font-semibold text-ink shadow-card' : 'font-medium text-slate-500 hover:text-ink',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div className="flex w-[220px] items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 focus-within:border-brand/40">
            <SearchIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => resetVisible(setQuery)(event.target.value)}
              placeholder="Search product"
              aria-label="Search product"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
            />
          </div>
          <FiltersPopover filters={filters} onApply={resetVisible(setFilters)} groups={filterGroups} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-canvas/70 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Category</th>
              <th scope="col" className="px-5 py-3">Subcategory</th>
              <th scope="col" className="px-5 py-3">Size Breakdown</th>
              <th scope="col" className="px-5 py-3">Stock &amp; Value</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product, index) => {
              const status = statusOf(product)
              const meta = STATUS_META[status]
              const units = totalUnits(product)
              const fill = Math.min(100, Math.round((units / 250) * 100))
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb image={product.image} name={product.name} emoji={product.emoji} />
                      <div>
                        <p className="text-sm font-semibold text-ink">{product.name}</p>
                        <p className="text-xs text-subtle">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{product.category}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{product.subcategory}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((size) => (
                        <span
                          key={size.size}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular ${sizePillTone[sizeStatus(size)]}`}
                        >
                          {size.size} {size.units}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold tabular text-ink">{units} units</p>
                    <p className="text-xs tabular text-subtle">{formatTk(stockValue(product))} value</p>
                    <span className="mt-1.5 block h-1.5 w-[72px] overflow-hidden rounded-full bg-line">
                      <span
                        className={`block h-full rounded-full ${
                          status === 'in-stock' ? 'bg-good' : status === 'low-stock' ? 'bg-warn' : 'bg-bad'
                        }`}
                        style={{ width: `${fill}%` }}
                      />
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onView(product)}
                        className="rounded-xl border border-line px-3.5 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddStock(product)}
                        className="rounded-xl bg-brand/10 px-3.5 py-2 text-xs font-semibold text-brand transition-colors duration-150 hover:bg-brand/20"
                      >
                        Add Stock
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}

            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center">
                  <p className="text-sm font-semibold text-ink">No products match these filters</p>
                  <p className="mt-1 text-sm text-subtle">Clear the search or reset your filters to see all SKUs.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p className="text-[13px] tabular text-subtle">
          Showing {visible.length} of {rows.length.toLocaleString('en-US')} SKUs
        </p>
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + LOAD_STEP)}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
          >
            <ChevronDownIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
            Load More
            <span className="text-xs font-medium tabular text-subtle">{remaining} remaining</span>
          </button>
        )}
      </div>
    </section>
  )
}
