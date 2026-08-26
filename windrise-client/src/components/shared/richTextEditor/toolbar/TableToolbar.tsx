"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  Ban,
  Combine,
  Heading1,
  PaintBucket,
  PanelBottomClose,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  Split,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToolbarSeparator } from "../ToolbarButton"

const CELL_COLORS = [
  "#f8fafc", "#e2e8f0", "#fee2e2", "#ffedd5",
  "#fef9c3", "#dcfce7", "#dbeafe", "#f3e8ff",
]

/**
 * Contextual controls that appear only while the caret is inside a table.
 *
 * Rendered as an extra toolbar row rather than a floating bubble: it never
 * covers the cell being edited, and it cannot drift out of place while the
 * table is being resized.
 */
export function TableToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      inTable: editor.isActive("table"),
      canMerge: editor.can().mergeCells(),
      canSplit: editor.can().splitCell(),
      cellHeight: (editor.getAttributes("tableCell").height ??
        editor.getAttributes("tableHeader").height ??
        "") as string,
      cellWidth: columnWidth(editor),
    }),
  }) ?? { inTable: false, canMerge: false, canSplit: false, cellHeight: "", cellWidth: "" }

  if (!state.inTable) return null

  const run = (fn: () => void) => () => fn()

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-slate-50/60 px-1.5 py-1">
      <span className="mr-1 pl-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Table
      </span>

      <TableButton
        label="Insert row above"
        icon={<PanelTopClose />}
        onClick={run(() => editor.chain().focus().addRowBefore().run())}
      />
      <TableButton
        label="Insert row below"
        icon={<PanelBottomClose />}
        onClick={run(() => editor.chain().focus().addRowAfter().run())}
      />
      <TableButton
        label="Delete row"
        icon={<Ban />}
        onClick={run(() => editor.chain().focus().deleteRow().run())}
      />

      <ToolbarSeparator />

      <TableButton
        label="Insert column left"
        icon={<PanelLeftClose />}
        onClick={run(() => editor.chain().focus().addColumnBefore().run())}
      />
      <TableButton
        label="Insert column right"
        icon={<PanelRightClose />}
        onClick={run(() => editor.chain().focus().addColumnAfter().run())}
      />
      <TableButton
        label="Delete column"
        icon={<Ban className="rotate-90" />}
        onClick={run(() => editor.chain().focus().deleteColumn().run())}
      />

      <ToolbarSeparator />

      <TableButton
        label="Merge cells"
        icon={<Combine />}
        disabled={!state.canMerge}
        onClick={run(() => editor.chain().focus().mergeCells().run())}
      />
      <TableButton
        label="Split cell"
        icon={<Split />}
        disabled={!state.canSplit}
        onClick={run(() => editor.chain().focus().splitCell().run())}
      />
      <TableButton
        label="Toggle header row"
        icon={<Heading1 />}
        onClick={run(() => editor.chain().focus().toggleHeaderRow().run())}
      />

      <ToolbarSeparator />

      <CellColorPicker editor={editor} />

      <NumberField
        label="W"
        title="Column width in pixels"
        value={state.cellWidth}
        onCommit={(value) =>
          editor
            .chain()
            .focus()
            .setCellAttribute("colwidth", value ? [Number(value)] : null)
            .run()
        }
      />
      <NumberField
        label="H"
        title="Row height in pixels"
        value={state.cellHeight.replace("px", "")}
        onCommit={(value) => setRowHeight(editor, value ? `${value}px` : null)}
      />

      <ToolbarSeparator />

      <TableButton
        label="Delete table"
        icon={<Trash2 />}
        destructive
        onClick={run(() => editor.chain().focus().deleteTable().run())}
      />
    </div>
  )
}

/** Current column's stored width, if it has been set or dragged. */
function columnWidth(editor: Editor): string {
  const colwidth =
    editor.getAttributes("tableCell").colwidth ??
    editor.getAttributes("tableHeader").colwidth
  return Array.isArray(colwidth) && colwidth[0] ? String(colwidth[0]) : ""
}

/**
 * HTML has no way to set a row's height directly, so the height goes on every
 * cell in the row — the tallest one wins, which is the same result.
 */
function setRowHeight(editor: Editor, height: string | null) {
  const { state } = editor
  const { $anchor } = state.selection

  // Walk up to the row containing the caret.
  for (let depth = $anchor.depth; depth > 0; depth -= 1) {
    const node = $anchor.node(depth)
    if (node.type.name !== "tableRow") continue

    const rowStart = $anchor.before(depth)
    const transaction = state.tr
    node.forEach((cell, offset) => {
      transaction.setNodeMarkup(rowStart + 1 + offset, undefined, {
        ...cell.attrs,
        height,
      })
    })
    editor.view.dispatch(transaction)
    return
  }
}

function TableButton({
  label,
  icon,
  onClick,
  disabled,
  destructive,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors outline-none",
        "hover:bg-slate-200/70 focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
        destructive ? "text-red-600" : "text-ink-soft"
      )}
    >
      {icon}
    </button>
  )
}

function CellColorPicker({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)

  const apply = (color: string | null) => {
    editor.chain().focus().setCellAttribute("backgroundColor", color).run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title="Cell colour"
        aria-label="Cell colour"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-slate-200/70 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
      >
        <PaintBucket />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2.5">
        <p className="mb-1.5 px-0.5 text-[11px] font-medium text-slate-500">Cell colour</p>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            title="Clear"
            aria-label="Clear cell colour"
            onClick={() => apply(null)}
            className="flex size-6 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:border-slate-400"
          >
            <Ban className="size-3.5" />
          </button>
          {CELL_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => apply(color)}
              style={{ backgroundColor: color }}
              className="size-6 rounded-full border border-black/10 transition-transform hover:scale-110"
            />
          ))}
        </div>
        <label className="mt-2.5 flex items-center gap-2 border-t border-slate-200 px-0.5 pt-2 text-[11px] text-slate-500">
          Custom
          <input
            type="color"
            className="h-6 w-10 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5"
            onChange={(event) => apply(event.target.value)}
          />
        </label>
      </PopoverContent>
    </Popover>
  )
}

/** Small labelled number box that commits on Enter or blur. */
function NumberField({
  label,
  title,
  value,
  onCommit,
}: {
  label: string
  title: string
  value: string
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = React.useState(value)
  const [editing, setEditing] = React.useState(false)

  // While the caret moves between cells the field should follow the table,
  // but it must not fight the user mid-edit.
  const shown = editing ? draft : value

  return (
    <label
      title={title}
      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-input bg-white px-1.5"
    >
      <span className="text-[11px] font-semibold text-slate-400">{label}</span>
      <input
        type="number"
        min={0}
        value={shown}
        placeholder="auto"
        onFocus={() => {
          setDraft(value)
          setEditing(true)
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setEditing(false)
          onCommit(draft)
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return
          event.preventDefault()
          setEditing(false)
          onCommit(draft)
        }}
        className="w-12 bg-transparent text-[12px] tabular-nums outline-none"
      />
    </label>
  )
}
