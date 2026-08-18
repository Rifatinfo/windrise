"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Link2 } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LinkPopover({
  editor,
  isActive,
}: {
  editor: Editor
  /** Reactive from the toolbar's `useEditorState` subscription. */
  isActive: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [newTab, setNewTab] = React.useState(true)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const attrs = editor.getAttributes("link")
      setUrl(attrs.href ?? "")
      setNewTab(attrs.target ? attrs.target === "_blank" : true)
    }
    setOpen(next)
  }

  const applyLink = () => {
    const trimmed = url.trim()
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      setOpen(false)
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: trimmed,
        target: newTab ? "_blank" : null,
        rel: newTab ? "noopener noreferrer nofollow" : null,
      })
      .run()
    setOpen(false)
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        title="Link"
        aria-label="Insert or edit link"
        data-active={isActive || undefined}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-active:bg-brand/10 data-active:text-brand [&_svg]:size-4 [&_svg]:shrink-0"
      >
        <Link2 />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3 p-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            URL
          </label>
          <Input
            autoFocus
            value={url}
            placeholder="https://example.com"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                applyLink()
              }
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            checked={newTab}
            onChange={(e) => setNewTab(e.target.checked)}
            className="size-3.5 rounded border-input accent-brand"
          />
          Open in new tab
        </label>
        <div className="flex items-center justify-end gap-2 pt-1">
          {isActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeLink}
            >
              Remove
            </Button>
          )}
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
