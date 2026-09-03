"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2Icon, XIcon } from "lucide-react";

import { postComment } from "@/services/blog/comments";
import { CommentAvatar } from "./CommentAvatar";

export type CommentViewer = {
  name: string;
  email?: string | null;
  avatar?: string | null;
} | null;

const TEXTAREA =
  "w-full rounded-[3px] border border-[#DAD7CD] bg-transparent px-3 py-2.5 text-[12px] leading-relaxed text-[#1B1B1B] outline-none transition-colors placeholder:text-[#A5A296] focus:border-[#1B1B1B] resize-none min-h-[92px] lg:min-h-[104px] lg:text-[13px]";

/**
 * Where an unfinished comment waits while the reader signs in.
 *
 * Sending someone to a login page throws away whatever they had typed, and they
 * come back to an empty box with no idea it was ever there. Keyed per story so
 * two open tabs cannot overwrite each other, and in sessionStorage so it does
 * not outlive the visit.
 */
const draftKey = (slug: string) => `windrise.comment-draft.${slug}`;

export function CommentForm({
  slug,
  viewer,
  replyingTo,
  onCancelReply,
  onPosted,
}: {
  slug: string;
  /** The signed-in reader, or null. Commenting requires one. */
  viewer: CommentViewer;
  replyingTo: { id: string; name: string } | null;
  onCancelReply: () => void;
  onPosted: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  // Bring back whatever they were writing before they were sent to log in.
  useEffect(() => {
    if (!viewer) return;
    try {
      const saved = sessionStorage.getItem(draftKey(slug));
      if (saved) {
        setBody(saved);
        sessionStorage.removeItem(draftKey(slug));
      }
    } catch {
      /* private mode: the draft is simply lost, which is no worse than before */
    }
  }, [viewer, slug]);

  /** Keeps the draft, then hands over to login with a route back to this story. */
  const goToLogin = () => {
    try {
      if (body.trim()) sessionStorage.setItem(draftKey(slug), body);
    } catch {
      /* nothing to keep it in */
    }
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    // A guest gets sent to sign in rather than a rejection they can do nothing
    // about — the comment they typed travels with them.
    if (!viewer) {
      goToLogin();
      return;
    }

    setBusy(true);
    setError("");
    setDone("");

    try {
      await postComment(slug, { body, parentId: replyingTo?.id ?? null });
      setBody("");
      setDone(replyingTo ? "Reply posted." : "Comment posted.");
      onCancelReply();
      onPosted();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't post that.";
      // A session can expire between the page loading and the click.
      if (/sign in|unauthor|session/i.test(message)) {
        goToLogin();
        return;
      }
      setError(message);
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
        {viewer
          ? "Your email address will not be published. Required fields are marked*"
          : "You'll need to sign in to post — we'll bring you straight back here."}
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

      {/* The box stays open to a guest: they write first and sign in second,
          which is a far better trade than being stopped at the door. */}
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={replyingTo ? "Write your reply*" : "Write your comment*"}
        required
        rows={4}
        maxLength={2000}
        className={`${TEXTAREA} mt-3.5`}
      />

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
        {busy
          ? "Posting..."
          : !viewer
            ? "Sign in to comment"
            : replyingTo
              ? "Post Reply"
              : "Post Comment"}
      </button>
    </form>
  );
}
