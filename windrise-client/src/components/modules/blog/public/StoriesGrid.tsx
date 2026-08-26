"use client";

import { useState } from "react";
import { ChevronsRightIcon, Loader2Icon } from "lucide-react";

import type { ActiveAd } from "@/services/ads/public";
import { getPublicPosts, type PublicPost } from "@/services/blog/public";
import { AdSlot } from "./AdSlot";
import { PostCard } from "./PostCard";

/**
 * Where the ad card sits: the last slot of the third row once the grid is that
 * deep. With fewer posts it simply follows the last one — the slot is always
 * filled, so a young blog still carries its advertising.
 */
const AD_SLOT_INDEX = 8;

export function StoriesGrid({
  initialPosts,
  total,
  pageSize,
  ad,
}: {
  initialPosts: PublicPost[];
  total: number;
  pageSize: number;
  ad: ActiveAd | null;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const hasMore = posts.length < total;

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = await getPublicPosts({ page: page + 1, limit: pageSize });
      // Guard against a post being republished between pages and arriving twice.
      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        return [...current, ...next.data.filter((post) => !seen.has(post.id))];
      });
      setPage((current) => current + 1);
    } finally {
      setLoading(false);
    }
  };

  if (posts.length === 0) {
    return (
      <p className="py-24 text-center font-serif text-[15px] text-[#8A8880]">
        No stories have been published yet — check back soon.
      </p>
    );
  }

  // The ad takes a card's place rather than being appended, so the grid keeps
  // its three-up rhythm instead of gaining a ragged extra row.
  const adAt = Math.min(AD_SLOT_INDEX, posts.length);
  const before = posts.slice(0, adAt);
  const after = posts.slice(adAt);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {before.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Matches a card's image, not the whole cell, so the row stays even.
            `self-start` stops the grid stretching it to the row height, which
            would override its aspect ratio. */}
        <AdSlot ad={ad} width={486} height={267} aspect="4 / 3" className="self-start" />

        {after.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#1C1B1A] transition-opacity hover:opacity-60 disabled:opacity-40"
          >
            {loading ? (
              <Loader2Icon className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : null}
            More Posts
            <ChevronsRightIcon
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </>
  );
}
