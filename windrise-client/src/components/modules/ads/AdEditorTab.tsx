"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2Icon } from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { FieldSelect } from "@/components/ui/field-select";
import {
  createAd,
  getAd,
  getCategories,
  getPlacements,
  mediaUrl,
  updateAd,
  uploadAdCreative,
} from "@/services/blog/blog";
import type { AdPlacementSlot, AdStatus, AdType, BlogCategory } from "@/types/blog";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex items-center justify-between text-[13px] font-semibold text-slate-800">
      <span>{children}</span>
      {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

/** Creative size hint for the chosen slot, e.g. "728×90 for Header Banner". */
const creativeHint = (placement?: AdPlacementSlot) => {
  if (!placement) return "Pick a placement to see the recommended size";
  if (placement.isNative) return `Native creative for ${placement.name}`;
  if (!placement.width || !placement.height) return `Creative for ${placement.name}`;
  return `Recommended ${placement.width}×${placement.height} for ${placement.name}`;
};

export function AdEditorTab({
  adId,
  onSaved,
  onDone,
}: {
  /** Set when editing; null starts a blank ad. */
  adId: string | null;
  onSaved: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AdType>("INTERNAL");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorEmail, setSponsorEmail] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [frequencyCap, setFrequencyCap] = useState("2");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [htmlSnippet, setHtmlSnippet] = useState("");
  const [placementId, setPlacementId] = useState("");
  const [priority, setPriority] = useState(50);
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState("");
  const [status, setStatus] = useState<AdStatus>("ACTIVE");

  /** Empty means every category. */
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const [placements, setPlacements] = useState<AdPlacementSlot[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [loading, setLoading] = useState(Boolean(adId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getPlacements(), getCategories()])
      .then(([placementRes, categoryRes]) => {
        if (cancelled) return;
        setPlacements(placementRes.data);
        setCategories(categoryRes.data);
        // A new ad defaults to the first slot so the size hint is never blank.
        setPlacementId((current) => current || placementRes.data[0]?.id || "");
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!adId) return;
    let cancelled = false;

    getAd(adId)
      .then((res) => {
        if (cancelled) return;
        const ad = res.data;
        setName(ad.name);
        setType(ad.type);
        setSponsorName(ad.sponsorName ?? "");
        setSponsorEmail(ad.sponsorEmail ?? "");
        setTargetUrl(ad.targetUrl ?? "");
        setOpenInNewTab(ad.openInNewTab);
        setUtmSource(ad.utmSource ?? "");
        setUtmMedium(ad.utmMedium ?? "");
        setUtmCampaign(ad.utmCampaign ?? "");
        setFrequencyCap(ad.frequencyCap === null ? "" : String(ad.frequencyCap));
        setImageUrl(ad.imageUrl);
        setHtmlSnippet(ad.htmlSnippet ?? "");
        setPlacementId(ad.placementId ?? "");
        setPriority(ad.priority);
        setStartsAt(ad.startsAt ? ad.startsAt.slice(0, 10) : "");
        setEndsAt(ad.endsAt ? ad.endsAt.slice(0, 10) : "");
        // Show the operator's own choice, not the date-derived one.
        setStatus(ad.storedStatus);
        setCategoryIds(ad.categories.map((category) => category.id));
      })
      .catch((error) =>
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load the ad",
        })
      )
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [adId]);

  const placement = placements.find((entry) => entry.id === placementId);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadAdCreative(file);
      setImageUrl(res.data.url);
      Toast.fire({ icon: "success", title: "Creative uploaded" });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const save = async (nextStatus: AdStatus) => {
    if (!name.trim()) {
      Toast.fire({ icon: "error", title: "Give the ad a name" });
      return;
    }
    if (type === "SPONSORED" && !sponsorName.trim()) {
      Toast.fire({ icon: "error", title: "Sponsored ads need a sponsor name" });
      return;
    }
    if (!targetUrl.trim()) {
      Toast.fire({ icon: "error", title: "Add the target URL" });
      return;
    }
    // Activating with nothing to render would leave a blank slot on the blog.
    if (nextStatus === "ACTIVE" && !imageUrl && !htmlSnippet.trim()) {
      Toast.fire({ icon: "error", title: "Upload a creative or paste an HTML snippet first" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        sponsorName: type === "SPONSORED" ? sponsorName.trim() || null : null,
        sponsorEmail: type === "SPONSORED" ? sponsorEmail.trim() || null : null,
        placementId: placementId || null,
        status: nextStatus,
        imageUrl,
        htmlSnippet: htmlSnippet.trim() || null,
        targetUrl: targetUrl.trim() || null,
        openInNewTab,
        priority,
        frequencyCap: frequencyCap === "" ? null : Number(frequencyCap),
        utmSource: utmSource.trim() || null,
        utmMedium: utmMedium.trim() || null,
        utmCampaign: utmCampaign.trim() || null,
        categoryIds,
        startsAt: startsAt ? new Date(`${startsAt}T00:00:00`).toISOString() : null,
        endsAt: endsAt ? new Date(`${endsAt}T23:59:59`).toISOString() : null,
      };

      if (adId) {
        await updateAd(adId, payload);
        Toast.fire({ icon: "success", title: "Ad updated" });
      } else {
        await createAd(payload);
        Toast.fire({
          icon: "success",
          title: nextStatus === "ACTIVE" ? "Ad activated" : "Draft saved",
        });
      }
      onSaved();
      onDone();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ------------------------------- Main ------------------------------- */}
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Ad Details</h2>

          <div className="mt-4 space-y-4">
            <div>
              <Label required>Ad Name</Label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Autumn Collection — Header Banner"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            <div>
              <Label>Ad Type</Label>
              <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 p-1">
                {(["INTERNAL", "SPONSORED"] as AdType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={`h-8 rounded-md px-5 text-[12px] font-medium transition-colors ${
                      type === option
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option === "INTERNAL" ? "Internal" : "Sponsored"}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[11px] leading-[17px] text-slate-400">
                Internal = our own promo. Sponsored = paid third-party placement,
                which adds the sponsor fields below.
              </p>
            </div>

            {type === "SPONSORED" && (
              <>
                <div>
                  <Label required>Sponsor Name</Label>
                  <input
                    value={sponsorName}
                    onChange={(event) => setSponsorName(event.target.value)}
                    placeholder="e.g., Local partner brand"
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <Label>Sponsor Contact Email</Label>
                  <input
                    type="email"
                    value={sponsorEmail}
                    onChange={(event) => setSponsorEmail(event.target.value)}
                    placeholder="contact@sponsor.com"
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
              </>
            )}

            <div>
              <Label required>Target URL</Label>
              <input
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                placeholder="https://windrise.com/collections/autumn"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-slate-800">
                Open link in new tab
              </span>
              <ToggleSwitch
                checked={openInNewTab}
                onChange={setOpenInNewTab}
                label="Open link in new tab"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Tracking (optional)</h2>
          <p className="text-[11px] text-slate-400">
            Appended to the target URL so click-throughs arrive already tagged.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <Label>UTM Source</Label>
              <input
                value={utmSource}
                onChange={(event) => setUtmSource(event.target.value)}
                placeholder="windrise-blog"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <Label>UTM Medium</Label>
              <input
                value={utmMedium}
                onChange={(event) => setUtmMedium(event.target.value)}
                placeholder="display"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <Label>UTM Campaign</Label>
              <input
                value={utmCampaign}
                onChange={(event) => setUtmCampaign(event.target.value)}
                placeholder="autumn-collection-2026"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-[13px] font-semibold text-slate-800">
                  Frequency cap
                </label>
                <span className="text-[11px] text-slate-400">per visitor / day</span>
              </div>
              <input
                type="number"
                min={0}
                value={frequencyCap}
                onChange={(event) => setFrequencyCap(event.target.value)}
                placeholder="Leave empty for no cap"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">HTML snippet</h2>
          <p className="text-[11px] text-slate-400">
            Used when no creative image is set — for networks that hand you an embed.
            Rendered verbatim, so paste only from sources you trust.
          </p>
          <textarea
            value={htmlSnippet}
            onChange={(event) => setHtmlSnippet(event.target.value)}
            rows={4}
            placeholder="<ins class='adsbygoogle' ...></ins>"
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-[12px] outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* ------------------------------- Rail ------------------------------- */}
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Creative</h2>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />

          {imageUrl ? (
            <div className="mt-3">
              <img
                src={mediaUrl(imageUrl) ?? ""}
                alt="Ad creative"
                className="h-[110px] w-full rounded-lg border border-slate-200 object-contain p-1"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="h-8 flex-1 rounded-md border border-slate-200 text-[12px] text-slate-700 hover:bg-slate-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="h-8 flex-1 rounded-md border border-slate-200 text-[12px] text-rose-600 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="mt-3 flex h-[110px] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-500 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
              <span className="text-[12px]">Click to upload creative</span>
              <span className="text-[11px]">{creativeHint(placement)}</span>
            </button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Placement &amp; Schedule</h2>

          <div className="mt-4 space-y-4">
            <div>
              <Label>Placement</Label>
              <FieldSelect
                label="Placement"
                value={placementId}
                onValueChange={setPlacementId}
                options={[
                  { value: "", label: "Unassigned" },
                  ...placements.map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                  })),
                ]}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="ad-priority" className="text-[13px] font-semibold text-slate-800">
                  Priority / weight
                </label>
                <span className="text-[11px] tabular-nums text-slate-400">{priority}</span>
              </div>
              <input
                id="ad-priority"
                type="range"
                min={0}
                max={100}
                value={priority}
                onChange={(event) => setPriority(Number(event.target.value))}
                className="mt-2 w-full accent-blue-600"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Higher wins when several ads share a slot.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start date</Label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <div>
                <Label>End date</Label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(event) => setEndsAt(event.target.value)}
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <FieldSelect
                label="Status"
                value={status}
                onValueChange={(next) => setStatus(next as AdStatus)}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "PAUSED", label: "Paused" },
                  { value: "DRAFT", label: "Draft" },
                ]}
                className="mt-1.5"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Scheduled and Expired are derived from the dates above.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold text-slate-900">Show on categories</h2>
            <span className="text-[11px] text-slate-400">optional targeting</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryIds([])}
              className={`h-8 rounded-full px-3.5 text-[12px] font-medium transition-colors ${
                categoryIds.length === 0
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All categories
            </button>
            {categories.map((category) => {
              const active = categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setCategoryIds((current) =>
                      active
                        ? current.filter((id) => id !== category.id)
                        : [...current, category.id]
                    )
                  }
                  className={`h-8 rounded-full px-3.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => save("DRAFT")}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => save(status)}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
            {adId ? "Update Ad" : status === "ACTIVE" ? "Activate Ad" : "Save Ad"}
          </button>
        </div>
      </div>
    </div>
  );
}
