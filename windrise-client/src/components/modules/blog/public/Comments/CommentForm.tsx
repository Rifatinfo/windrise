"use client";

import { useState } from "react";
import { Loader2Icon, XIcon } from "lucide-react";

import { postComment } from "@/services/blog/comments";
import { CommentAvatar } from "./CommentAvatar";

export type CommentViewer = {
  name: string;
  email?: string | null;
  avatar?: string | null;
} | null;

const FIELD_BASE =
  "w-full rounded-[3px] border border-[#DAD7CD] bg-transparent px-3 text-[12px] text-[#1B1B1B] outline-none transition-colors placeholder:text-[#A5A296] focus:border-[#1B1B1B] lg:text-[13px]";

const INPUT = `${FIELD_BASE} h-[38px] lg:h-[40px]`;
// A textarea must not inherit the input's fixed height: same specificity means
// the responsive one wins and the box collapses to a single line.
const TEXTAREA = `${FIELD_BASE} min-h-[92px] resize-none py-2.5 leading-relaxed lg:min-h-[104px]`;

export function CommentForm({
  slug,
  viewer,
  replyingTo,
  onCancelReply,
  onPosted,
}: {
  slug: string;
  /** The signed-in reader, or null for a guest. */
  viewer: CommentViewer;
  replyingTo: { id: string; name: string } | null;
  onCancelReply: () => void;
  onPosted: () => void;
}) {
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    setDone("");

    try {
      await postComment(slug, {
        body,
        parentId: replyingTo?.id ?? null,
        // Ignored server-side when the reader is signed in — identity comes
        // from the account there, so nobody can post under another name.
        ...(viewer ? {} : { name, email }),
      });

      setBody("");
      setDone(replyingTo ? "Reply posted." : "Comment posted.");
      onCancelReply();
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full">
      <h2 className="font-serif text-[20px] text-[#1B1B1B] lg:text-[24px]">
        Leave a Reply
      </h2>
      <p className="mt-1.5 text-[11px] leading-[17px] text-[#8B897E] lg:text-[11.5px]">
        Your email address will not be published. Required fields are marked*
      </p>

      {viewer && (
        <p className="mt-3 flex items-center gap-2 text-[11.5px] text-[#5B5A52]">
          <CommentAvatar src={viewer.avatar} size={24} />
          Commenting as <span className="font-medium text-[#1B1B1B]">{viewer.name}</span>
        </p>
      )}

      {replyingTo && (
        <p className="mt-3 flex items-center justify-between gap-2 rounded-[3px] bg-[#EFEDE4] px-3 py-2 text-[11.5px] text-[#5B5A52]">
          <span className="truncate">
            Replying to <span className="font-medium text-[#1B1B1B]">{replyingTo.name}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0 text-[#8B897E] transition-colors hover:text-[#1B1B1B]"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
        </p>
      )}

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={replyingTo ? "Write your reply*" : "Write your comment*"}
        required
        rows={4}
        maxLength={2000}
        className={`${TEXTAREA} mt-3.5`}
      />

      {/* A signed-in reader is already identified, so the name and email fields
          would only be a chance to contradict the account. */}
      {!viewer && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name*"
            required
            maxLength={80}
            className={INPUT}
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email*"
            type="email"
            required
            maxLength={160}
            className={INPUT}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11.5px] leading-[17px] text-[#B4413F]">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-[11.5px] text-[#3F7D52]">
          {done}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex h-[38px] w-full items-center justify-center gap-2 bg-[#101010] px-6 text-[10.5px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[168px] lg:h-[40px] lg:text-[11px]"
      >
        {busy && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
        {busy ? "Posting..." : replyingTo ? "Post Reply" : "Post Comment"}
      </button>
    </form>
  );
}
