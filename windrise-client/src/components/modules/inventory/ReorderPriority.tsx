"use client";

import { motion } from 'framer-motion'

import { ProductThumb } from './ProductThumb'
import { daysUntilStockout, totalUnits, type InventoryProduct } from './inventory.utils'

interface ReorderPriorityProps {
  products: InventoryProduct[]
  onCreatePurchaseOrder: (product: InventoryProduct) => void
}

function urgency(days: number): { label: string; className: string } {
  if (days <= 0) return { label: 'Out now', className: 'bg-red-50 text-bad' }
  if (days <= 7) return { label: `${days} days`, className: 'bg-red-50 text-bad' }
  if (days <= 21) return { label: `${days} days`, className: 'bg-amber-50 text-warn' }
  return { label: `${days} days`, className: 'bg-canvas text-slate-500' }
}

export function ReorderPriority({ products, onCreatePurchaseOrder }: ReorderPriorityProps) {
  const rows = [...products]
    .sort((a, b) => daysUntilStockout(a) - daysUntilStockout(b))
    .slice(0, 5)

  const needPoThisWeek = products.filter(
    (product) => totalUnits(product) === 0 || daysUntilStockout(product) <= 7,
  ).length

  return (
    <section
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-card"
      aria-labelledby="reorder-priority"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-4 pt-5">
        <div>
          <h2 id="reorder-priority" className="text-[17px] font-bold tracking-tight text-ink">
            Reorder Priority
          </h2>
          <p className="mt-0.5 text-[13px] text-subtle">Ranked by how soon each SKU runs out at current sales pace</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-warn">
          {needPoThisWeek} SKUs need a PO this week
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-canvas/70 text-[11px] font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Current Stock</th>
              <th scope="col" className="px-5 py-3">Sales Velocity</th>
              <th scope="col" className="px-5 py-3">Runs Out In</th>
              <th scope="col" className="px-5 py-3">Suggested Order</th>
              <th scope="col" className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product, index) => {
              const days = daysUntilStockout(product)
              const tag = urgency(totalUnits(product) === 0 ? 0 : days)
              return (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <ProductThumb image={product.image} name={product.name} emoji={product.emoji} />
                      <div>
                        <p className="text-sm font-semibold text-ink">{product.name}</p>
                        <p className="text-xs text-subtle">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm tabular text-slate-600">{totalUnits(product)} units</td>
                  <td className="px-5 py-3.5 text-sm tabular text-slate-600">{product.avgWeeklySales} / wk</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tag.className}`}>{tag.label}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold tabular text-ink">{product.reorderQty} units</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onCreatePurchaseOrder(product)}
                      className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-warn transition-colors duration-150 hover:bg-amber-100"
                    >
                      Create PO
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
