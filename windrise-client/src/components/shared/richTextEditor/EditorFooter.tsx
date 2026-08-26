"use client"

import * as React from "react"
import {
  CalendarClock,
  CheckIcon,
  ChevronDown,
  CloudOff,
  Loader2Icon,
  SendIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type SaveState = "idle" | "saving" | "saved" | "scheduled" | "off"

/** Actions the host page wires up behind the footer buttons. */
export interface EditorFooterActions {
  onSaveDraft: () => void
  onPublish: () => void
  /** Receives the chosen `datetime-local` value from the schedule dialog. */
  onSchedule: (publishAt: string) => void
  /** Disables both buttons while a request is in flight. */
  busy?: boolean
  publishLabel?: string
}

export function EditorFooter({
  saveState,
  savedAt,
  actions,
  onRequestSchedule,
}: {
  saveState: SaveState
  savedAt: Date | null
  actions: EditorFooterActions
  /** Opens the editor's schedule dialog, which then calls `onSchedule`. */
  onRequestSchedule: () => void
}) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-input px-4 py-2.5">
      <p className="text-[12px] text-slate-400">
        Tips: Press{" "}
        <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-px font-sans text-[11px] text-slate-500">
          /
        </kbd>{" "}
        for commands
      </p>

      <div className="flex items-center gap-2">
        <SaveStatus state={saveState} savedAt={savedAt} />

        <button
          type="button"
          onClick={actions.onSaveDraft}
          disabled={actions.busy}
          className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Save Draft
        </button>

        <div className="flex items-stretch overflow-hidden rounded-lg bg-slate-900">
          <button
            type="button"
            onClick={actions.onPublish}
            disabled={actions.busy}
            className="inline-flex h-9 items-center gap-1.5 px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {actions.busy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <SendIcon className="size-3.5" />
            )}
            {actions.publishLabel ?? "Publish"}
          </button>

          <span className="my-1.5 w-px bg-white/20" aria-hidden="true" />

          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              aria-label="Publishing options"
              disabled={actions.busy}
              className="inline-flex h-9 items-center px-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ChevronDown className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              {[
                { label: "Publish now", run: actions.onPublish },
                { label: "Schedule for later", run: onRequestSchedule },
                { label: "Save as draft", run: actions.onSaveDraft },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    item.run()
                  }}
                  className="w-full rounded-md px-2 py-1.5 text-left text-[13px] text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {item.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

function SaveStatus({ state, savedAt }: { state: SaveState; savedAt: Date | null }) {
  const [, forceTick] = React.useReducer((count: number) => count + 1, 0)

  // "Autosaved 2 minutes ago" has to keep counting up on its own.
  React.useEffect(() => {
    if (state !== "saved") return
    const timer = window.setInterval(forceTick, 30_000)
    return () => window.clearInterval(timer)
  }, [state])

  const content = (() => {
    switch (state) {
      case "saving":
        return (
          <>
            <Loader2Icon className="size-3.5 animate-spin" />
            Saving…
          </>
        )
      case "saved":
        return (
          <>
            <CheckIcon className="size-3.5 text-emerald-600" />
            Autosaved {relativeTime(savedAt)}
          </>
        )
      case "scheduled":
        return (
          <>
            <CalendarClock className="size-3.5" />
            Scheduled
          </>
        )
      case "off":
        return (
          <>
            <CloudOff className="size-3.5" />
            Autosave off
          </>
        )
      default:
        return null
    }
  })()

  if (!content) return null

  return (
    <span
      className={cn(
        "mr-1 inline-flex items-center gap-1.5 text-[12px]",
        state === "saved" ? "text-slate-500" : "text-slate-400"
      )}
    >
      {content}
    </span>
  )
}

function relativeTime(date: Date | null): string {
  if (!date) return "just now"
  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return "just now"
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? "" : "s"} ago`
}
