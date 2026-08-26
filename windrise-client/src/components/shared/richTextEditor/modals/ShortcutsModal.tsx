"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { XIcon } from "lucide-react"

/**
 * Mac users expect ⌘; everyone else expects Ctrl.
 *
 * Read through `useSyncExternalStore` so the server renders "Ctrl" and the
 * client corrects it during hydration without an extra render pass.
 */
const noSubscribe = () => () => {}

export function useModifierKey() {
  return React.useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform ?? "") ? "⌘" : "Ctrl"),
    () => "Ctrl"
  )
}

const SHORTCUTS: [string, string][] = [
  ["Bold", "MODB"],
  ["Italic", "MODI"],
  ["Underline", "MODU"],
  ["Strikethrough", "MOD⇧S"],
  ["Insert link", "MODK"],
  ["Undo", "MODZ"],
  ["Redo", "MOD⇧Z"],
  ["Save draft", "MODS"],
  ["Bulleted list", "MOD⇧8"],
  ["Numbered list", "MOD⇧7"],
  ["Heading 1", "MOD⌥1"],
  ["Heading 2", "MOD⌥2"],
  ["Heading 3", "MOD⌥3"],
  ["Slash commands", "/"],
]

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const mod = useModifierKey()

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // Portals need a real document; during SSR there is nothing to attach to.
  if (typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="max-h-[80vh] w-full max-w-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgb(16_24_40/0.35)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-[14px] font-semibold text-slate-900">Keyboard shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
          {SHORTCUTS.map(([label, keys]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] hover:bg-slate-50"
            >
              <span className="text-slate-700">{label}</span>
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[11px] font-medium text-slate-500">
                {keys.replace("MOD", mod === "⌘" ? "⌘" : "Ctrl+")}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
