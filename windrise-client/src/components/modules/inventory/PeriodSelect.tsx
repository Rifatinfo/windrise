"use client";
import  { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { periodOptions } from './inventory.utils'


interface PeriodSelectProps {
  value: string
  onChange: (value: string) => void
  label: string
}

export function PeriodSelect({ value, onChange, label }: PeriodSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
      >
        {value}
        <ChevronDownIcon className="h-4 w-4 text-subtle" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 z-40 mt-2 w-[168px] origin-top rounded-2xl border border-line bg-white p-1.5 shadow-pop"
          >
            {periodOptions.map((option) => {
              const selected = option === value
              return (
                <li key={option} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option)
                      setOpen(false)
                    }}
                    className={[
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-150',
                      selected ? 'bg-brand/8 font-semibold text-brand' : 'text-slate-600 hover:bg-canvas',
                    ].join(' ')}
                  >
                    {option}
                    {selected && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
