"use client";
import React from 'react'
import { Modal } from './Modal'
import { ProductThumb } from './ProductThumb'
import {
  STATUS_META,
  daysUntilStockout,
  formatTk,
  sizeStatus,
  statusOf,
  stockValue,
  totalUnits,
  type InventoryProduct,
} from './inventory.utils'

interface ProductDetailModalProps {
  product: InventoryProduct
  onClose: () => void
  onAddStock: (product: InventoryProduct) => void
}

const sizePillTone = {
  out: 'bg-red-50 text-bad',
  low: 'bg-amber-50 text-warn',
  good: 'bg-green-50 text-good',
} as const

export function ProductDetailModal({ product, onClose, onAddStock }: ProductDetailModalProps) {
  const status = statusOf(product)
  const meta = STATUS_META[status]
  const units = totalUnits(product)
  const days = daysUntilStockout(product)

  const stats = [
    { label: 'Total Units', value: units.toLocaleString('en-US') },
    { label: 'Stock Value', value: formatTk(stockValue(product)) },
    { label: 'Weekly Sales', value: `${product.avgWeeklySales} / wk` },
    {
      label: 'Runs Out In',
      value: units === 0 ? 'Out now' : days >= 999 ? '90+ days' : `${days} days`,
    },
  ]

  return (
    <Modal open onClose={onClose} labelledBy="product-detail-title">
      <div className="flex items-center gap-3.5 px-7 pb-5 pt-7">
        <ProductThumb image={product.image} name={product.name} emoji={product.emoji} size="md" />
        <div className="min-w-0">
          <h2 id="product-detail-title" className="text-lg font-bold tracking-tight text-ink">
            {product.name}
          </h2>
          <p className="text-[13px] text-subtle">
            {product.sku} · {product.category} · {product.subcategory}
          </p>
        </div>
        <span
          className={`ml-auto mr-8 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label} className="rounded-2xl bg-canvas px-4 py-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{stat.label}</p>
              <p className="mt-1 text-lg font-bold tabular text-ink">{stat.value}</p>
            </li>
          ))}
        </ul>

        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
              <th scope="col" className="pb-3">Size</th>
              <th scope="col" className="pb-3">Current Stock</th>
              <th scope="col" className="pb-3">Reorder Point</th>
              <th scope="col" className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {product.sizes.map((size) => (
              <tr key={size.size} className="border-t border-line">
                <td className="py-2.5">
                  <span className="inline-flex min-w-[42px] justify-center rounded-xl bg-canvas px-2.5 py-1.5 text-sm font-semibold text-ink">
                    {size.size}
                  </span>
                </td>
                <td className="py-2.5 text-sm text-subtle">
                  <span className="font-bold tabular text-ink">{size.units}</span> units
                </td>
                <td className="py-2.5 text-sm tabular text-subtle">{size.reorderPoint} units</td>
                <td className="py-2.5 text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular ${sizePillTone[sizeStatus(size)]}`}>
                    {size.units} left
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 rounded-2xl bg-canvas px-4 py-3.5 text-[13px] leading-relaxed text-slate-500">
          Priced at {formatTk(product.price)} per unit. Suggested reorder is {product.reorderQty} units based on the
          current sales pace.
        </p>
      </div>

      <div className="flex justify-end gap-3 px-7 pb-7 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => onAddStock(product)}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
        >
          Add Stock
        </button>
      </div>
    </Modal>
  )
}
