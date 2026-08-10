"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDownIcon, XIcon } from 'lucide-react'

type ComboboxProps = {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder: string
  disabled?: boolean
  disabledHint?: string
  emptyMessage?: string
  hint?: string
  allowCustom?: boolean
  inputMode?: 'text' | 'numeric'
  maxLength?: number
}

export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  disabledHint,
  emptyMessage = 'No matches found',
  hint,
  allowCustom = false,
  inputMode = 'text',
  maxLength,
}: ComboboxProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    const starts = options.filter((option) => option.toLowerCase().startsWith(term))
    const contains = options.filter(
      (option) => !option.toLowerCase().startsWith(term) && option.toLowerCase().includes(term),
    )
    return [...starts, ...contains]
  }, [options, query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (allowCustom && query.trim()) onChange(query.trim())
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [allowCustom, query, onChange])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const activeItem = listRef.current.children[activeIndex] as HTMLElement | undefined
    activeItem?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function select(option: string) {
    onChange(option)
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      if (open && filtered[activeIndex]) {
        event.preventDefault()
        select(filtered[activeIndex])
      } else if (allowCustom && query.trim()) {
        event.preventDefault()
        select(query.trim())
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const displayValue = open ? query : value
  const showClear = Boolean(value) && !disabled

  return (
    <div ref={wrapperRef} className="relative mt-2">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        value={displayValue}
        placeholder={disabled && disabledHint ? disabledHint : placeholder}
        onFocus={() => !disabled && setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className={[
          'h-[30px] w-full border px-3 text-[11px] outline-none placeholder:text-[#bdbdbd] focus:border-[#1a1a1a]',
          showClear ? 'pr-14' : 'pr-8',
          disabled
            ? 'cursor-not-allowed border-[#ececec] bg-[#fafafa] text-[#bdbdbd]'
            : 'border-[#dcdcdc] bg-white text-[#1a1a1a]',
        ].join(' ')}
      />

      {showClear && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={() => {
            onChange('')
            setQuery('')
            setOpen(false)
          }}
          className="absolute right-7 top-1/2 -translate-y-1/2 text-[#a3a3a3] transition-colors hover:text-[#1a1a1a]"
        >
          <XIcon className="h-3 w-3" strokeWidth={1.8} />
        </button>
      )}

      <button
        type="button"
        tabIndex={-1}
        aria-label="Toggle options"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] disabled:text-[#d2d2d2]"
      >
        <ChevronDownIcon
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {hint && !open && <p className="mt-1 text-[10px] text-[#a3a3a3]">{hint}</p>}

      {open && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[32px] z-20 max-h-[190px] overflow-y-auto border border-[#dcdcdc] bg-white py-1 shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-[11px] text-[#a3a3a3]">{emptyMessage}</li>
          )}
          {filtered.map((option, index) => {
            const isActive = index === activeIndex
            const isSelected = option === value
            return (
              <li
                key={option}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault()
                  select(option)
                }}
                className={[
                  'cursor-pointer px-3 py-[6px] text-[11px]',
                  isActive ? 'bg-[#f3f3f3]' : 'bg-white',
                  isSelected ? 'text-[#1a1a1a]' : 'text-[#3d3d3d]',
                ].join(' ')}
              >
                {option}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
