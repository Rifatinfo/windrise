import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarIcon, CheckIcon } from 'lucide-react'

import { buildQuickRanges, thisMonthRange, type DateRangeSelection } from './inventory.utils'

function formatDay(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface DateRangeMenuProps {
  value: string
  onChange: (range: DateRangeSelection) => void
  /**
   * Preset list to offer. Defaults to the calendar ranges used by Sales
   * Overview / Inventory; Analytics passes its own rolling windows.
   */
  buildRanges?: (today: Date) => DateRangeSelection[]
}

export function DateRangeMenu({ value, onChange, buildRanges }: DateRangeMenuProps) {
  const [open, setOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  // Computed on every render so "today" is always current — it is only five date calculations
  const quickRanges = (buildRanges ?? buildQuickRanges)(new Date())

  function closeMenu() {
    setOpen(false)
    setCustomMode(false)
  }

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) closeMenu()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function toggleMenu() {
    if (open) closeMenu()
    else setOpen(true)
  }

  function openCustomMode() {
    const fallback = thisMonthRange()
    setStart(fallback.start)
    setEnd(fallback.end)
    setCustomMode(true)
  }

  function applyCustom() {
    if (!start || !end || start > end) return
    onChange({ label: `${formatDay(start)} – ${formatDay(end)}`, start, end })
    closeMenu()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
      >
        <CalendarIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
        {value}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 z-40 mt-2 w-[224px] origin-top-left rounded-2xl border border-line bg-white p-2 shadow-pop"
          >
            {customMode ? (
              <div className="p-1.5">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-subtle">Custom Range</p>
                <label className="block text-[13px] text-slate-600">
                  Start
                  <input
                    type="date"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand/50"
                  />
                </label>
                <label className="mt-3 block text-[13px] text-slate-600">
                  End
                  <input
                    type="date"
                    value={end}
                    min={start}
                    onChange={(event) => setEnd(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm text-ink outline-none focus:border-brand/50"
                  />
                </label>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomMode(false)}
                    className="flex-1 rounded-xl bg-canvas px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-line"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={applyCustom}
                    className="flex-1 rounded-xl bg-ink px-3 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-slate-800"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div role="menu">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  Quick Range
                </p>
                {quickRanges.map((range) => {
                  const selected = range.label === value
                  return (
                    <button
                      key={range.label}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      onClick={() => {
                        onChange(range)
                        closeMenu()
                      }}
                      className={[
                        'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150',
                        selected ? 'bg-brand/8 font-semibold text-brand' : 'text-slate-700 hover:bg-canvas',
                      ].join(' ')}
                    >
                      {range.label}
                      {selected && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  )
                })}
                <div className="my-1.5 border-t border-line" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={openCustomMode}
                  className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-canvas"
                >
                  Custom Range…
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
