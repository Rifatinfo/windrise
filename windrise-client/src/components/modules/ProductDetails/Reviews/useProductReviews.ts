"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getReviews,
  type Review,
  type ReviewSummary,
} from "@/services/review/review";

/** Matches the reference, which shows three before "See more reviews". */
const PAGE_SIZE = 3;

const EMPTY_SUMMARY: ReviewSummary = {
  average: null,
  total: 0,
  distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percent: 0 })),
};

/**
 * One source of reviews for the whole product page.
 *
 * The score sits in the Reviews tab and the list sits in its own section far
 * below it, but both describe the same data — fetching twice would let them
 * disagree the moment someone posts.
 */
export function useProductReviews(productId: string) {
  const [summary, setSummary] = useState<ReviewSummary>(EMPTY_SUMMARY);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    async (page: number, append: boolean) => {
      try {
        const result = await getReviews(productId, page, PAGE_SIZE);
        setSummary(result.summary);
        setTotal(result.meta.total);
        setReviews((current) =>
          append ? [...current, ...result.reviews] : result.reviews,
        );
      } catch {
        // The product page must still render without its reviews.
        if (!append) {
          setSummary(EMPTY_SUMMARY);
          setReviews([]);
          setTotal(0);
        }
      }
    },
    [productId],
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
    // Ceil, not a stored page number: a review posted between clicks changes
    // where the next page begins.
    const nextPage = Math.floor(reviews.length / PAGE_SIZE) + 1;
    await load(nextPage, true);
    setLoadingMore(false);
  }, [load, reviews.length]);

  /** After posting, go back to the first page so the new review is visible. */
  const refresh = useCallback(() => {
    void load(1, false);
  }, [load]);

  return { summary, reviews, total, loading, loadingMore, loadMore, refresh };
}
