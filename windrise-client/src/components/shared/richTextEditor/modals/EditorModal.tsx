"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Loader2Icon, UploadCloudIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { uploadBlogMedia } from "@/services/blog/blog"
import type { ModalSpec, UploadSpec } from "../editorActions"

/**
 * One dialog shell for every insert flow. Fields come from a spec so adding a
 * new insert type is a data change, not another modal component.
 *
 * Enter submits (except inside a textarea), Escape cancels.
 */
export function EditorModal({
  spec,
  onSubmit,
  onClose,
}: {
  spec: ModalSpec
  onSubmit: (values: Record<string, string>) => void
  onClose: () => void
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(spec.fields.map((field) => [field.name, field.defaultValue ?? ""]))
  )

  const canSubmit = spec.fields.every(
    (field) => !field.required || values[field.name]?.trim()
  )

  const submit = () => {
    if (!canSubmit) return
    onSubmit(values)
    onClose()
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
      return
    }
    if (event.key === "Enter" && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault()
      submit()
    }
  }

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
        aria-label={spec.title}
        onKeyDown={onKeyDown}
        className="w-full max-w-[420px] rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgb(16_24_40/0.35)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-[14px] font-semibold text-slate-900">{spec.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-3.5 px-4 py-4">
          {spec.upload && (
            <UploadZone
              upload={spec.upload}
              onUploaded={(patch) =>
                setValues((current) => ({ ...current, ...patch(current) }))
              }
            />
          )}

          {spec.fields.map((field, index) => (
            <div key={field.name} className="space-y-1.5">
              <label
                htmlFor={`rte-field-${field.name}`}
                className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={`rte-field-${field.name}`}
                  autoFocus={index === 0}
                  rows={4}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  className={fieldClass}
                />
              ) : (
                <input
                  id={`rte-field-${field.name}`}
                  autoFocus={index === 0}
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [field.name]: event.target.value }))
                  }
                  className={fieldClass}
                />
              )}

              {field.hint && <p className="text-[11px] text-slate-400">{field.hint}</p>}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="h-9 rounded-lg bg-slate-900 px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {spec.submitLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

const fieldClass = cn(
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 outline-none transition-colors",
  "placeholder:text-slate-400 focus:border-slate-400"
)

/**
 * Drop-or-browse upload that fills the dialog's URL field on success.
 *
 * It sits above the existing fields rather than replacing them, so pasting a
 * URL still works exactly as before.
 */
function UploadZone({
  upload,
  onUploaded,
}: {
  upload: UploadSpec
  /** Given the current values, returns the patch to merge in. */
  onUploaded: (patch: (current: Record<string, string>) => Record<string, string>) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState<string | null>(null)

  const send = async (files: FileList | null) => {
    const chosen = Array.from(files ?? [])
    if (!chosen.length) return

    setBusy(true)
    setError(null)
    try {
      // Sequential, so a partial failure still leaves earlier uploads usable.
      const uploaded: { url: string; name: string }[] = []
      for (const file of upload.multiple ? chosen : chosen.slice(0, 1)) {
        const res = await uploadBlogMedia(file)
        uploaded.push({ url: res.data.url, name: res.data.name })
      }

      onUploaded((current) => {
        if (upload.multiple) {
          const existing = current[upload.target]?.trim()
          const lines = uploaded.map((item) => item.url).join("\n")
          return { [upload.target]: existing ? `${existing}\n${lines}` : lines }
        }
        const [first] = uploaded
        return {
          [upload.target]: first.url,
          ...(upload.nameTarget ? { [upload.nameTarget]: first.name } : {}),
        }
      })

      setDone(
        uploaded.length > 1
          ? `${uploaded.length} files uploaded`
          : `Uploaded ${uploaded[0].name}`
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed")
    } finally {
      setBusy(false)
      // Let the same file be picked again after a failed attempt.
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {upload.label}
      </span>

      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          void send(event.dataTransfer.files)
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed px-3 py-4 transition-colors",
          dragging ? "border-slate-500 bg-slate-50" : "border-slate-300 hover:bg-slate-50",
          busy && "opacity-60"
        )}
      >
        {busy ? (
          <Loader2Icon className="size-4 animate-spin text-slate-400" />
        ) : (
          <UploadCloudIcon className="size-4 text-slate-400" />
        )}
        <span className="text-[12px] font-medium text-slate-600">
          {busy ? "Uploading…" : "Drop here, or click to browse"}
        </span>
        <span className="text-[11px] text-slate-400">
          {upload.multiple ? "Select several at once" : "Or paste a URL below"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={upload.accept}
        multiple={upload.multiple}
        className="hidden"
        onChange={(event) => void send(event.target.files)}
      />

      {error && <p className="text-[11px] text-red-600">{error}</p>}
      {!error && done && <p className="text-[11px] text-emerald-600">{done}</p>}
    </div>
  )
}

/** Generic confirm dialog, used for destructive editor actions. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onClose,
}: {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
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
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[380px] rounded-xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-20px_rgb(16_24_40/0.35)]"
      >
        <h2 className="text-[14px] font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-[13px] text-slate-500">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 px-3.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={cn(
              "h-9 rounded-lg px-4 text-[13px] font-semibold text-white transition-opacity hover:opacity-90",
              danger ? "bg-red-600" : "bg-slate-900"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
