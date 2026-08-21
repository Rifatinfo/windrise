"use client";

import { useEffect, useState } from "react";
import { CheckIcon, Loader2Icon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  getCategories,
  getTags,
  updateCategory,
} from "@/services/blog/blog";
import type { BlogCategory, BlogTag } from "@/types/blog";

export function TaxonomyTab({ onChanged }: { onChanged: () => void }) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);

  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  /** Bumped after a mutation to make the effect below refetch. */
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCategories(), getTags()])
      .then(([categoryRes, tagRes]) => {
        if (cancelled) return;
        setCategories(categoryRes.data);
        setTags(tagRes.data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load taxonomy",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  /** Reload here and let the parent refresh the post list's filters too. */
  const refresh = () => {
    setReloadToken((token) => token + 1);
    onChanged();
  };

  const handleAddCategory = async () => {
    const name = categoryDraft.trim();
    if (!name) return;
    try {
      await createCategory({ name });
      Toast.fire({ icon: "success", title: "Category added" });
      setCategoryDraft("");
      setAddingCategory(false);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't add category",
      });
    }
  };

  const handleRename = async (id: string) => {
    const name = editDraft.trim();
    if (!name) return;
    try {
      // The slug follows the new name, so existing links keep working only if
      // the name is unchanged — renaming is a deliberate act.
      await updateCategory(id, { name, slug: name });
      Toast.fire({ icon: "success", title: "Category updated" });
      setEditingId(null);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't rename category",
      });
    }
  };

  const handleDeleteCategory = async (category: BlogCategory) => {
    const warning =
      category.postCount > 0
        ? `"${category.name}" is used by ${category.postCount} post(s). They will become uncategorised. Continue?`
        : `Delete "${category.name}"?`;
    if (!window.confirm(warning)) return;

    try {
      await deleteCategory(category.id);
      Toast.fire({ icon: "success", title: "Category deleted" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete category",
      });
    }
  };

  const handleAddTag = async () => {
    const name = tagDraft.trim();
    if (!name) return;
    try {
      await createTag(name);
      Toast.fire({ icon: "success", title: "Tag added" });
      setTagDraft("");
      setAddingTag(false);
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't add tag",
      });
    }
  };

  const handleDeleteTag = async (tag: BlogTag) => {
    const warning =
      tag.postCount > 0
        ? `"${tag.name}" is on ${tag.postCount} post(s). Remove it anyway?`
        : `Delete tag "${tag.name}"?`;
    if (!window.confirm(warning)) return;

    try {
      await deleteTag(tag.id);
      Toast.fire({ icon: "success", title: "Tag deleted" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't delete tag",
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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {/* Categories */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Categories</h2>
          <button
            type="button"
            onClick={() => setAddingCategory((current) => !current)}
            className="h-9 rounded-lg bg-slate-900 px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add Category
          </button>
        </div>

        {addingCategory && (
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <input
              autoFocus
              value={categoryDraft}
              onChange={(event) => setCategoryDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleAddCategory();
                if (event.key === "Escape") setAddingCategory(false);
              }}
              placeholder="Category name"
              className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="h-9 rounded-lg bg-slate-900 px-3 text-[12px] font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setAddingCategory(false)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-[12px] text-slate-600"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Slug</th>
                <th className="px-3 py-3 font-medium">Posts</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-slate-500">
                    No categories yet.
                  </td>
                </tr>
              )}

              {categories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-4">
                    {editingId === category.id ? (
                      <input
                        autoFocus
                        value={editDraft}
                        onChange={(event) => setEditDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void handleRename(category.id);
                          if (event.key === "Escape") setEditingId(null);
                        }}
                        className="h-8 w-full rounded border border-slate-200 px-2 text-[13px] outline-none focus:border-slate-400"
                      />
                    ) : (
                      <span className="text-[13px] font-semibold text-slate-900">
                        {category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-[13px] text-slate-400">{category.slug}</td>
                  <td className="px-3 py-4 text-[13px] text-slate-600">{category.postCount}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === category.id ? (
                        <>
                          <button
                            type="button"
                            title="Save"
                            onClick={() => handleRename(category.id)}
                            className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Cancel"
                            onClick={() => setEditingId(null)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            title="Rename"
                            onClick={() => {
                              setEditingId(category.id);
                              setEditDraft(category.name);
                            }}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDeleteCategory(category)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tags */}
      <div className="h-fit rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">Tags</h2>
          <button
            type="button"
            onClick={() => setAddingTag((current) => !current)}
            className="h-9 rounded-lg bg-slate-900 px-3.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add Tag
          </button>
        </div>

        {addingTag && (
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
            <input
              autoFocus
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleAddTag();
                if (event.key === "Escape") setAddingTag(false);
              }}
              placeholder="Tag name"
              className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="h-9 rounded-lg bg-slate-900 px-3 text-[12px] font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setAddingTag(false)}
              className="h-9 rounded-lg border border-slate-200 px-3 text-[12px] text-slate-600"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 p-5">
          {tags.length === 0 && (
            <p className="text-[13px] text-slate-500">No tags yet.</p>
          )}
          {tags.map((tag) => (
            <span
              key={tag.id}
              title={`${tag.postCount} post(s)`}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12px] text-slate-700"
            >
              {tag.name}
              <button
                type="button"
                aria-label={`Delete tag ${tag.name}`}
                onClick={() => handleDeleteTag(tag)}
                className="text-slate-400 transition-colors hover:text-rose-600"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
