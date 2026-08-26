"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CopyIcon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import { Toast } from "@/components/shared/Toast/Toast";
import {
  bulkDeletePosts,
  bulkUpdateStatus,
  deletePost,
  duplicatePost,
  getCategories,
  getPostStats,
  getPosts,
  mediaUrl,
} from "@/services/blog/blog";
import type { BlogCategory, BlogPost, BlogStats } from "@/types/blog";
import { seoBand } from "@/utils/seoScore";
import { FieldSelect } from "@/components/ui/field-select";

const PAGE_SIZE = 5;

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-600",
  SCHEDULED: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-rose-50 text-rose-700",
};

/** Shared by the bulk-action menu and the status filter. */
const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "ARCHIVED", label: "Archived" },
];

const STATUS_DOT: Record<string, string> = {
  PUBLISHED: "bg-emerald-500",
  DRAFT: "bg-slate-400",
  SCHEDULED: "bg-amber-500",
  ARCHIVED: "bg-rose-500",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
};

const formatViews = (views: number) =>
  views >= 1000 ? `${(views / 1000).toFixed(1)}k` : String(views);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

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

export function AllPostsTab({ onEdit }: { onEdit: (postId: string) => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Debounces the search box without re-firing on every keystroke.
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

  // Cancellation matters here: changing filters quickly fires overlapping
  // requests, and without it a slow earlier response can overwrite a newer one.
  useEffect(() => {
    let cancelled = false;

    getPosts({
      searchTerm: debouncedSearch || undefined,
      status,
      categoryId,
      page: 1,
      limit,
    })
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data);
        setTotal(res.meta?.total ?? res.data.length);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoading(false);
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load posts",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, categoryId, limit, reloadToken]);

  useEffect(() => {
    let cancelled = false;

    getPostStats()
      .then((res) => !cancelled && setStats(res.data))
      // The cards are informational; the table below is the real content.
      .catch(() => undefined);
    getCategories()
      .then((res) => !cancelled && setCategories(res.data))
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // Filtering can drop rows that were ticked. Rather than prune the stored
  // selection, narrow it at the point of use — a row that scrolls back into
  // view keeps its tick, and no bulk action can ever touch a hidden post.
  const visibleIds = useMemo(() => posts.map((post) => post.id), [posts]);
  const selection = useMemo(
    () => selected.filter((id) => visibleIds.includes(id)),
    [selected, visibleIds]
  );

  const allChecked = posts.length > 0 && selection.length === posts.length;
  const headerCheckbox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckbox.current) {
      headerCheckbox.current.indeterminate =
        selection.length > 0 && selection.length < posts.length;
    }
  }, [selection, posts.length]);

  const toggleAll = () => setSelected(allChecked ? [] : visibleIds);
  const toggleOne = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );

  const runBulkStatus = async (next: string) => {
    setBusy(true);
    try {
      const res = await bulkUpdateStatus(selection, next);
      Toast.fire({ icon: "success", title: `${res.data.count} post(s) updated` });
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
    if (!window.confirm(`Delete ${selection.length} post(s)? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await bulkDeletePosts(selection);
      Toast.fire({ icon: "success", title: `${res.data.count} post(s) deleted` });
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

  const handleDuplicate = async (post: BlogPost) => {
    try {
      await duplicatePost(post.id);
      Toast.fire({ icon: "success", title: "Post duplicated as a draft" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Duplicate failed",
      });
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deletePost(post.id);
      Toast.fire({ icon: "success", title: "Post deleted" });
      refresh();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Delete failed",
      });
    }
  };

  const viewsHint =
    stats?.viewsChangePercent === null || stats?.viewsChangePercent === undefined
      ? "No prior month to compare"
      : `${stats.viewsChangePercent >= 0 ? "▲" : "▼"} ${Math.abs(stats.viewsChangePercent)}% vs last month`;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total posts"
          value={String(stats?.totalPosts ?? 0)}
          hint={`${stats?.drafts ?? 0} drafts in progress`}
        />
        <StatCard
          label="Published"
          value={String(stats?.published ?? 0)}
          hint={`▲ ${stats?.publishedThisMonth ?? 0} this month`}
          hintTone="up"
        />
        <StatCard
          label="Total views"
          value={formatViews(stats?.totalViews ?? 0)}
          hint={viewsHint}
          hintTone={
            stats?.viewsChangePercent == null
              ? "muted"
              : stats.viewsChangePercent >= 0
                ? "up"
                : "down"
          }
        />
        <StatCard
          label="Avg. SEO score"
          value={String(stats?.avgSeoScore ?? 0)}
          hint={
            stats
              ? stats.avgSeoScore >= 70
                ? `${seoBand(stats.avgSeoScore)} — keep it up`
                : `${seoBand(stats.avgSeoScore)} — room to improve`
              : "Waiting for posts"
          }
        />
      </div>

      {/* Bulk action bar — only while something is ticked */}
      {selection.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
          <span className="text-[13px] font-semibold">{selection.length} selected</span>
          <span className="text-slate-500">|</span>

          {/* Acts as a menu rather than a field: the value is never held, it
              fires the bulk action and falls back to the placeholder. */}
          <FieldSelect
            label="Change status of selected posts"
            placeholder="Change status"
            value=""
            disabled={busy}
            onValueChange={(next) => next && runBulkStatus(next)}
            options={STATUS_OPTIONS}
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
        <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search posts by title, author, tag..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[13px] outline-none transition focus:border-slate-400"
          />
        </div>

        <FieldSelect
          label="Filter by status"
          value={status}
          onValueChange={(next) => {
            setLoading(true);
            setStatus(next);
          }}
          options={[{ value: "ALL", label: "All statuses" }, ...STATUS_OPTIONS]}
          triggerClassName="w-[150px]"
        />

        <FieldSelect
          label="Filter by category"
          value={categoryId}
          onValueChange={(next) => {
            setLoading(true);
            setCategoryId(next);
          }}
          options={[
            { value: "ALL", label: "All categories" },
            ...categories.map((category) => ({
              value: category.id,
              label: category.name,
            })),
          ]}
          triggerClassName="w-[170px]"
        />

        <span className="ml-auto text-[12px] text-slate-400">Sorted by newest</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="w-10 px-4 py-3">
                  <input
                    ref={headerCheckbox}
                    type="checkbox"
                    aria-label="Select all posts"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-4 w-4 accent-slate-900"
                  />
                </th>
                <th className="px-2 py-3 font-medium">Post</th>
                <th className="px-2 py-3 font-medium">Author</th>
                <th className="px-2 py-3 font-medium">Category</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-2 py-3 font-medium">SEO</th>
                <th className="px-2 py-3 font-medium">Published</th>
                <th className="px-2 py-3 font-medium">Views</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && posts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2Icon className="mx-auto h-5 w-5 animate-spin text-slate-400" />
                  </td>
                </tr>
              )}

              {!loading && posts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-slate-500">
                    No posts match these filters yet.
                  </td>
                </tr>
              )}

              {posts.map((post) => {
                const band = seoBand(post.seoScore);
                return (
                  <tr key={post.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-4 align-top">
                      <input
                        type="checkbox"
                        aria-label={`Select ${post.title}`}
                        checked={selection.includes(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="h-4 w-4 accent-slate-900"
                      />
                    </td>

                    <td className="px-2 py-4">
                      <div className="flex items-start gap-3">
                        {post.featuredImage ? (
                          <img
                            src={mediaUrl(post.featuredImage) ?? ""}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-md bg-slate-100 object-cover"
                          />
                        ) : (
                          <span className="h-11 w-11 shrink-0 rounded-md bg-slate-100" />
                        )}
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onEdit(post.id)}
                            className="block max-w-[250px] truncate text-left text-[13px] font-semibold text-slate-900 hover:underline"
                          >
                            {post.title}
                          </button>
                          <p className="mt-0.5 max-w-[250px] truncate text-[12px] text-slate-400">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        {post.author.avatar ? (
                          <img
                            src={mediaUrl(post.author.avatar) ?? ""}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                            {initials(post.author.name)}
                          </span>
                        )}
                        <span className="text-[13px] text-slate-700">{post.author.name}</span>
                      </div>
                    </td>

                    <td className="px-2 py-4">
                      {post.category ? (
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {post.category.name}
                        </span>
                      ) : (
                        <span className="text-[12px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-2 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                          STATUS_STYLES[post.status] ?? STATUS_STYLES.DRAFT
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            STATUS_DOT[post.status] ?? STATUS_DOT.DRAFT
                          }`}
                        />
                        {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td className="px-2 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 text-[12px]"
                        title={`SEO score ${post.seoScore}/100`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            band === "Good"
                              ? "bg-emerald-500"
                              : band === "OK"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                        />
                        <span
                          className={
                            band === "Good"
                              ? "text-emerald-700"
                              : band === "OK"
                                ? "text-amber-700"
                                : "text-rose-700"
                          }
                        >
                          {band}
                        </span>
                      </span>
                    </td>

                    <td className="px-2 py-4 text-[13px] text-slate-600">
                      {formatDate(post.publishedAt)}
                    </td>

                    <td className="px-2 py-4 text-[13px] text-slate-600">
                      {post.views > 0 ? formatViews(post.views) : "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View post"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          title="Edit post"
                          onClick={() => onEdit(post.id)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Duplicate post"
                          onClick={() => handleDuplicate(post)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete post"
                          onClick={() => handleDelete(post)}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[12px] text-slate-500">
          Showing {posts.length} of {total} posts
        </p>
        {posts.length < total && (
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setLimit((current) => current + PAGE_SIZE);
            }}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {loading && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
