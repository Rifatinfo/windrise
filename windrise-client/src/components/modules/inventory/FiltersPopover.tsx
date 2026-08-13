"use client";
import  { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FilterIcon } from 'lucide-react'
import type { FilterGroup } from './inventory.utils'


export interface FilterState {
  category: string[]
  subcategory: string[]
  status: string[]
  value: string[]
}

export const emptyFilters: FilterState = { category: [], subcategory: [], status: [], value: [] }

interface FiltersPopoverProps {
  filters: FilterState
  onApply: (filters: FilterState) => void
  groups: FilterGroup[]
}

export function FiltersPopover({ filters, onApply, groups }: FiltersPopoverProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<FilterState>(filters)
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

  const activeCount = Object.values(filters).reduce((sum, group) => sum + group.length, 0)

  function toggle(groupId: keyof FilterState, option: string) {
    setDraft((prev) => {
      const group = prev[groupId]
      return {
        ...prev,
        [groupId]: group.includes(option) ? group.filter((item) => item !== option) : [...group, option],
      }
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          // Start each session from the currently applied filters
          if (!open) setDraft(filters)
          setOpen(!open)
        }}
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
      >
        <FilterIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white tabular">{activeCount}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 z-40 mt-2 w-[320px] origin-top-right rounded-2xl border border-line bg-white p-4 shadow-pop"
          >
            {groups.map((group) => (
              <fieldset key={group.id} className="mb-4 last:mb-0">
                <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const selected = draft[group.id as keyof FilterState].includes(option)
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggle(group.id as keyof FilterState, option)}
                        className={[
                          'rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
                          selected
                            ? 'border-ink bg-ink text-white'
                            : 'border-line bg-white text-slate-600 hover:bg-canvas',
                        ].join(' ')}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setDraft(emptyFilters)}
                className="flex-1 rounded-xl bg-canvas px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-line"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply(draft)
                  setOpen(false)
                }}
                className="flex-1 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
