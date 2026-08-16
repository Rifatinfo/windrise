"use client";
import  { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import type { OrderStatus } from '@/types/order'
import { DROPPED, PIPELINE, STATUS_META } from '@/utils/orderFlow'

interface StatusUpdateMenuProps {
  status: OrderStatus
  onChange: (status: OrderStatus) => void
  align?: 'left' | 'right'
}

export function StatusUpdateMenu({ status, onChange, align = 'left' }: StatusUpdateMenuProps) {
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

  const meta = STATUS_META[status]

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150 hover:brightness-95 ${meta.chip}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
        <ChevronDownIcon className="h-3 w-3 opacity-60" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Update order status"
          className={`absolute z-30 mt-1 w-52 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Move to stage
          </p>
          {PIPELINE.map((stage) => (
            <StatusOption
              key={stage}
              stage={stage}
              current={status}
              onSelect={() => {
                onChange(stage)
                setOpen(false)
              }}
            />
          ))}
          <p className="mt-1 border-t border-line px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Close out
          </p>
          {DROPPED.map((stage) => (
            <StatusOption
              key={stage}
              stage={stage}
              current={status}
              onSelect={() => {
                onChange(stage)
                setOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatusOption({
  stage,
  current,
  onSelect,
}: {
  stage: OrderStatus
  current: OrderStatus
  onSelect: () => void
}) {
  const isCurrent = stage === current
  return (
    <button
      type="button"
      role="option"
      aria-selected={isCurrent}
      onClick={onSelect}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition-colors duration-150 hover:bg-slate-50"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[stage].dot}`} />
      <span className="flex-1">{STATUS_META[stage].label}</span>
      {isCurrent && <CheckIcon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />}
    </button>
  )
}
