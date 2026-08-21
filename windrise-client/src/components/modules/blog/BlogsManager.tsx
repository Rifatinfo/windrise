"use client";

import { useState } from "react";

import { AllPostsTab } from "./AllPostsTab";
import { PostEditorTab } from "./PostEditorTab";
import { TaxonomyTab } from "./TaxonomyTab";

type Tab = "posts" | "editor" | "taxonomy";

const TABS: { id: Tab; label: string }[] = [
  { id: "posts", label: "All Posts" },
  { id: "editor", label: "Add New Post" },
  { id: "taxonomy", label: "Categories & Tags" },
];

export function BlogsManager() {
  const [tab, setTab] = useState<Tab>("posts");
  /** Which post the editor is on; null means a new one. */
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Bumped to make the list refetch after a save elsewhere. */
  const [version, setVersion] = useState(0);

  const openEditor = (postId: string | null) => {
    setEditingId(postId);
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
              // "Add New Post" always starts blank, even straight after editing.
              if (entry.id === "editor") setEditingId(null);
              setTab(entry.id);
            }}
            className={`h-9 rounded-lg px-4 text-[13px] font-medium transition-colors ${
              tab === entry.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {entry.id === "editor" && editingId ? "Edit Post" : entry.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "posts" && <AllPostsTab key={version} onEdit={openEditor} />}

        {tab === "editor" && (
          <PostEditorTab
            key={editingId ?? "new"}
            postId={editingId}
            onSaved={() => setVersion((current) => current + 1)}
            onDone={() => {
              setEditingId(null);
              setTab("posts");
            }}
          />
        )}

        {tab === "taxonomy" && (
          <TaxonomyTab onChanged={() => setVersion((current) => current + 1)} />
        )}
      </div>
    </div>
  );
}
