/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, SquarePen, Trash2 } from 'lucide-react'

import { computeVariantSku } from '@/lib/sku'

export interface Variant {
  id: string
  color: string
  size: string
  quantity: number
  /** Only set once the admin overrides this row's SKU by hand. */
  sku?: string
  /** True while this row's SKU is manually controlled. */
  skuManual?: boolean
}

interface VariantsSectionProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
  /** Main product SKU each variant SKU is derived from. */
  mainSku?: string
}

export const createVariant = (): Variant => ({
  id: Math.random().toString(36).substring(2, 11),
  color: '',
  size: 'M',
  quantity: 0,
})

/** A row the admin never filled in — not worth persisting. */
export const isEmptyVariant = (variant: Variant) =>
  !variant.color.trim() && !Number(variant.quantity)

/**
 * The SKU actually shown for a row — the hand-typed one when locked,
 * otherwise the value derived from the main SKU. This is what gets saved.
 */
export const resolveVariantSku = (variant: Variant, mainSku: string) =>
  variant.skuManual
    ? variant.sku ?? ''
    : computeVariantSku(mainSku, variant.color, variant.size)

/**
 * Rebuilds rows from a saved product. A stored SKU that doesn't match what
 * the main SKU would produce must have been typed by hand, so it stays
 * locked; derived ones stay on auto and follow future SKU changes.
 */
export const hydrateVariant = (
  saved: { id: string; color?: string | null; size?: string | null; quantity?: number | null; sku?: string | null },
  mainSku: string
): Variant => {
  const color = saved.color ?? ''
  const size = saved.size ?? 'M'
  const stored = saved.sku ?? ''
  const derived = computeVariantSku(mainSku, color, size)
  const manual = Boolean(stored) && stored !== derived

  return {
    id: saved.id,
    color,
    size,
    quantity: saved.quantity ?? 0,
    sku: manual ? stored : undefined,
    skuManual: manual,
  }
}

export function VariantsSection({ variants, onChange, mainSku = '' }: VariantsSectionProps) {
  const addVariant = () => onChange([...variants, createVariant()])

  const removeVariant = (id: string) => onChange(variants.filter((v) => v.id !== id))

  const patchVariant = (id: string, patch: Partial<Variant>) =>
    onChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)))

  const updateVariant = (id: string, field: keyof Variant, value: any) =>
    patchVariant(id, { [field]: value } as Partial<Variant>)

  /**
   * Unlocking snaps the row back to the auto-derived SKU; locking seeds the
   * field with whatever is currently shown so there's something to edit.
   */
  const toggleVariantManual = (variant: Variant) => {
    if (variant.skuManual) {
      patchVariant(variant.id, { skuManual: false, sku: undefined })
    } else {
      patchVariant(variant.id, {
        skuManual: true,
        sku: computeVariantSku(mainSku, variant.color, variant.size),
      })
    }
  }

  const skuFor = (variant: Variant) => resolveVariantSku(variant, mainSku)

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

  return (
    <Card>
      <div className="flex items-center justify-between mb-1 px-2">
        <h2 className="text-lg font-semibold">Product Variants</h2>
        <Button variant="outline" size="sm" onClick={addVariant}>
          Add Variant
        </Button>
      </div>
      <p className="text-sm text-slate-500 mb-4 px-2">
        Manage available options like color and size — each variant gets its own SKU,
        linked to the main SKU above.
      </p>

      {variants.length === 0 ? (
        <div className="px-2">
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            No variants added yet. Click &#34;Add Variant&#34; to start.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto px-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 w-1/5">
                  Color
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 w-1/6">
                  Size
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 w-1/6">
                  Quantity
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  SKU
                </th>
                <th className="pb-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant) => (
                <tr key={variant.id} className="group">
                  <td className="py-3 pr-4 align-top">
                    <Input
                      placeholder="e.g. Red, Blue"
                      value={variant.color}
                      onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                      className="min-w-[120px]"
                    />
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <Select
                      value={variant.size}
                      onValueChange={(value) => updateVariant(variant.id, 'size', value)}
                    >
                      <SelectTrigger className="min-w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <Input
                      type="number"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) =>
                        updateVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)
                      }
                      className="min-w-[80px]"
                    />
                  </td>
                  <td className="py-3 pr-2 align-top">
                    <input
                      value={skuFor(variant)}
                      readOnly={!variant.skuManual}
                      placeholder="Set main SKU first"
                      onChange={(e) => patchVariant(variant.id, { sku: e.target.value })}
                      className={`h-8 w-full min-w-[150px] rounded-lg border px-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 ${
                        variant.skuManual
                          ? 'border-indigo-300 bg-white text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    />
                  </td>
                  <td className="py-3 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={
                          variant.skuManual
                            ? 'Return to auto SKU'
                            : "Edit this variant's SKU manually"
                        }
                        title={
                          variant.skuManual
                            ? 'Return to auto SKU'
                            : "Edit this variant's SKU manually"
                        }
                        onClick={() => toggleVariantManual(variant)}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                          variant.skuManual
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                        }`}
                      >
                        {variant.skuManual ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : (
                          <SquarePen className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label="Remove variant"
                        title="Remove variant"
                        onClick={() => removeVariant(variant.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
