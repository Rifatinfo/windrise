"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import {
  bulkDeleteAds,
  bulkUpdateAdStatus,
  deleteAd,
  getAdStats,
  getAds,
  getPlacements,
  mediaUrl,
} from "@/services/blog/blog";
import type { Ad, AdPlacementSlot, AdStats, AdStatus } from "@/types/blog";
import { FieldSelect } from "@/components/ui/field-select";

/** Statuses an operator can set directly; the rest are date-derived. */
const BULK_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "DRAFT", label: "Draft" },
];

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

const titleCase = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase();

const compact = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
};

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** "Aug 1 – Sep 30", "Jul 15 – ongoing", "Not scheduled". */
const runsLabel = (ad: Ad) => {
  if (!ad.startsAt && !ad.endsAt) return "Always on";
  if (ad.startsAt && !ad.endsAt) return `${shortDate(ad.startsAt)} – ongoing`;
  if (!ad.startsAt && ad.endsAt) return `until ${shortDate(ad.endsAt)}`;
  return `${shortDate(ad.startsAt!)} – ${shortDate(ad.endsAt!)}`;
};

function StatCard({
  label,
  value,
  hint,
  hintTone = "muted",
}: {
  label: string;
  value: string;
  hint: string;
  hintTone?: "muted" | "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-[13px] text-slate-500">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none text-slate-900">{value}</p>
      <p
        className={`mt-3 text-[12px] ${
          hintTone === "up"
            ? "text-emerald-600"
            : hintTone === "down"
              ? "text-rose-600"
              : "text-slate-400"
        }`}
      >
        {hint}
      </p>
    </div>
  );
}

