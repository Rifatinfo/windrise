"use client"

import * as React from "react"
import { Ban } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ColorSwatchPopoverProps {
  label: string
  icon: React.ReactNode
  colors: string[]
  activeColor?: string | null
  onSelect: (color: string) => void
  onClear: () => void
}

export function ColorSwatchPopover({
  label,
  icon,
  colors,
  activeColor,
  onSelect,
  onClear,
}: ColorSwatchPopoverProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title={label}
        aria-label={label}
        data-active={!!activeColor || undefined}
        style={activeColor ? { color: activeColor } : undefined}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-brand/10 data-active:text-brand [&_svg]:size-4 [&_svg]:shrink-0"
      >
        {icon}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-44 p-2.5">
        <p className="mb-1.5 px-0.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          <button
            type="button"
            aria-label="Remove color"
            onClick={() => {
              onClear()
              setOpen(false)
            }}
            className="flex size-6 items-center justify-center rounded-full border border-input text-muted-foreground hover:border-ring"
          >
            <Ban className="size-3.5" />
          </button>
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => {
                onSelect(color)
                setOpen(false)
              }}
              style={{ backgroundColor: color }}
              className={cn(
                "size-6 rounded-full border border-black/10 transition-transform hover:scale-110",
                activeColor === color && "ring-2 ring-brand ring-offset-1"
              )}
            />
          ))}
        </div>
        <label className="mt-2.5 flex items-center gap-2 border-t border-border px-0.5 pt-2 text-xs text-muted-foreground">
          Custom
          <input
            type="color"
            className="h-6 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
            onChange={(e) => onSelect(e.target.value)}
          />
        </label>
      </PopoverContent>
    </Popover>
  )
}
