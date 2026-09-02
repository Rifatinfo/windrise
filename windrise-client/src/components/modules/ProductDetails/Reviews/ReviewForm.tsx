"use client";

import { useRef, useState } from "react";
import { CameraIcon, Loader2Icon, XIcon } from "lucide-react";

import {
  checkEligibility,
  reviewImageUrl,
  submitReview,
  uploadReviewImage,
} from "@/services/review/review";
import { Stars } from "./Stars";

const MAX_IMAGES = 5;

/**
 * Shared look, split from the sizing on purpose.
 *
 * A textarea cannot reuse the input's height: `h-auto` and `lg:h-[42px]` have
 * the same specificity, so the responsive one wins and the box collapses to a
 * single line on desktop.
 */
const FIELD_BASE =
  "w-full rounded-[4px] border border-[#e2e2e2] bg-white px-3 text-[12px] text-[#1a1a1a] outline-none transition-colors placeholder:text-[#b0b0b0] focus:border-[#1a1a1a] lg:text-[13px]";

const FIELD = `${FIELD_BASE} h-[38px] lg:h-[42px]`;
const TEXTAREA = `${FIELD_BASE} min-h-[104px] resize-none py-2.5 leading-relaxed lg:min-h-[120px]`;

export function ReviewForm({
  productId,
  onPosted,
}: {
  productId: string;
  onPosted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  const pickFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        Array.from(files).slice(0, MAX_IMAGES - images.length).map(uploadReviewImage),
      );
      setImages((current) => [...current, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setDone("");

    if (rating < 1) {
      setError("Please choose a rating.");
      return;
    }

    setSubmitting(true);
    try {
      /*
        Asked first so the customer gets the real reason — "we can't find an
        order for this product against that number" — instead of a bare
        rejection from the write. The server re-checks on submit regardless;
        this call is for the message, not the rule.
      */
      const eligibility = await checkEligibility(productId, phone);
      if (!eligibility.eligible) {
        setError(eligibility.reason ?? "Only customers who bought this can review it.");
        return;
      }

      await submitReview({ productId, name, phone, rating, body, images });

      setDone(
        eligibility.alreadyReviewed
          ? "Thanks — your review has been updated."
          : "Thanks! Your review has been posted.",
      );
      setBody("");
      setImages([]);
      setRating(0);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full">
      <h3 className="text-[15px] font-medium text-[#1a1a1a] lg:text-[17px]">
        Write a Review
      </h3>

      <div className="mt-4 lg:mt-5">
        <label className="block text-lg  lg:text-lg">
          Add your rating<span className="text-[#c0342d]">*</span>
        </label>
        <Stars value={rating} size={24} onChange={setRating} className="mt-2" />
      </div>

      <div className="mt-4 space-y-3 lg:mt-5">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name*"
          required
          maxLength={80}
          className={FIELD}
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Contact Number*"
          required
          inputMode="tel"
          maxLength={30}
          className={FIELD}
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your review*"
          required
          rows={5}
          maxLength={2000}
          className={TEXTAREA}
        />
      </div>

      {/* Photos */}
      <div className="mt-3.5 flex flex-wrap items-start gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            void pickFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {images.map((url) => (
          <span key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reviewImageUrl(url)}
              alt=""
              className="h-[73px] w-[73px] rounded-[4px] border border-[#e2e2e2] object-cover"
            />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => setImages((c) => c.filter((i) => i !== url))}
              className="absolute -right-1.5 -top-1.5 grid h-[17px] w-[17px] place-items-center rounded-full bg-[#1a1a1a] text-white"
            >
              <XIcon className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="flex h-[73px] w-[73px] flex-col items-center justify-center gap-0.5 rounded-[6px] border-2 border-dotted border-[#e2e2e2]  text-[#9a9a9a] transition-colors hover:border-[#e2e2e2] hover:text-[#1a1a1a] disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CameraIcon className="h-[24px] w-[24px]" strokeWidth={1.5} />
                <span className="text-[9.5px]  font-semibold leading-none">Upload Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-[11.5px] leading-[17px] text-[#c0342d]">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="mt-3 text-[11.5px] text-[#1a8a4f]">
          {done}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="mt-4 flex h-[40px] w-full items-center justify-center gap-2 rounded-[4px] bg-[#0b0b0b] text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 lg:mt-5 lg:h-[38px] lg:text-[13px]"
      >
        {submitting && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
        {submitting ? "Posting..." : "Submit"}
      </button>

      <p className="mt-2.5 text-[10.5px] leading-[16px] text-[#9a9a9a]">
        Only customers who ordered this product can leave a review. Use the phone
        number from your order.
      </p>
    </form>
  );
}