export function AllAdsTab({ onEdit }: { onEdit: (adId: string) => void }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [placements, setPlacements] = useState<AdPlacementSlot[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("ALL");
  const [placementId, setPlacementId] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  /** Bumped after a mutation to make the effect below refetch. */
  const [reloadToken, setReloadToken] = useState(0);
  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getAds({ searchTerm: debouncedSearch || undefined, type, placementId, status }),
      getAdStats(),
      getPlacements(),
    ])
      .then(([adRes, statRes, placementRes]) => {
        if (cancelled) return;
        setAds(adRes.data);
        setStats(statRes.data);
        setPlacements(placementRes.data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load ads",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, type, placementId, status, reloadToken]);

  // Filters can hide ticked rows; narrow at the point of use so a bulk action
  // can never touch an ad that is off screen.
  const visibleIds = useMemo(() => ads.map((ad) => ad.id), [ads]);
  const selection = useMemo(
    () => selected.filter((id) => visibleIds.includes(id)),
    [selected, visibleIds]
  );

  const allChecked = ads.length > 0 && selection.length === ads.length;
  const headerCheckbox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckbox.current) {
      headerCheckbox.current.indeterminate =
        selection.length > 0 && selection.length < ads.length;
    }
  }, [selection, ads.length]);

  const toggleOne = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );

  const runBulkStatus = async (next: string) => {
    setBusy(true);
    try {
      const res = await bulkUpdateAdStatus(selection, next);
      Toast.fire({ icon: "success", title: `${res.data.count} ad(s) updated` });
      setSelected([]);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Update failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const runBulkDelete = async () => {
    if (!window.confirm(`Delete ${selection.length} ad(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await bulkDeleteAds(selection);
      Toast.fire({ icon: "success", title: `${res.data.count} ad(s) deleted` });
      setSelected([]);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Delete failed",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (ad: Ad) => {
    if (!window.confirm(`Delete "${ad.name}"? This cannot be undone.`)) return;
    try {
      await deleteAd(ad.id);
      Toast.fire({ icon: "success", title: "Ad deleted" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Delete failed",
      });
    }
  };

  const changeHint = (percent: number | null, noun: string) =>
    percent === null ? `No prior period to compare` : `${percent >= 0 ? "▲" : "▼"} ${Math.abs(percent)}%${noun}`;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active ads"
          value={String(stats?.activeAds ?? 0)}
          hint={`${stats?.scheduledAds ?? 0} scheduled`}
        />
        <StatCard
          label="Impressions (30d)"
          value={compact(stats?.impressions30d ?? 0)}
          hint={changeHint(stats?.impressionsChangePercent ?? null, " vs prior period")}
          hintTone={
            stats?.impressionsChangePercent == null
              ? "muted"
              : stats.impressionsChangePercent >= 0
                ? "up"
                : "down"
          }
        />
        <StatCard
          label="Clicks (30d)"
          value={(stats?.clicks30d ?? 0).toLocaleString()}
          hint={changeHint(stats?.clicksChangePercent ?? null, "")}
          hintTone={
            stats?.clicksChangePercent == null
              ? "muted"
              : stats.clicksChangePercent >= 0
                ? "up"
                : "down"
          }
        />
        <StatCard
          label="Avg. CTR"
          value={`${stats?.ctr30d ?? 0}%`}
          hint={
            (stats?.impressions30d ?? 0) === 0
              ? "No traffic yet"
              : (stats?.ctr30d ?? 0) >= 0.5
                ? "Healthy for native placements"
                : "Below the usual native range"
          }
        />
      </div>

      {/* Bulk bar */}
      {selection.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
          <span className="text-[13px] font-semibold">{selection.length} selected</span>
          <span className="text-slate-500">|</span>
          {/* Acts as a menu rather than a field: the value is never held, it
              fires the bulk action and falls back to the placeholder. */}
          <FieldSelect
            label="Change status of selected ads"
            placeholder="Change status"
            value=""
            disabled={busy}
            onValueChange={(next) => next && runBulkStatus(next)}
            options={BULK_STATUS_OPTIONS}
            triggerClassName="h-8 w-auto rounded-md border-white/25 bg-transparent px-2 text-[12px] text-white data-placeholder:text-white"
          />
          <button
            type="button"
            onClick={runBulkDelete}
            disabled={busy}
            className="h-8 rounded-md border border-white/25 px-3 text-[12px] transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto h-8 rounded-md border border-white/25 px-3 text-[12px] transition-colors hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search ads by name or sponsor"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] outline-none focus:border-slate-400"
          />
        </div>

        <FieldSelect
          label="Filter by type"
          value={type}
          onValueChange={(next) => {
            setLoading(true);
            setType(next);
          }}
          options={[
            { value: "ALL", label: "All types" },
            { value: "INTERNAL", label: "Internal" },
            { value: "SPONSORED", label: "Sponsored" },
          ]}
          triggerClassName="w-[135px]"
        />

        <FieldSelect
          label="Filter by placement"
          value={placementId}
          onValueChange={(next) => {
            setLoading(true);
            setPlacementId(next);
          }}
          options={[
            { value: "ALL", label: "All placements" },
            ...placements.map((placement) => ({
              value: placement.id,
              label: placement.name,
            })),
          ]}
          triggerClassName="w-[175px]"
        />

        <FieldSelect
          label="Filter by status"
          value={status}
          onValueChange={(next) => {
            setLoading(true);
            setStatus(next);
          }}
          options={[
            { value: "ALL", label: "All statuses" },
            { value: "ACTIVE", label: "Active" },
            { value: "SCHEDULED", label: "Scheduled" },
            { value: "PAUSED", label: "Paused" },
            { value: "EXPIRED", label: "Expired" },
            { value: "DRAFT", label: "Draft" },
          ]}
          triggerClassName="w-[150px]"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <input
                    ref={headerCheckbox}
                    type="checkbox"
                    aria-label="Select all ads"
                    checked={allChecked}
                    onChange={() => setSelected(allChecked ? [] : visibleIds)}
                    className="h-4 w-4 accent-slate-900"
                  />
                </th>
                <th className="px-2 py-3 font-medium">Ad</th>
                <th className="px-2 py-3 font-medium">Sponsor</th>
                <th className="px-2 py-3 font-medium">Type</th>
                <th className="px-2 py-3 font-medium">Placement</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">Runs</th>
                <th className="px-2 py-3 font-medium">Impr.</th>
                <th className="px-2 py-3 font-medium">Clicks</th>
                <th className="px-2 py-3 font-medium">CTR</th>
                <th className="sticky right-0 z-10 bg-white px-4 py-3 text-right font-medium shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && ads.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              )}

              {!loading && ads.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-[13px] text-slate-500">
                    No ads match these filters yet.
                  </td>
                </tr>
              )}

              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${ad.name}`}
                      checked={selection.includes(ad.id)}
                      onChange={() => toggleOne(ad.id)}
                      className="h-4 w-4 accent-slate-900"
                    />
                  </td>

                  <td className="px-2 py-4">
                    <div className="flex items-center gap-3">
                      {ad.imageUrl ? (
                        <img
                          src={mediaUrl(ad.imageUrl) ?? ""}
                          alt=""
                          className="h-9 w-14 shrink-0 rounded bg-slate-100 object-contain"
                        />
                      ) : (
                        <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-[9px] uppercase text-slate-400">
                          {ad.htmlSnippet ? "html" : "—"}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(ad.id)}
                        title={ad.name}
                        className="max-w-[170px] truncate text-left text-[13px] font-semibold text-slate-900 hover:underline"
                      >
                        {ad.name}
                      </button>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-2 py-4 text-[13px] text-slate-600">
                    {ad.sponsorName ?? "Windrise"}
                  </td>

                  <td className="px-2 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] ${
                        ad.type === "SPONSORED"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          ad.type === "SPONSORED" ? "bg-indigo-500" : "bg-slate-400"
                        }`}
                      />
                      {titleCase(ad.type)}
                    </span>
                  </td>

                  <td className="px-2 py-4 whitespace-nowrap text-[13px] text-slate-600">
                    {ad.placement?.name ?? "Unassigned"}
                  </td>

                  <td className="px-2 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLES[ad.status]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ad.status]}`} />
                      {titleCase(ad.status)}
                    </span>
                  </td>

                  <td className="px-2 py-4 whitespace-nowrap text-[13px] text-slate-600">
                    {runsLabel(ad)}
                  </td>

                  <td className="px-2 py-4 text-[13px] text-slate-600">
                    {ad.impressions > 0 ? compact(ad.impressions) : "—"}
                  </td>
                  <td className="px-2 py-4 text-[13px] text-slate-600">
                    {ad.clicks > 0 ? ad.clicks.toLocaleString() : "—"}
                  </td>
                  <td className="px-2 py-4 text-[13px] text-slate-600">
                    {ad.impressions > 0 ? `${ad.ctr}%` : "—"}
                  </td>

                  {/* Pinned so the row actions stay reachable while the wide
                      table scrolls sideways. */}
                  <td className="sticky right-0 z-10 bg-white px-4 py-4 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-end gap-1">
                      {ad.targetUrl ? (
                        <a
                          href={ad.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open target URL"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <span
                          title="No target URL set"
                          className="cursor-not-allowed rounded-md p-1.5 text-slate-200"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </span>
                      )}
                      <button
                        type="button"
                        title="Edit ad"
                        onClick={() => onEdit(ad.id)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete ad"
                        onClick={() => handleDelete(ad)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
