"use client";

import { useState } from "react";

import { AdEditorTab } from "./AdEditorTab";
import { AllAdsTab } from "./AllAdsTab";
import { PlacementsTab } from "./PlacementsTab";

type Tab = "ads" | "editor" | "placements";

const TABS: { id: Tab; label: string }[] = [
  { id: "ads", label: "All Ads" },
  { id: "editor", label: "Add New Ad" },
  { id: "placements", label: "Placements" },
];

export function AdsManager() {
  const [tab, setTab] = useState<Tab>("ads");
  /** Which ad the editor is on; null means a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Bumped to make the list and board refetch after a save. */
  const [version, setVersion] = useState(0);

  const openEditor = (adId: string | null) => {
    setEditingId(adId);
    setTab("editor");
  };

  return (
    <div className="px-4 lg:px-6">
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              // "Add New Ad" always starts blank, even straight after editing.
              if (entry.id === "editor") setEditingId(null);
              setTab(entry.id);
            }}
            className={`h-9 rounded-lg px-4 text-[13px] font-medium transition-colors ${
              tab === entry.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {entry.id === "editor" && editingId ? "Edit Ad" : entry.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "ads" && <AllAdsTab key={version} onEdit={openEditor} />}

        {tab === "editor" && (
          <AdEditorTab
            key={editingId ?? "new"}
            adId={editingId}
            onSaved={() => setVersion((current) => current + 1)}
            onDone={() => {
              setEditingId(null);
              setTab("ads");
            }}
          />
        )}

        {tab === "placements" && (
          <PlacementsTab key={version} onOpenAd={openEditor} />
        )}
      </div>
    </div>
  );
}
