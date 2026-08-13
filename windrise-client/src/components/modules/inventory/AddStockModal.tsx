"use client";
import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRightIcon, MinusIcon, PackageSearchIcon, PlusIcon } from 'lucide-react'

import { Modal } from './Modal'
import { ProductThumb } from './ProductThumb'
import { SearchableSelect, type SelectOption } from './SearchableSelect'
import { STATUS_META, statusOf, type InventoryProduct } from './inventory.utils'

interface AddStockModalProps {
  products: InventoryProduct[]
  /** Preselected product when opened from a table row; null opens the search picker */
  initialProductId: string | null
  onClose: () => void
  onSave: (productId: string, deltas: Record<string, number>) => void | Promise<void>
}

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] as const },
}

export function AddStockModal({ products, initialProductId, onClose, onSave }: AddStockModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialProductId)
  const [productQuery, setProductQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [categoryQuery, setCategoryQuery] = useState('')
  const [subFilter, setSubFilter] = useState<string | null>(null)
  const [subQuery, setSubQuery] = useState('')
  const [deltas, setDeltas] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const product = products.find((item) => item.id === selectedId) ?? null

  // ----- Suggestion lists -----
  // While a value is selected its label fills the input; in that state the list stays unfiltered
  const categoryOptions = useMemo<SelectOption[]>(() => {
    const counts = new Map<string, number>()
    for (const item of products) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)

    const query = categoryQuery.trim().toLowerCase()
    const active = categoryFilter?.toLowerCase()
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([name]) => !query || query === active || name.toLowerCase().includes(query))
      .map(([name, count]) => ({ id: name, label: name, hint: `${count} SKUs` }))
  }, [products, categoryQuery, categoryFilter])

  const subcategoryOptions = useMemo<SelectOption[]>(() => {
    const counts = new Map<string, number>()
    for (const item of products) {
      if (categoryFilter && item.category !== categoryFilter) continue
      counts.set(item.subcategory, (counts.get(item.subcategory) ?? 0) + 1)
    }

    const query = subQuery.trim().toLowerCase()
    const active = subFilter?.toLowerCase()
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([name]) => !query || query === active || name.toLowerCase().includes(query))
      .map(([name, count]) => ({ id: name, label: name, hint: `${count} SKUs` }))
  }, [products, categoryFilter, subQuery, subFilter])

  const productOptions = useMemo<SelectOption[]>(() => {
    const query = productQuery.trim().toLowerCase()
    return products
      .filter((item) => {
        if (categoryFilter && item.category !== categoryFilter) return false
        if (subFilter && item.subcategory !== subFilter) return false
        if (!query) return true
        return `${item.name} ${item.sku} ${item.category} ${item.subcategory}`.toLowerCase().includes(query)
      })
      .slice(0, 8)
      .map((item) => ({
        id: item.id,
        label: item.name,
        hint: `${item.sku} · ${item.category} · ${item.subcategory}`,
        image: item.image,
        emoji: item.emoji,
      }))
  }, [products, productQuery, categoryFilter, subFilter])

  // ----- Selection handlers -----
  function selectCategory(name: string) {
    setCategoryFilter(name)
    setCategoryQuery(name)
    // Drop the subcategory filter if it does not exist under the new category
    if (subFilter && !products.some((item) => item.category === name && item.subcategory === subFilter)) {
      setSubFilter(null)
      setSubQuery('')
    }
  }

  function selectSubcategory(name: string) {
    setSubFilter(name)
    setSubQuery(name)
  }

  function selectProduct(id: string) {
    setSelectedId(id)
    setDeltas({})
  }

  function changeProduct() {
    setSelectedId(null)
    setProductQuery('')
    setDeltas({})
  }

  // ----- Delta editor -----
  const current = useMemo(() => {
    const map: Record<string, number> = {}
    product?.sizes.forEach((size) => {
      map[size.size] = deltas[size.size] ?? 0
    })
    return map
  }, [product, deltas])

  const changed = Object.values(current).some((value) => value !== 0)

  function setDelta(size: string, next: number, stock: number) {
    setDeltas((prev) => ({ ...prev, [size]: Math.max(-stock, next) }))
  }

  async function handleSave() {
    if (!product) return
    setSaving(true)
    try {
      await onSave(product.id, current)
    } finally {
      setSaving(false)
    }
  }

  const statusMeta = product ? STATUS_META[statusOf(product)] : null

  return (
    <Modal open onClose={onClose} labelledBy="add-stock-title" width="max-w-[640px]">
      <div className="px-7 pb-5 pt-7">
        <h2 id="add-stock-title" className="text-lg font-bold tracking-tight text-ink">
          Add / Remove Stock
        </h2>
        <p className="mt-0.5 text-[13px] text-subtle">
          {product
            ? 'Adjust quantities per size, then save your changes.'
            : 'Search by product name or SKU — or narrow the list by category first.'}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-2">
        <AnimatePresence mode="wait" initial={false}>
          {product ? (
            <motion.div key="editor" {...panelMotion}>
              <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-canvas/60 px-4 py-3.5">
                <ProductThumb image={product.image} name={product.name} emoji={product.emoji} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink">{product.name}</p>
                  <p className="truncate text-[13px] text-subtle">
                    {product.sku} · {product.category} · {product.subcategory}
                  </p>
                </div>
                {statusMeta && (
                  <span
                    className={`ml-auto hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-flex ${statusMeta.bg} ${statusMeta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                )}
                <button
                  type="button"
                  onClick={changeProduct}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-canvas ${statusMeta ? '' : 'ml-auto'}`}
                >
                  <ArrowLeftRightIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  Change
                </button>
              </div>

              <table className="mt-5 w-full border-collapse text-left">
                <thead>
                  <tr className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                    <th scope="col" className="pb-3">Size</th>
                    <th scope="col" className="pb-3">Current Stock</th>
                    <th scope="col" className="pb-3 text-center">Add / Remove</th>
                    <th scope="col" className="pb-3 text-right">New Total</th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes.map((size) => {
                    const delta = current[size.size] ?? 0
                    return (
                      <tr key={size.size} className="border-t border-line">
                        <td className="py-2.5">
                          <span className="inline-flex min-w-[42px] justify-center rounded-xl bg-canvas px-2.5 py-1.5 text-sm font-semibold text-ink">
                            {size.size}
                          </span>
                        </td>
                        <td className="py-2.5 text-sm text-subtle">
                          <span className="font-bold tabular text-ink">{size.units}</span> units
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              aria-label={`Remove one ${size.size}`}
                              onClick={() => setDelta(size.size, delta - 1, size.units)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-slate-500 transition-colors duration-150 hover:bg-canvas"
                            >
                              <MinusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <input
                              type="number"
                              value={delta}
                              aria-label={`Change quantity for size ${size.size}`}
                              onChange={(event) => setDelta(size.size, Number(event.target.value) || 0, size.units)}
                              className="h-8 w-16 rounded-lg border border-line text-center text-sm font-semibold tabular text-ink outline-none focus:border-brand/50"
                            />
                            <button
                              type="button"
                              aria-label={`Add one ${size.size}`}
                              onClick={() => setDelta(size.size, delta + 1, size.units)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-slate-500 transition-colors duration-150 hover:bg-canvas"
                            >
                              <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-sm font-bold tabular text-ink">{size.units + delta}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <p className="mt-5 rounded-2xl bg-canvas px-4 py-3.5 text-[13px] leading-relaxed text-slate-500">
                Changes apply immediately to available stock once saved, and will be reflected across Orders and Sales
                Overview.
              </p>
            </motion.div>
          ) : (
            <motion.div key="picker" {...panelMotion} className="space-y-4">
              <SearchableSelect
                label="Product / SKU"
                placeholder="Type a product name or SKU…"
                query={productQuery}
                onQueryChange={setProductQuery}
                options={productOptions}
                onSelect={selectProduct}
                emptyText="No products match — try widening the category filters"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SearchableSelect
                  label="Category"
                  placeholder="All categories"
                  query={categoryQuery}
                  onQueryChange={(value) => {
                    setCategoryQuery(value)
                    if (!value.trim()) setCategoryFilter(null)
                  }}
                  options={categoryOptions}
                  onSelect={selectCategory}
                  emptyText="No categories match"
                />
                <SearchableSelect
                  label="Subcategory"
                  placeholder="All subcategories"
                  query={subQuery}
                  onQueryChange={(value) => {
                    setSubQuery(value)
                    if (!value.trim()) setSubFilter(null)
                  }}
                  options={subcategoryOptions}
                  onSelect={selectSubcategory}
                  emptyText="No subcategories match"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-line px-4 py-6 text-center">
                <PackageSearchIcon className="mx-auto h-6 w-6 text-subtle" aria-hidden="true" />
                <p className="mt-2 text-sm font-semibold text-ink">No product selected</p>
                <p className="mt-0.5 text-[13px] text-subtle">
                  Pick a product above to see its size breakdown and update stock.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-3 px-7 pb-7 pt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!product || !changed || saving}
          onClick={handleSave}
          className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Stock Changes'}
        </button>
      </div>
    </Modal>
  )
}
