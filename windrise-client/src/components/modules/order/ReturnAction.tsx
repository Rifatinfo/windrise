"use client";

import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";

import { createReturn } from "@/services/returns/returns";

const REASONS: { value: string; label: string }[] = [
  { value: "WRONG_SIZE", label: "Wrong Size" },
  { value: "DAMAGED_PRODUCT", label: "Damaged Product" },
  { value: "WRONG_PRODUCT", label: "Wrong Product" },
  { value: "CHANGED_MIND", label: "Customer Changed Mind" },
  { value: "NOT_AS_EXPECTED", label: "Product Not as Expected" },
  { value: "OTHER", label: "Other Reason" },
];

export function ReturnAction({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0].value);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [recorded, setRecorded] = useState(false);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await createReturn({ orderId, reason, note: note || undefined });
      setRecorded(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record return");
    } finally {
      setSaving(false);
    }
  };

  if (recorded) {
    return <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-warn">Return recorded for this order.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-amber-300 hover:text-warn"
      >
        <RotateCcwIcon className="h-4 w-4" aria-hidden="true" />
        Mark as Returned
      </button>
    );
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-line p-3.5">
      <label className="block text-xs font-medium text-ink-soft">
        Reason
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-ink-soft">
        Note (optional)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1 w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
        />
      </label>
      {error && <p className="text-xs text-bad">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="flex-1 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Record Return"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-canvas px-3 py-2 text-xs font-semibold text-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
