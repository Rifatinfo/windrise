"use client";

import { useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";

import { getSalesTarget, updateSalesTarget } from "@/services/stats/stats";
import type { SalesTarget } from "@/types/stats";
import { formatPercent, formatTk } from "./dashboard.utils";
import { SectionCard } from "./SectionCard";

export function SalesTargetSection() {
  const [data, setData] = useState<SalesTarget | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    getSalesTarget()
      .then((res) => setData(res))
      .catch(() => {});
  };

  useEffect(load, []);

  const startEdit = () => {
    setDraft(String(data?.targetAmount ?? ""));
    setEditing(true);
  };

  const save = async () => {
    const amount = Number(draft);
    if (!Number.isFinite(amount) || amount < 0) return;
    setSaving(true);
    try {
      const res = await updateSalesTarget(amount);
      setData(res);
      setEditing(false);
    } catch {
      // keep the form open so the admin can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      title="Sales Target"
      subtitle={data ? `Target for ${data.month}` : undefined}
      action={
        !editing && (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <PencilIcon className="h-3 w-3" aria-hidden="true" />
            Edit target
          </button>
        )
      }
    >
      {!data ? (
        <div className="h-[100px] animate-pulse rounded-xl bg-canvas" />
      ) : editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-40 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand/50"
            placeholder="Target amount"
          />
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg bg-canvas px-3 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-semibold text-ink">
              {formatTk(data.currentRevenue)} / {formatTk(data.targetAmount)}
            </span>
            <span className="text-ink-muted">{formatPercent(data.completionPercentage)} completed</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(data.completionPercentage, 100)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-line px-2.5 py-2">
              <p className="text-ink-muted">Target</p>
              <p className="font-medium text-ink">{formatTk(data.targetAmount)}</p>
            </div>
            <div className="rounded-lg border border-line px-2.5 py-2">
              <p className="text-ink-muted">Current</p>
              <p className="font-medium text-ink">{formatTk(data.currentRevenue)}</p>
            </div>
            <div className="rounded-lg border border-line px-2.5 py-2">
              <p className="text-ink-muted">Remaining</p>
              <p className="font-medium text-ink">{formatTk(data.remainingRevenue)}</p>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
