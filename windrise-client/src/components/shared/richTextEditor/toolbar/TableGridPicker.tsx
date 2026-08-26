"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { ChevronDown, Table as TableIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const ROWS = 6
const COLS = 8

/** Hover an 8 × 6 grid to size the table, click to insert it. */
export function TableGridPicker({
  editor,
  compact,
}: {
  editor: Editor
  /** The row-2 trigger is a wide icon+label button rather than an icon square. */
  compact?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [hover, setHover] = React.useState({ row: 0, col: 0 })

  const insert = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setHover({ row: 0, col: 0 })
      }}
    >
      <PopoverTrigger
        title="Insert table"
        aria-label="Insert table"
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4 [&_svg]:shrink-0",
          compact
            ? "h-8 px-2.5 text-[13px] font-medium"
            : "h-7 px-1.5"
        )}
      >
        <TableIcon />
        {compact && <span>Table</span>}
        <ChevronDown className="size-3 opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-2.5">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, 18px)` }}
          onMouseLeave={() => setHover({ row: 0, col: 0 })}
        >
          {Array.from({ length: ROWS * COLS }, (_, index) => {
            const row = Math.floor(index / COLS) + 1
            const col = (index % COLS) + 1
            const lit = row <= hover.row && col <= hover.col

            return (
              <button
                key={index}
                type="button"
                aria-label={`${row} by ${col} table`}
                onMouseEnter={() => setHover({ row, col })}
                onClick={() => insert(row, col)}
                className={cn(
                  "size-[18px] rounded-[3px] border transition-colors",
                  lit ? "border-brand bg-brand/25" : "border-slate-200 bg-slate-50"
                )}
              />
            )
          })}
        </div>
        <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
          {hover.row > 0 ? `${hover.row} × ${hover.col}` : "Insert table"}
        </p>
      </PopoverContent>
    </Popover>
  )
}
