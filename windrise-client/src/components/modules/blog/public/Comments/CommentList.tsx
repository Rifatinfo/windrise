"use client";

import { ArrowRightIcon, Loader2Icon } from "lucide-react";

import { timeAgo, type BlogComment, type CommentThread } from "@/services/blog/comments";
import { CommentAvatar } from "./CommentAvatar";

function Entry({
  comment,
  onReply,
  isReply = false,
}: {
  comment: BlogComment;
  onReply: (target: { id: string; name: string }) => void;
  isReply?: boolean;
}) {
  return (
    <li className={isReply ? "pl-7 sm:pl-9" : ""}>
      <div className="flex gap-2.5 sm:gap-3">
        <CommentAvatar src={comment.avatar} size={isReply ? 28 : 34} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[12.5px] font-semibold text-[#1B1B1B] lg:text-[13px]">
              {comment.name}
            </p>
            <time dateTime={comment.createdAt} className="text-[10.5px] text-[#8B897E]">
              {timeAgo(comment.createdAt)}
            </time>
          </div>

          {/* The body and the Reply link share a row on wider screens, as in
              the reference; on a phone the link drops below so the text keeps
              its full width. */}
          <div className="mt-1 flex items-start justify-between gap-4">
            <p className="min-w-0 whitespace-pre-wrap text-[11.5px] leading-[18px] text-[#4A4941] lg:text-[12.5px] lg:leading-[20px]">
              {comment.body}
            </p>
            <button
              type="button"
              onClick={() => onReply({ id: comment.id, name: comment.name })}
              className="hidden shrink-0 text-[11px] text-[#8B897E] transition-colors hover:text-[#1B1B1B] sm:block"
            >
              Reply
            </button>
          </div>

          <button
            type="button"
            onClick={() => onReply({ id: comment.id, name: comment.name })}
            className="mt-1 text-[11px] text-[#8B897E] transition-colors hover:text-[#1B1B1B] sm:hidden"
          >
            Reply
          </button>
        </div>
      </div>
    </li>
  );
}

export function CommentList({
  comments,
  totalComments,
  hasMore,
  loadingMore,
  onLoadMore,
  onReply,
}: {
  comments: CommentThread[];
  totalComments: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onReply: (target: { id: string; name: string }) => void;
}) {
  return (
    <div className="w-full">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#5B5A52] lg:text-[11px]">
        {totalComments} Comment{totalComments === 1 ? "" : "s"}
      </p>

      {comments.length === 0 ? (
        <p className="mt-4 text-[11.5px] text-[#8B897E]">
          No comments yet — start the conversation.
        </p>
      ) : (
        <ul className="mt-4 space-y-5 lg:mt-5 lg:space-y-6">
          {comments.map((comment) => (
            <li key={comment.id}>
              <ul className="space-y-4">
                <Entry comment={comment} onReply={onReply} />
                {comment.replies.map((reply) => (
                  <Entry key={reply.id} comment={reply} onReply={onReply} isReply />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-6 flex justify-end lg:mt-7">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#1B1B1B] transition-opacity hover:opacity-70 disabled:opacity-50 lg:text-[11px]"
          >
            {loadingMore ? (
              <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                View all comments
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
