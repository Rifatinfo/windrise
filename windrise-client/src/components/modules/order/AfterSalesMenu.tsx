"use client";
import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, RotateCcwIcon } from 'lucide-react'

import type { AfterSalesStatus, OrderStatus } from '@/types/order'
import { AFTER_SALES_META, AFTER_SALES_ORDER, afterSalesForStatus } from '@/utils/orderFlow'

interface AfterSalesMenuProps {
  status: AfterSalesStatus
  /** Used to show what "automatic" would resolve to. */
  orderStatus: OrderStatus
  onChange: (status: AfterSalesStatus) => void
  align?: 'left' | 'right'
}

export function AfterSalesMenu({
  status,
  orderStatus,
  onChange,
  align = 'left',
}: AfterSalesMenuProps) {
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

  const meta = AFTER_SALES_META[status]
  // What the column falls back to when no return/exchange is recorded.
  const automatic = afterSalesForStatus(orderStatus)
  const isOverridden = status !== automatic

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Update after-sales status"
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
          aria-label="After-sales status"
          className={`absolute z-30 mt-1 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {AFTER_SALES_ORDER.map((option) => {
            const optionMeta = AFTER_SALES_META[option]
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

          {/* Without this a mis-click on Return could never be undone. */}
          {isOverridden && (
            <button
              type="button"
              onClick={() => {
                onChange(automatic)
                setOpen(false)
              }}
              className="mt-1 flex w-full items-center gap-2.5 border-t border-line px-3 py-2 text-left text-xs font-medium text-ink-soft transition-colors duration-150 hover:bg-slate-50"
            >
              <RotateCcwIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Reset to {AFTER_SALES_META[automatic].label === '—' ? 'none' : AFTER_SALES_META[automatic].label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
