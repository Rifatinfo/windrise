"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import type { Editor } from "@tiptap/react"

import { cn } from "@/lib/utils"
import { runQuickAction, type ModalKind, type QuickAction } from "./editorActions"

type SlashCommand = {
  key: string
  label: string
  hint: string
} & ({ action: QuickAction } | { modal: ModalKind })

const COMMANDS: SlashCommand[] = [
  { key: "h1", label: "Heading 1", hint: "Large section title", action: "h1" },
  { key: "h2", label: "Heading 2", hint: "Medium section title", action: "h2" },
  { key: "h3", label: "Heading 3", hint: "Small section title", action: "h3" },
  { key: "text", label: "Text", hint: "Plain paragraph", action: "paragraph" },
  { key: "bullet list", label: "Bulleted list", hint: "Unordered list", action: "bulletList" },
  { key: "numbered list", label: "Numbered list", hint: "Ordered list", action: "orderedList" },
  { key: "quote", label: "Quote", hint: "Pull quote block", action: "quote" },
  { key: "divider", label: "Divider", hint: "Horizontal rule", action: "divider" },
  { key: "image", label: "Image", hint: "Insert by URL", modal: "image" },
  { key: "table", label: "Table", hint: "Choose rows and columns", modal: "table" },
  { key: "callout", label: "Callout", hint: "Highlighted note", modal: "callout" },
  { key: "button", label: "Button", hint: "Call-to-action link", modal: "cta" },
  { key: "code block", label: "Code block", hint: "Preformatted code", action: "codeBlock" },
  { key: "read more", label: "Read more tag", hint: "Split the excerpt", action: "readMore" },
]

interface Trigger {
  query: string
  from: number
  to: number
  top: number
  left: number
}

/** Find a `/query` immediately before the caret, at a word boundary. */
function detectTrigger(editor: Editor): Trigger | null {
  const { state, view } = editor
  const { selection } = state
  if (!selection.empty) return null

  const $from = selection.$from
  if (!$from.parent.isTextblock || $from.parent.type.name === "codeBlock") return null

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼")
  const match = /(?:^|\s)\/([a-zA-Z]*)$/.exec(textBefore)
  if (!match) return null

  const to = selection.from
  const from = to - match[1].length - 1

  try {
    const coords = view.coordsAtPos(from)
    return { query: match[1], from, to, top: coords.bottom + 6, left: coords.left }
  } catch {
    return null
  }
}

/**
 * The `/` command palette.
 *
 * Detection runs off the editor's transaction stream rather than a ProseMirror
 * plugin so the menu stays plain React — easier to position, style and test.
 */
export function SlashCommandMenu({
  editor,
  onOpenModal,
}: {
  editor: Editor
  onOpenModal: (kind: ModalKind) => void
}) {
  const [trigger, setTrigger] = React.useState<Trigger | null>(null)
  const [active, setActive] = React.useState(0)
  const lastQuery = React.useRef<string | null>(null)

  React.useEffect(() => {
    const sync = () => {
      const next = detectTrigger(editor)
      // Narrowing the query re-ranks the list, so start from the top again.
      if ((next?.query ?? null) !== lastQuery.current) {
        lastQuery.current = next?.query ?? null
        setActive(0)
      }
      setTrigger(next)
    }
    editor.on("transaction", sync)
    return () => {
      editor.off("transaction", sync)
    }
  }, [editor])

  const matches = React.useMemo(() => {
    if (!trigger) return []
    const query = trigger.query.toLowerCase()
    if (!query) return COMMANDS
    return COMMANDS.filter(
      (command) =>
        command.key.includes(query) || command.label.toLowerCase().includes(query)
    )
  }, [trigger])

  // Guard against the list shrinking below the highlighted row.
  const activeIndex = matches.length ? Math.min(active, matches.length - 1) : 0

  const run = React.useCallback(
    (command: SlashCommand) => {
      if (!trigger) return
      // Drop the typed "/query" first so the command acts on a clean block.
      editor.chain().focus().deleteRange({ from: trigger.from, to: trigger.to }).run()

      if ("modal" in command) onOpenModal(command.modal)
      else runQuickAction(editor, command.action)

      setTrigger(null)
    },
    [editor, onOpenModal, trigger]
  )

  React.useEffect(() => {
    if (!trigger) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setTrigger(null)
        return
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActive((current) => (matches.length ? (current + 1) % matches.length : 0))
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActive((current) =>
          matches.length ? (current - 1 + matches.length) % matches.length : 0
        )
        return
      }
      if (event.key === "Enter" && matches[activeIndex]) {
        event.preventDefault()
        run(matches[activeIndex])
      }
    }

    const dom = editor.view.dom
    dom.addEventListener("keydown", onKeyDown, true)
    return () => dom.removeEventListener("keydown", onKeyDown, true)
  }, [activeIndex, editor, matches, run, trigger])

  if (!trigger || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed z-[60] w-[260px] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-[0_16px_40px_-12px_rgb(16_24_40/0.28)]"
      style={{ top: trigger.top, left: trigger.left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {matches.length === 0 ? (
        <p className="px-3 py-2 text-[12px] text-slate-400">No matching commands</p>
      ) : (
        <div className="max-h-[260px] overflow-y-auto">
          {matches.map((command, index) => (
            <button
              key={command.key}
              type="button"
              onMouseEnter={() => setActive(index)}
              onClick={() => run(command)}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left transition-colors",
                index === activeIndex ? "bg-slate-100" : "hover:bg-slate-50"
              )}
            >
              <span className="text-[13px] font-medium text-slate-800">{command.label}</span>
              <span className="text-[11px] text-slate-400">{command.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}
