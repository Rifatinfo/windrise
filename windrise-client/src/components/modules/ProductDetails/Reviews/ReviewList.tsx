"use client";

import { Loader2Icon, UserIcon } from "lucide-react";

import { reviewDate, reviewImageUrl, type Review } from "@/services/review/review";
import { Stars } from "./Stars";

function ReviewItem({ review }: { review: Review }) {
  return (
    <article className="border-b border-[#efefef] pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-[28px] w-[28px] lg:h-[36px] lg:w-[36px] shrink-0 place-items-center rounded-full bg-[#eeeeee] text-[#9a9a9a]">
            <UserIcon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </span>
          <p className="truncate text-[12.5px] font-medium text-[#1a1a1a] lg:text-[14px]">
            {review.name}
          </p>
        </div>
        <time
          dateTime={review.createdAt}
          className="shrink-0 text-[10.5px] text-[#9a9a9a] lg:text-[11px]"
        >
          {reviewDate(review.createdAt)}
        </time>
      </div>

      <p className="mt-2.5 whitespace-pre-wrap text-[12px] leading-[19px] text-[#4a4a4a] lg:text-[16px] lg:leading-[21px]">
        {review.body}
      </p>

      {review.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={reviewImageUrl(url)}
              alt=""
              loading="lazy"
              className="h-[73px] w-[73px] rounded-[3px] bg-[#eeeeee] object-cover "
            />
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5">
        <Stars value={review.rating} size={16} />
        <span className="text-[12px] text-[#6f6f6f] lg:text-[16px]">
          {review.rating.toFixed(1)}
        </span>
      </p>
    </article>
  );
}

export function ReviewList({
  reviews,
  total,
  loadingMore,
  onLoadMore,
}: {
  reviews: Review[];
  total: number;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium text-[#1a1a1a] lg:text-[17px]">
          Review List
        </h3>
        {total > 0 && (
          <p className="shrink-0 text-[10.5px] text-[#9a9a9a] lg:text-[11px]">
            Showing {reviews.length} of {total} result{total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-5 text-[12px] font-light text-[#6f6f6f]">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="mt-4 space-y-5 lg:mt-5">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Only offered while something is actually left to fetch. */}
      {reviews.length < total && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-full border border-[#dcdcdc] px-4 text-[10.5px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5] disabled:opacity-60 lg:h-[32px] lg:text-[11px]"
          >
            {loadingMore && <Loader2Icon className="h-3 w-3 animate-spin" />}
            {loadingMore ? "Loading..." : "See more reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
