"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { ChevronDown, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { applyInlineStyle } from "../editorActions"

const WEIGHTS = [
  { value: "", label: "Default" },
  { value: "100", label: "Thin (100)" },
  { value: "200", label: "Extra light (200)" },
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra bold (800)" },
  { value: "900", label: "Black (900)" },
]

const KERNING = [
  { value: "", label: "Auto" },
  { value: "normal", label: "On" },
  { value: "none", label: "Off" },
]

const CASES = [
  { value: "", label: "Aa", title: "Normal" },
  { value: "uppercase", label: "AA", title: "Uppercase" },
  { value: "lowercase", label: "aa", title: "Lowercase" },
  { value: "capitalize", label: "Ac", title: "Capitalize" },
]

/** Strip the unit off a stored CSS value so it can drive a slider. */
const numberOf = (value: unknown, fallback: number) => {
  const parsed = parseFloat(String(value ?? ""))
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * Fine typographic control over the selection — or, when nothing is selected,
 * over the paragraph the caret sits in.
 *
 * Inline properties (weight, tracking, word spacing, kerning, case) ride on
 * the `textStyle` mark; block properties (leading, space above/below) are node
 * attributes, so they survive the text being rewritten.
 */
export function TypographyPopover({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false)

  // Read live state whenever the panel opens so the controls always reflect
  // what is actually applied rather than snapping back to defaults.
  const [draft, setDraft] = React.useState({
    fontWeight: "",
    letterSpacing: 0,
    wordSpacing: 0,
    fontKerning: "",
    textTransform: "",
    lineHeight: 1.7,
    marginTop: 0,
    marginBottom: 0,
  })

  const readFromEditor = React.useCallback(() => {
    const inline = editor.getAttributes("textStyle")
    const block = editor.isActive("heading")
      ? editor.getAttributes("heading")
      : editor.getAttributes("paragraph")

    setDraft({
      fontWeight: (inline.fontWeight as string) ?? "",
      letterSpacing: numberOf(inline.letterSpacing, 0),
      wordSpacing: numberOf(inline.wordSpacing, 0),
      fontKerning: (inline.fontKerning as string) ?? "",
      textTransform: (inline.textTransform as string) ?? "",
      lineHeight: numberOf(block.lineHeight, 1.7),
      marginTop: numberOf(block.marginTop, 0),
      marginBottom: numberOf(block.marginBottom, 0),
    })
  }, [editor])

  // Routed through `applyInlineStyle` so a collapsed caret styles the whole
  // block instead of setting a stored mark that never visibly lands.
  const setInline = (patch: Record<string, string | null>) => {
    applyInlineStyle(editor, patch)
  }

  const setBlock = (patch: Record<string, string | null>) => {
    editor.chain().focus().setBlockSpacing(patch).run()
  }

  const reset = () => {
    editor
      .chain()
      .focus()
      .unsetInlineTypography()
      .unsetBlockSpacing()
      .setBlockLineHeight(null)
      .run()
    readFromEditor()
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) readFromEditor()
        setOpen(next)
      }}
    >
      <PopoverTrigger
        title="Typography"
        aria-label="Typography"
        className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-ink-soft transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Aa
        <ChevronDown className="size-3 opacity-60" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[272px] p-3">
        <div className="space-y-3.5">
          <Row label="Weight">
            <select
              value={draft.fontWeight}
              onChange={(event) => {
                const value = event.target.value
                setDraft((current) => ({ ...current, fontWeight: value }))
                setInline({ fontWeight: value || null })
              }}
              className="h-7 w-full rounded-md border border-slate-200 bg-white px-1.5 text-[12px] outline-none focus:border-slate-400"
            >
              {WEIGHTS.map((weight) => (
                <option key={weight.value} value={weight.value}>
                  {weight.label}
                </option>
              ))}
            </select>
          </Row>

          <Slider
            label="Leading"
            value={draft.lineHeight}
            min={1}
            max={3}
            step={0.05}
            onChange={(value) => {
              setDraft((current) => ({ ...current, lineHeight: value }))
              editor.chain().focus().setBlockLineHeight(String(value)).run()
            }}
          />

          <Slider
            label="Tracking"
            unit="em"
            value={draft.letterSpacing}
            min={-0.05}
            max={0.3}
            step={0.005}
            onChange={(value) => {
              setDraft((current) => ({ ...current, letterSpacing: value }))
              setInline({ letterSpacing: value ? `${value}em` : null })
            }}
          />

          <Slider
            label="Word spacing"
            unit="em"
            value={draft.wordSpacing}
            min={-0.1}
            max={0.5}
            step={0.01}
            onChange={(value) => {
              setDraft((current) => ({ ...current, wordSpacing: value }))
              setInline({ wordSpacing: value ? `${value}em` : null })
            }}
          />

          <Row label="Kerning">
            <Segmented
              options={KERNING}
              value={draft.fontKerning}
              onChange={(value) => {
                setDraft((current) => ({ ...current, fontKerning: value }))
                setInline({ fontKerning: value || null })
              }}
            />
          </Row>

          <Row label="Case">
            <Segmented
              options={CASES}
              value={draft.textTransform}
              onChange={(value) => {
                setDraft((current) => ({ ...current, textTransform: value }))
                setInline({ textTransform: value || null })
              }}
            />
          </Row>

          <Slider
            label="Space above"
            unit="px"
            value={draft.marginTop}
            min={0}
            max={60}
            step={2}
            onChange={(value) => {
              setDraft((current) => ({ ...current, marginTop: value }))
              setBlock({ marginTop: value ? `${value}px` : null })
            }}
          />

          <Slider
            label="Space below"
            unit="px"
            value={draft.marginBottom}
            min={0}
            max={60}
            step={2}
            onChange={(value) => {
              setDraft((current) => ({ ...current, marginBottom: value }))
              setBlock({ marginBottom: value ? `${value}px` : null })
            }}
          />
        </div>

        <p className="mt-3 border-t border-slate-200 pt-2.5 text-[11px] leading-relaxed text-slate-400">
          Applies to the selected text, or the current paragraph if nothing is selected.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RotateCcw className="size-3.5" />
          Reset typography
        </button>
      </PopoverContent>
    </Popover>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-medium text-slate-500">{label}</span>
      {children}
    </div>
  )
}

/** Slider + number input kept in lockstep. */
function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={`${label} value`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-7 w-[58px] rounded-md border border-slate-200 px-1.5 text-[12px] tabular-nums outline-none focus:border-slate-400"
        />
      </div>
    </div>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; title?: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex gap-1 rounded-md bg-slate-100 p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title ?? option.label}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-6 flex-1 rounded text-[11px] font-medium transition-colors",
            value === option.value
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
