"use client";
import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import type { ShipmentStatus } from '@/types/order'
import { SHIPMENT_META, SHIPMENT_ORDER } from '@/utils/orderFlow'

interface ShipmentStatusMenuProps {
  status: ShipmentStatus
  onChange: (status: ShipmentStatus) => void
  align?: 'left' | 'right'
}

export function ShipmentStatusMenu({
  status,
  onChange,
  align = 'left',
}: ShipmentStatusMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const meta = SHIPMENT_META[status]

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Update shipment status"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm font-semibold transition-colors duration-150 hover:bg-slate-50 ${meta.text}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
        {meta.label}
        <ChevronDownIcon className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Shipment status"
          className={`absolute z-30 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {SHIPMENT_ORDER.map((option) => {
            const optionMeta = SHIPMENT_META[option]
            const isCurrent = option === status
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={() => {
                  if (!isCurrent) onChange(option)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-semibold transition-colors duration-150 hover:bg-slate-50 ${optionMeta.text}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${optionMeta.dot}`} />
                <span className="flex-1">{optionMeta.label}</span>
                {isCurrent && (
                  <CheckIcon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
