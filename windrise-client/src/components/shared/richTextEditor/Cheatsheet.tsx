"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { insertTableOfContents, insertText, runQuickAction } from "./editorActions"
import { GlyphPicker, SPECIAL_CHARS } from "./toolbar/GlyphPicker"
import { useModifierKey } from "./modals/ShortcutsModal"

export interface EditorPrefs {
  showWordCount: boolean
  showCharCount: boolean
  autoSave: boolean
  noSpellCheck: boolean
}

export const DEFAULT_PREFS: EditorPrefs = {
  showWordCount: true,
  showCharCount: true,
  autoSave: true,
  noSpellCheck: false,
}

/**
 * The reference panel under the editor. Every row is a live control, not
 * documentation — clicking "Heading 2" formats the current block.
 */
export function Cheatsheet({
  editor,
  prefs,
  onPrefsChange,
  onOpenShortcuts,
  onNotify,
  onRequestLink,
}: {
  editor: Editor
  prefs: EditorPrefs
  onPrefsChange: (prefs: EditorPrefs) => void
  onOpenShortcuts: () => void
  onNotify: (message: string) => void
  onRequestLink: () => void
}) {
  const mod = useModifierKey()

  return (
    <div
      className={cn(
        "grid gap-x-6 gap-y-1 border-t border-input px-4 py-4",
        "grid-cols-1 min-[560px]:grid-cols-2 min-[980px]:grid-cols-5"
      )}
    >
      <Column title="Text Structure">
        <Row glyph="H1" label="Heading 1" onClick={() => runQuickAction(editor, "h1")} />
        <Row glyph="H2" label="Heading 2" onClick={() => runQuickAction(editor, "h2")} />
        <Row glyph="H3" label="Heading 3" onClick={() => runQuickAction(editor, "h3")} />
        <Row glyph="¶" label="Paragraph" onClick={() => runQuickAction(editor, "paragraph")} />
        <Row glyph="”" label="Quote" onClick={() => runQuickAction(editor, "quote")} />
      </Column>

      <Column title="Formatting">
        <Row
          glyph="</>"
          label="Inline code"
          onClick={() => runQuickAction(editor, "inlineCode")}
        />
        <Row
          glyph="{ }"
          label="Code block"
          onClick={() => runQuickAction(editor, "codeBlock")}
        />
        <Row
          glyph="▨"
          label="Highlight"
          onClick={() => runQuickAction(editor, "highlight")}
        />
        <Row
          glyph="⌨"
          label="Keyboard input"
          onClick={() => editor.chain().focus().toggleKeyboardKey().run()}
        />
        <Row
          glyph="—"
          label="Horizontal line"
          onClick={() => runQuickAction(editor, "divider")}
        />
      </Column>

      <Column title="Insert Content">
        <Row
          glyph="☰"
          label="Table of contents"
          onClick={() => {
            if (!insertTableOfContents(editor)) {
              onNotify("Add some headings first — the contents list is built from them.")
            }
          }}
        />
        <Row
          glyph="¹"
          label="Footnote"
          onClick={() => runQuickAction(editor, "footnote")}
        />

        <GlyphPicker
          label="Special character"
          triggerClassName={ROW_CLASS}
          icon={
            <>
              <span className={GLYPH_CLASS}>Ω</span>
              <span className="truncate">Special character</span>
            </>
          }
          glyphs={SPECIAL_CHARS}
          onPick={(glyph) => insertText(editor, glyph)}
        />

        <Row
          glyph="⤓"
          label="Page break"
          onClick={() => runQuickAction(editor, "pageBreak")}
        />
        <Row
          glyph="»"
          label="Read more tag"
          onClick={() => runQuickAction(editor, "readMore")}
        />
      </Column>

      <Column title="Editor Options">
        <Toggle
          label="Show word count"
          checked={prefs.showWordCount}
          onChange={(value) => onPrefsChange({ ...prefs, showWordCount: value })}
        />
        <Toggle
          label="Show character count"
          checked={prefs.showCharCount}
          onChange={(value) => onPrefsChange({ ...prefs, showCharCount: value })}
        />
        <Toggle
          label="Enable auto-save"
          checked={prefs.autoSave}
          onChange={(value) => onPrefsChange({ ...prefs, autoSave: value })}
        />
        <Toggle
          label="Disable spell check"
          checked={prefs.noSpellCheck}
          onChange={(value) => onPrefsChange({ ...prefs, noSpellCheck: value })}
        />
      </Column>

      <Column title="Shortcuts">
        <ShortcutRow
          label="Bold"
          keys={`${mod}B`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ShortcutRow
          label="Italic"
          keys={`${mod}I`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ShortcutRow
          label="Underline"
          keys={`${mod}U`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ShortcutRow label="Link" keys={`${mod}K`} onClick={onRequestLink} />
        <ShortcutRow
          label="Undo"
          keys={`${mod}Z`}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="mt-1 inline-flex items-center gap-1 px-1.5 text-[12px] font-medium text-brand transition-opacity hover:opacity-80"
        >
          View all shortcuts
          <ArrowRight className="size-3" />
        </button>
      </Column>
    </div>
  )
}

const ROW_CLASS =
  "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[12px] text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"

const GLYPH_CLASS =
  "inline-flex w-6 shrink-0 justify-center text-[11px] font-semibold text-slate-400"

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 px-1.5 text-[12px] font-semibold text-slate-800">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function Row({
  glyph,
  label,
  onClick,
}: {
  glyph: string
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={ROW_CLASS}>
      <span className={GLYPH_CLASS}>{glyph}</span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function ShortcutRow({
  label,
  keys,
  onClick,
}: {
  label: string
  keys: string
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={cn(ROW_CLASS, "justify-between")}>
      <span className="truncate">{label}</span>
      <kbd className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1 py-px font-sans text-[10px] font-medium text-slate-400">
        {keys}
      </kbd>
    </button>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className={cn(ROW_CLASS, "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-3.5 shrink-0 rounded border-slate-300 accent-brand"
      />
      <span className="truncate">{label}</span>
    </label>
  )
}
