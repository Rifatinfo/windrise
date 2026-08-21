"use client";

import { useEffect, useState } from "react";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import { createPlacement, deletePlacement, getPlacements } from "@/services/blog/blog";
import type { AdPlacementSlot, AdStatus, AdType } from "@/types/blog";

const STATUS_STYLES: Record<AdStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  SCHEDULED: "bg-amber-50 text-amber-700",
  PAUSED: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-rose-50 text-rose-700",
  DRAFT: "bg-slate-100 text-slate-500",
};

const STATUS_DOT: Record<AdStatus, string> = {
  ACTIVE: "bg-emerald-500",
  SCHEDULED: "bg-amber-500",
  PAUSED: "bg-slate-400",
  EXPIRED: "bg-rose-500",
  DRAFT: "bg-slate-400",
};

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

/** "HEADER · 728×90" — the label inside each slot's preview box. */
const previewLabel = (slot: AdPlacementSlot) => {
  const prefix = slot.name.split(/\s+/)[0].toUpperCase();
  if (slot.isNative) return `${prefix} · native`;
  if (!slot.width || !slot.height) return prefix;
  return `${prefix} · ${slot.width}×${slot.height}`;
};

export function PlacementsTab({ onOpenAd }: { onOpenAd: (adId: string) => void }) {
  const [slots, setSlots] = useState<AdPlacementSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [isNative, setIsNative] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPlacements()
      .then((res) => {
        if (cancelled) return;
        setSlots(res.data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load placements",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = () => setReloadToken((token) => token + 1);

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.fire({ icon: "error", title: "Give the placement a name" });
      return;
    }
    setSaving(true);
    try {
      await createPlacement({
        name: name.trim(),
        description: description.trim() || null,
        width: isNative || !width ? null : Number(width),
        height: isNative || !height ? null : Number(height),
        isNative,
      });
      Toast.fire({ icon: "success", title: "Placement added" });
      setName("");
      setDescription("");
      setWidth("");
      setHeight("");
      setIsNative(false);
      setAdding(false);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't add placement",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slot: AdPlacementSlot) => {
    if (!window.confirm(`Delete the "${slot.name}" placement?`)) return;
    try {
      await deletePlacement(slot.id);
      Toast.fire({ icon: "success", title: "Placement deleted" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete placement",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] text-slate-500">
        Where ad slots live across a blog post — click a slot to jump to its current ad.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => {
          const ad = slot.currentAd;
          const clickable = Boolean(ad);

          return (
            <div
              key={slot.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-5"
            >
              {!slot.isSystem && (
                <button
                  type="button"
                  title="Delete placement"
                  onClick={() => handleDelete(slot)}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              )}

              {/* Slot preview */}
              <div
                className="flex h-[70px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60"
                aria-hidden="true"
              >
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-300">
                  {previewLabel(slot)}
                </span>
              </div>

              <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{slot.name}</h3>
              {slot.description && (
                <p className="mt-1 text-[12px] leading-[18px] text-slate-500">
                  {slot.description}
                </p>
              )}

              {/* Current occupant */}
              <button
                type="button"
                disabled={!clickable}
                onClick={() => ad && onOpenAd(ad.id)}
                title={clickable ? `Open ${ad!.name}` : "Nothing booked in this slot"}
                className={`mt-4 flex w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-left transition-colors ${
                  clickable ? "hover:bg-slate-100" : "cursor-default"
                }`}
              >
                {ad ? (
                  <>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        ad.type === "SPONSORED"
                          ? "bg-indigo-50 text-indigo-700"
                          : STATUS_STYLES[ad.status]
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          ad.type === "SPONSORED" ? "bg-indigo-500" : STATUS_DOT[ad.status]
                        }`}
                      />
                      {ad.type === "SPONSORED" ? "Sponsored" : titleCase(ad.status)}
                    </span>
                    <span className="truncate text-[12px] text-slate-600">
                      {ad.sponsorName ? `${ad.name} — ${ad.sponsorName}` : ad.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      Empty
                    </span>
                    <span className="text-[12px] text-slate-500">No ad assigned</span>
                  </>
                )}
              </button>
            </div>
          );
        })}

        {/* Add custom placement */}
        {adding ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-[15px] font-semibold text-slate-900">New placement</h3>

            <div className="mt-3 space-y-3">
              <input
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Placement name"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
              />
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Where it appears"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
              />

              <label className="flex items-center gap-2 text-[12px] text-slate-600">
                <input
                  type="checkbox"
                  checked={isNative}
                  onChange={(event) => setIsNative(event.target.checked)}
                  className="h-4 w-4 accent-slate-900"
                />
                Native slot (flows with the article, no fixed size)
              </label>

              {!isNative && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    placeholder="Width"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
                  />
                  <input
                    type="number"
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    placeholder="Height"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 text-[12px] font-medium text-white disabled:opacity-60"
                >
                  {saving && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="h-9 flex-1 rounded-lg border border-slate-200 text-[12px] text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex min-h-[210px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-600"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="text-[13px]">Add custom placement</span>
          </button>
        )}
      </div>
    </div>
  );
}
