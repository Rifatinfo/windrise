"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const BLOCK_OPTIONS = [
  { label: "Paragraph", level: 0 as const },
  { label: "Heading 1", level: 1 as const },
  { label: "Heading 2", level: 2 as const },
  { label: "Heading 3", level: 3 as const },
  { label: "Heading 4", level: 4 as const },
  { label: "Heading 5", level: 5 as const },
  { label: "Heading 6", level: 6 as const },
]

export function HeadingDropdown({
  editor,
  activeLevel,
}: {
  editor: Editor
  /** Reactive level from the toolbar's `useEditorState` subscription (0 = paragraph). */
  activeLevel: number
}) {
  const [open, setOpen] = React.useState(false)

  const active = BLOCK_OPTIONS.find((option) => option.level === activeLevel)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 min-w-[112px] shrink-0 items-center justify-between gap-1 rounded-md border border-input bg-transparent px-2 text-xs font-medium text-ink transition-colors outline-none "
          >
            <span className="truncate">{active?.label ?? "Paragraph"}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-40 p-1">
        {BLOCK_OPTIONS.map((option) => {
          const isActive = option.level === active?.level
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                if (option.level === 0) {
                  editor.chain().focus().setParagraph().run()
                } else {
                  editor.chain().focus().setHeading({ level: option.level }).run()
                }
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-blue-50 cursor-pointer",
                option.level === 0 && "text-sm",
                option.level === 1 && "text-lg font-semibold",
                option.level === 2 && "text-base font-semibold",
                option.level >= 3 && "text-sm font-semibold"
              )}
            >
              {option.label}
              {isActive && <Check className="size-3.5 text-brand" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
