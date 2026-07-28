/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
export interface Variant {
  id: string
  color: string
  size: string
  quantity: number
}
interface VariantsSectionProps {
  variants: Variant[]
  onChange: (variants: Variant[]) => void
}
export function VariantsSection({ variants, onChange }: VariantsSectionProps) {
  const addVariant = () => {
    const newVariant: Variant = {
      id: Math.random().toString(36).substr(2, 9),
      color: '',
      size: 'M',
      quantity: 0,
    }
    onChange([...variants, newVariant])
  }
  const removeVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id))
  }
  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    onChange(
      variants.map((v) =>
        v.id === id
          ? {
            ...v,
            [field]: value,
          }
          : v,
      ),
    )
  }
  const sizeOptions = [
    {
      label: 'XS',
      value: 'XS',
    },
    {
      label: 'S',
      value: 'S',
    },
    {
      label: 'M',
      value: 'M',
    },
    {
      label: 'L',
      value: 'L',
    },
    {
      label: 'XL',
      value: 'XL',
    },
    {
      label: 'XXL',
      value: 'XXL',
    },
    {
      label: 'XXXL',
      value: 'XXXL',
    },
  ]
  return (
    <Card>
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-semibold">Product Variants</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addVariant}
        >
          Add Variant
        </Button>
      </div>
      <p className="text-sm text-slate-600 mb-4 px-8">Manage available options like color and size</p>
      {variants.length === 0 ? (
        <div className='px-2'>
          <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300 ">
            No variants added yet. Click &#34;Add Variant&#34; to start.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto px-2">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 font-medium text-slate-500 w-1/3">Color</th>
                <th className="pb-3 font-medium text-slate-500 w-1/4">Size</th>
                <th className="pb-3 font-medium text-slate-500 w-1/4">
                  Quantity
                </th>
                <th className="pb-3 font-medium text-slate-500 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant, idx) => (
                <tr key={idx} className="group">
                  <td className="py-3 pr-4 align-top">
                    <Input
                      placeholder="e.g. Red, Blue"
                      value={variant.color}
                      onChange={(e) =>
                        updateVariant(variant.id, 'color', e.target.value)
                      }
                      className="min-w-[120px]"
                    />
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <Select
                      value={variant.size}
                      onValueChange={(value) =>
                        updateVariant(variant.id, 'size', value)
                      }
                    >
                      <SelectTrigger className="min-w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                        updateVariant(
                          variant.id,
                          'quantity',
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="min-w-[80px]"
                    />
                  </td>
                  <td className="py-3 align-top text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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