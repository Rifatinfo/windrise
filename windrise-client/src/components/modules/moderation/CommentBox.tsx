"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CornerDownRightIcon,
  Loader2Icon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  UserIcon,
  XIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteComment,
  formatDate,
  listComments,
  mediaUrl,
  type Counts,
  type CommentSource,
  type Meta,
  type ModerationComment,
} from "@/services/moderation/moderation";

const PAGE_SIZE = 15;

const EMPTY_COUNTS: Counts = { product: 0, blog: 0, all: 0 };
const EMPTY_META: Meta = { page: 1, limit: PAGE_SIZE, total: 0 };

const SOURCE_BADGE: Record<CommentSource, { label: string; className: string }> = {
  PRODUCT: { label: "Product review", className: "bg-[#EEF2FF] text-[#4338CA]" },
  BLOG: { label: "Blog comment", className: "bg-[#ECFDF5] text-[#047857]" },
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-[2px]" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-3 w-3 ${
            star <= value ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-[#E5E7EB] text-[#E5E7EB]"
          }`}
        />
      ))}
    </span>
  );
}

function Row({
  comment,
  onDeleted,
}: {
  comment: ModerationComment;
  onDeleted: (message: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const badge = SOURCE_BADGE[comment.source];
  const noun = comment.source === "PRODUCT" ? "review" : "comment";

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await deleteComment(comment.source, comment.id);
      // The row goes away with the reload, so the dialog goes with it.
      onDeleted(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete that.");
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <article className="rounded-xl border border-[#e8eaf0] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {comment.author.avatar ? (
            // Avatars come from /uploads and from external providers.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={comment.author.avatar}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef0f4] text-[#9aa1b1]">
              <UserIcon className="h-4 w-4" strokeWidth={1.6} />
            </span>
          )}

          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[13px] font-semibold text-[#1b2033]">
                {comment.author.name}
              </span>
              {comment.author.isMember && (
                <span className="rounded bg-[#F1F5F9] px-1.5 py-0.5 text-[9.5px] font-medium text-[#475569]">
                  Signed-in
                </span>
              )}
              {comment.isReply && (
                <span className="inline-flex items-center gap-1 text-[10.5px] text-[#8b93a7]">
                  <CornerDownRightIcon className="h-3 w-3" />
                  reply
                </span>
              )}
            </p>
            {comment.author.contact && (
              <p className="mt-0.5 truncate text-[11px] text-[#8b93a7]">
                {comment.author.contact}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <time className="text-[10.5px] text-[#9aa1b1]" dateTime={comment.createdAt}>
            {formatDate(comment.createdAt)}
          </time>
        </div>
      </div>

      {comment.rating !== null && (
        <p className="mt-2.5 flex items-center gap-1.5">
          <Stars value={comment.rating} />
          <span className="text-[11px] text-[#6f7585]">{comment.rating.toFixed(1)}</span>
        </p>
      )}

      <p className="mt-2.5 whitespace-pre-wrap text-[12.5px] leading-[20px] text-[#3d4459]">
        {comment.body}
      </p>

      {comment.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {comment.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={mediaUrl(url)}
              alt=""
              loading="lazy"
              className="h-14 w-14 rounded-md border border-[#e8eaf0] object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f2f6] pt-3">
        <p className="min-w-0 truncate text-[11px] text-[#8b93a7]">
          on{" "}
          {comment.target.href === "#" ? (
            <span className="font-medium text-[#3d4459]">{comment.target.title}</span>
          ) : (
            <Link
              href={comment.target.href}
              target="_blank"
              className="font-medium text-[#4338CA] hover:underline"
            >
              {comment.target.title}
            </Link>
          )}
        </p>

        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#F3C9CB] bg-[#FDF3F3] px-2.5 text-[11px] font-medium text-[#D0342C] transition-colors hover:bg-[#FBE9E9]"
        >
          <Trash2Icon className="h-3 w-3" />
          Delete
        </button>
      </div>

      {/* Deleting is permanent, so it is confirmed in a modal that says what
          is going and what goes with it — and stays open, disabled, while the
          request is in flight rather than closing on an unfinished action. */}
      <AlertDialog
        open={confirming}
        onOpenChange={(next) => {
          if (!busy) setConfirming(next);
        }}
      >
        {/* Width is the primitive's own (data-attribute variants beat a plain
            max-w-* here), which keeps this the size of every other confirm
            dialog in the dashboard. */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-[#FDECEC] text-[#D0342C]">
              <Trash2Icon className="h-5 w-5" strokeWidth={1.8} />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-[#1b2033]">
              Delete this {noun}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[12.5px] leading-[19px] text-[#6f7585]">
              {comment.author.name}&apos;s {noun} on{" "}
              <span className="font-medium text-[#3d4459]">{comment.target.title}</span>{" "}
              will be removed for good. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <blockquote className="max-h-24 overflow-y-auto rounded-lg bg-[#f7f8fb] px-3 py-2 text-[12px] leading-[19px] text-[#5b6274]">
            {comment.body}
          </blockquote>

          {/* The cascade is stated before it happens, not discovered after. */}
          {comment.replyCount > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-[#F5DFB8] bg-[#FFFBF2] px-3 py-2 text-[11.5px] leading-[18px] text-[#B45309]">
              <AlertTriangleIcon className="mt-[1px] h-3.5 w-3.5 shrink-0" />
              <span>
                This also deletes {comment.replyCount}{" "}
                {comment.replyCount === 1 ? "reply" : "replies"} underneath it.
              </span>
            </p>
          )}

          {error && (
            <p role="alert" className="text-[11.5px] text-[#D0342C]">
              {error}
            </p>
          )}

          <AlertDialogFooter className="bg-white">
            <AlertDialogCancel
              disabled={busy}
              className="h-9 text-[12.5px] disabled:opacity-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              disabled={busy}
              className="h-9 gap-1.5 bg-[#DC2626] text-[12.5px] text-white hover:bg-[#C11F1F]"
            >
              {busy && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {busy ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && <p className="mt-2 text-[11px] text-[#D0342C]">{error}</p>}
    </article>
  );
}

export function CommentBox() {
  const [source, setSource] = useState<CommentSource | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
  const [meta, setMeta] = useState<Meta>(EMPTY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Typing should not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setTerm(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listComments({ source, search: term, page, limit: PAGE_SIZE });
      setComments(result.comments);
      setCounts(result.counts);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load comments.");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [source, term, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const afterDelete = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 4000);
    void load();
  };

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );

  const pageCount = Math.max(1, Math.ceil(meta.total / meta.limit));
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  const tabs: { value: CommentSource | undefined; label: string; count: number }[] = [
    { value: undefined, label: "All", count: counts.all },
    { value: "PRODUCT", label: "Product reviews", count: counts.product },
    { value: "BLOG", label: "Blog comments", count: counts.blog },
  ];

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1b2033]">Comment Box</h1>
        <p className="mt-0.5 text-[13px] text-[#8b93a7]">
          Every product review and blog comment, newest first. Comments publish
          straight away — this is where you remove anything that shouldn&apos;t stand.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const active = source === tab.value;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setSource(tab.value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-[#1b2033] text-white"
                    : "bg-white text-[#5b6274] ring-1 ring-[#e8eaf0] hover:bg-[#f7f8fb]"
                }`}
              >
                {tab.label}
                <span className={active ? "text-white/70" : "text-[#9aa1b1]"}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-[280px]">
          <SearchIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa1b1]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search text, author, product or post"
            className="h-9 w-full rounded-lg border border-[#e0e3ea] bg-white pl-9 pr-8 text-[12px] outline-none transition-colors focus:border-[#1b2033]"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9aa1b1] hover:text-[#5b6274]"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-[#CFEBDA] bg-[#F3FBF6] px-3 py-2 text-[12px] text-[#1a8a4f]"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#f3d9d9] bg-[#fdf6f6] px-3 py-2 text-[12px] text-[#b21f1f]"
        >
          {error}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-[#e8eaf0] bg-white p-4">
              <div className="flex gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[#eef0f4]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 animate-pulse rounded bg-[#eef0f4]" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[#f4f5f8]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-[#f4f5f8]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-[#e8eaf0] bg-white px-4 py-12 text-center">
          <p className="text-[13px] text-[#5b6274]">
            {term ? "Nothing matches that search." : "No comments yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Row
              key={`${comment.source}-${comment.id}`}
              comment={comment}
              onDeleted={afterDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.total > 0 && (
        <div className="flex items-center justify-between gap-3 pb-6">
          <p className="text-[11.5px] text-[#8b93a7]">
            {from} – {to} of {meta.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="grid h-7 w-7 place-items-center rounded-md border border-[#e0e3ea] text-[#6b7280] transition-colors hover:bg-[#f7f8fb] disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11.5px] text-[#5b6274]">
              {meta.page} / {pageCount}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={meta.page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="grid h-7 w-7 place-items-center rounded-md border border-[#e0e3ea] text-[#6b7280] transition-colors hover:bg-[#f7f8fb] disabled:opacity-40"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
