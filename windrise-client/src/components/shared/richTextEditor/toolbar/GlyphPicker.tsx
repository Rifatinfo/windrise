"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const EMOJI = [
  "😀", "😂", "🙂", "😍", "🤔", "😅", "😎", "🥳",
  "👍", "👏", "🙌", "🙏", "💪", "🔥", "✨", "⭐",
  "✅", "❌", "⚠️", "💡", "📌", "📈", "🎯", "🚀",
]

export const SPECIAL_CHARS = [
  "©", "®", "™", "°", "§", "†", "‡", "•",
  "…", "–", "—", "½", "¼", "¾", "€", "£",
  "¥", "¢", "±", "×", "÷", "≈", "≠", "∞",
  "♥", "☆", "→", "←",
]

/** Shared grid popover for emoji and special characters. */
export function GlyphPicker({
  label,
  icon,
  glyphs,
  onPick,
  triggerClassName,
}: {
  label: string
  icon: React.ReactNode
  glyphs: string[]
  onPick: (glyph: string) => void
  /** Overrides the default icon-square trigger (the cheatsheet uses a row). */
  triggerClassName?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title={label}
        aria-label={label}
        className={
          triggerClassName ??
          "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0"
        }
      >
        {icon}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-2.5">
        <p className="mb-1.5 px-0.5 text-[11px] font-medium text-slate-500">{label}</p>
        <div className="grid grid-cols-8 gap-1">
          {glyphs.map((glyph) => (
            <button
              key={glyph}
              type="button"
              aria-label={glyph}
              onClick={() => {
                onPick(glyph)
                setOpen(false)
              }}
              className={cn(
                "flex size-7 items-center justify-center rounded-md text-[15px] leading-none",
                "transition-colors hover:bg-slate-100"
              )}
            >
              {glyph}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
