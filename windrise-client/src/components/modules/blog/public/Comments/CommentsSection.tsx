"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getComments, type CommentThread } from "@/services/blog/comments";
import { CommentForm, type CommentViewer } from "./CommentForm";
import { CommentList } from "./CommentList";

/** Matches the design, which shows three before "View all comments". */
const PAGE_SIZE = 3;

export function CommentsSection({
  slug,
  viewer,
}: {
  slug: string;
  /** Resolved on the server; null for a signed-out reader. */
  viewer: CommentViewer;
}) {
  const [comments, setComments] = useState<CommentThread[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [rootTotal, setRootTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(
    async (page: number, append: boolean) => {
      try {
        const result = await getComments(slug, page, PAGE_SIZE);
        setTotalComments(result.totalComments);
        setRootTotal(result.meta.total);
        setComments((current) =>
          append ? [...current, ...result.comments] : result.comments,
        );
      } catch {
        // The story must still read without its comments.
        if (!append) {
          setComments([]);
          setTotalComments(0);
          setRootTotal(0);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void load(1, false).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    // Derived from what is on screen rather than a stored page number: a
    // comment posted between clicks moves where the next page starts.
    await load(Math.floor(comments.length / PAGE_SIZE) + 1, true);
    setLoadingMore(false);
  }, [comments.length, load]);

  const startReply = useCallback((target: { id: string; name: string }) => {
    setReplyingTo(target);
    // The form is a column away on desktop and far above on a phone, so bring
    // it into view — otherwise tapping Reply looks like it did nothing.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <section
      className="mx-auto w-full max-w-[1188px] px-5 py-10 md:px-8 md:py-12 lg:py-14"
      aria-labelledby="comments-heading"
    >
      <h2 id="comments-heading" className="sr-only">
        Comments
      </h2>

      {/*
        Side by side once there is room, stacked below that with the form
        first — the design puts writing before reading on a phone.
      */}
      <div className="grid gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 xl:gap-20">
        <div ref={formRef}>
          <CommentForm
            slug={slug}
            viewer={viewer}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onPosted={() => void load(1, false)}
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-3 w-24 animate-pulse rounded bg-[#E6E4DC]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-[34px] w-[34px] shrink-0 animate-pulse rounded-full bg-[#E6E4DC]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[#EFEDE4]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#F3F1EA]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CommentList
            comments={comments}
            totalComments={totalComments}
            hasMore={comments.length < rootTotal}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            onReply={startReply}
          />
        )}
      </div>
    </section>
  );
}
