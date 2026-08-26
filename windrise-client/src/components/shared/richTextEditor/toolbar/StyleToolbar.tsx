"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Droplet, Eraser, Minus, Omega, Smile } from "lucide-react"

import { cn } from "@/lib/utils"
import { ToolbarSeparator } from "../ToolbarButton"
import { applyInlineStyle, insertText, runQuickAction } from "../editorActions"
import { EMOJI, GlyphPicker, SPECIAL_CHARS } from "./GlyphPicker"
import { TypographyPopover } from "./TypographyPopover"

/** Named text treatments applied as a bundle of inline styles. */
const STYLE_PRESETS = {
  lead: { fontSize: "20px", fontWeight: "400", color: "#334155" },
  muted: { fontSize: null, fontWeight: null, color: "#64748b" },
  small: { fontSize: "12px", fontWeight: null, color: "#64748b" },
} as const

const LINE_HEIGHTS = {
  compact: "1.4",
  normal: "1.75",
  relaxed: "2.1",
  loose: "2.6",
} as const

const FONTS = {
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Courier New', monospace",
} as const

const SIZES = {
  small: "13px",
  normal: "16px",
  large: "20px",
  huge: "28px",
} as const

/**
 * Toolbar row three — presets, typography and glyph utilities.
 *
 * Every `<select>` here is a one-shot action rather than a bound value, so
 * each snaps back to its placeholder after firing.
 */
export function StyleToolbar({
  editor,
  lastColor,
}: {
  editor: Editor
  /** Most recent text colour, re-applied by the droplet button. */
  lastColor: string
}) {
  const [presetKey, setPresetKey] = React.useState("")
  const [spacingKey, setSpacingKey] = React.useState("")
  const [fontKey, setFontKey] = React.useState("")
  const [sizeKey, setSizeKey] = React.useState("")

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input px-1.5 py-1">
      <ToolbarSelect
        value={presetKey}
        placeholder="Styles"
        options={[
          { value: "lead", label: "Lead paragraph" },
          { value: "muted", label: "Muted text" },
          { value: "small", label: "Small print" },
        ]}
        onChange={(value) => {
          const preset = STYLE_PRESETS[value as keyof typeof STYLE_PRESETS]
          if (preset) {
            applyInlineStyle(editor, {
              fontSize: preset.fontSize,
              fontWeight: preset.fontWeight,
              color: preset.color,
            })
          }
          setPresetKey("")
        }}
      />

      <ToolbarSelect
        value={spacingKey}
        placeholder="Format"
        options={[
          { value: "compact", label: "Compact" },
          { value: "normal", label: "Normal" },
          { value: "relaxed", label: "Relaxed" },
          { value: "loose", label: "Loose" },
        ]}
        onChange={(value) => {
          const height = LINE_HEIGHTS[value as keyof typeof LINE_HEIGHTS]
          if (height) editor.chain().focus().setBlockLineHeight(height).run()
          setSpacingKey("")
        }}
      />

      <ToolbarSelect
        value={fontKey}
        placeholder="Font"
        options={[
          { value: "sans", label: "Sans" },
          { value: "serif", label: "Serif" },
          { value: "mono", label: "Mono" },
        ]}
        onChange={(value) => {
          const family = FONTS[value as keyof typeof FONTS]
          if (family) applyInlineStyle(editor, { fontFamily: family })
          setFontKey("")
        }}
      />

      <ToolbarSelect
        value={sizeKey}
        placeholder="Size"
        options={[
          { value: "small", label: "Small" },
          { value: "normal", label: "Normal" },
          { value: "large", label: "Large" },
          { value: "huge", label: "Huge" },
        ]}
        onChange={(value) => {
          const size = SIZES[value as keyof typeof SIZES]
          if (size) applyInlineStyle(editor, { fontSize: size })
          setSizeKey("")
        }}
      />

      <TypographyPopover editor={editor} />

      <ToolbarSeparator />

      <button
        type="button"
        title={`Reapply ${lastColor}`}
        aria-label="Reapply last text colour"
        onClick={() => editor.chain().focus().setColor(lastColor).run()}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
        style={{ color: lastColor }}
      >
        <Droplet />
      </button>

      <GlyphPicker
        label="Emoji"
        icon={<Smile />}
        glyphs={EMOJI}
        onPick={(glyph) => insertText(editor, glyph)}
      />
      <GlyphPicker
        label="Special character"
        icon={<Omega />}
        glyphs={SPECIAL_CHARS}
        onPick={(glyph) => insertText(editor, glyph)}
      />

      <button
        type="button"
        title="Em dash"
        aria-label="Insert em dash"
        onClick={() => insertText(editor, "—")}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4"
      >
        <Minus />
      </button>

      <ToolbarSeparator />

      <button
        type="button"
        onClick={() => runQuickAction(editor, "clearFormatting")}
        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5"
      >
        <Eraser />
        Clear formatting
      </button>
    </div>
  )
}

function ToolbarSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
      // Stays plain white on hover — no tint, no transition.
      className={cn(
        "h-7 shrink-0 rounded-md border border-input bg-white px-1.5 text-[12px] font-medium text-ink outline-none",
        "hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/50"
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
