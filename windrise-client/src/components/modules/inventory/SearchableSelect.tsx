"use client";
import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchIcon, XIcon } from 'lucide-react'

import { ProductThumb } from './ProductThumb'

export interface SelectOption {
  id: string
  label: string
  hint?: string
  image?: string | null
  emoji?: string
}

interface SearchableSelectProps {
  label: string
  placeholder: string
  query: string
  onQueryChange: (query: string) => void
  options: SelectOption[]
  onSelect: (id: string) => void
  emptyText?: string
}

export function SearchableSelect({
  label,
  placeholder,
  query,
  onQueryChange,
  options,
  onSelect,
  emptyText = 'No matches found',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const active = Math.min(activeIndex, Math.max(options.length - 1, 0))

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => Math.min(index + 1, options.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      if (open && options[active]) {
        event.preventDefault()
        onSelect(options[active].id)
        setOpen(false)
      }
    } else if (event.key === 'Escape' && open) {
      // Close only the dropdown — let the next Escape close the modal
      event.stopPropagation()
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-[13px] font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 transition-colors duration-150 focus-within:border-brand/40">
        <SearchIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={label}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            onQueryChange(event.target.value)
            setOpen(true)
            setActiveIndex(0)
          }}
          onFocus={() => {
            setOpen(true)
            setActiveIndex(0)
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-subtle"
        />
        {query && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => {
              onQueryChange('')
              setOpen(true)
            }}
            className="shrink-0 rounded-md p-0.5 text-subtle transition-colors duration-150 hover:text-ink"
          >
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 right-0 z-30 mt-2 max-h-60 origin-top overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-pop"
          >
            {options.length === 0 && <li className="px-3.5 py-3 text-[13px] text-subtle">{emptyText}</li>}
            {options.map((option, index) => (
              <li key={option.id} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    onSelect(option.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 ${
                    index === active ? 'bg-canvas' : ''
                  }`}
                >
                  {option.emoji !== undefined && (
                    <ProductThumb image={option.image ?? null} name={option.label} emoji={option.emoji} />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{option.label}</span>
                    {option.hint && <span className="block truncate text-xs text-subtle">{option.hint}</span>}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
