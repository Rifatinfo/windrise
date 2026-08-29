import Link from "next/link";
import { ChevronsRightIcon } from "lucide-react";

import { PostContentRenderer } from "@/components/shared/PostContentRenderer";
import { Reveal } from "@/components/shared/motion/Reveal";
import type { ActiveAd } from "@/services/ads/public";
import { mediaUrl } from "@/services/blog/blog";
import type { PublicPostDetail } from "@/services/blog/public";
import { splitIntoSections } from "@/utils/splitArticle";
import { AdSlot } from "./AdSlot";
import { longDate } from "./PostCard";
import { ShareRail } from "./ShareRail";

/**
 * Where the article breaks.
 *
 * The opening runs beside the byline, then the cover image spans the full
 * column, then the body continues alongside the right rail with the highlight
 * pulled out partway down — the shape the design lays out.
 */
const COVER_AFTER_PARAGRAPHS = 2;
const HIGHLIGHT_AFTER_PARAGRAPHS = 5;

/** The narrow left column: author, portrait, share. */
function Byline({ post }: { post: PublicPostDetail }) {
  const avatar = mediaUrl(post.author.avatar);

  return (
    <div>
      <p className="text-[9px] font-semibold md:text-[16px] font-dm-sans uppercase tracking-[0.12em] text-[#1C1B1A]">
        {post.author.name}
      </p>

      {avatar && (
        <div className="mt-3 h-[88px] w-[88px] overflow-hidden bg-[#EDEBE6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt={post.author.name} className="h-full w-full object-cover rounded-sm" />
        </div>
      )}

      <div className="mt-5">
        <ShareRail title={post.title} />
      </div>
    </div>
  );
}

const bodyClass = "font-serif text-[13px] leading-[1.75] text-[#4A4842]";

export function PostArticle({
  post,
  sidebar,
  mobileAd,
}: {
  post: PublicPostDetail;
  /** The right rail, which only begins below the cover image. */
  sidebar: React.ReactNode;
  /** Shown inside the flow on phones, where there is no right rail. */
  mobileAd: ActiveAd | null;
}) {
  const [opening, middle, rest] = splitIntoSections(post.content, [
    COVER_AFTER_PARAGRAPHS,
    HIGHLIGHT_AFTER_PARAGRAPHS,
  ]);

  const cover = mediaUrl(post.featuredImage);

  return (
    <article>
      {/* ---- Header: indented to the text column, rule spans the page ---- */}
      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <div aria-hidden="true" />
        <header>
          {post.publishedAt && (
            <p className="text-[9px] md:text-[12px] font-medium uppercase tracking-[0.14em]">
              {longDate(post.publishedAt)}
            </p>
          )}
          <h1 className="mt-3 font-display text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.22] text-[#1C1B1A]">
            {post.title}
          </h1>
        </header>
      </div>

      <hr className="mt-8 border-[#E3E0D9]" />

      {/* ---- Opening: byline beside the lead ---- */}
      <div className="mt-8 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <Byline post={post} />

        <div className="mt-6 min-w-0 lg:mt-0">
          {post.excerpt && (
            <p className="font-serif text-[clamp(18px,1.4vw,24px)] leading-[1.5] text-[#1C1B1A]">
              {post.excerpt}
            </p>
          )}

          {opening && <PostContentRenderer html={opening} className={`mt-5 ${bodyClass}`} />}
        </div>
      </div>

      {/* ---- Cover, full content width ---- */}
      {cover && (
        <Reveal>
          <figure className="mt-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={post.title}
              className="w-full object-cover"
              style={{ aspectRatio: "16 / 9" }}
            />
          </figure>
        </Reveal>
      )}

      {/* ---- Body beside the right rail ---- */}
      <div className="mt-9 lg:grid lg:grid-cols-[minmax(0,1fr)_222px] lg:gap-x-[80px]">
        <div className="min-w-0">
          {middle && <PostContentRenderer html={middle} className={bodyClass} />}

          {/* The Blog Highlight field. Absent when the author left it blank.
              Revealed here in the left column only — the sticky right rail is
              a sibling, so its positioning context is untouched. */}
          {post.highlight && (
            <Reveal>
              <div className="my-9 border-y border-[#E3E0D9] py-8">
                <p className="text-center font-serif text-[clamp(15px,1.5vw,19px)] leading-[1.55] text-[#1C1B1A]">
                  {post.highlight}
                </p>
              </div>
            </Reveal>
          )}

          {rest && <PostContentRenderer html={rest} className={bodyClass} />}

          {/* No right rail on phones, so the unit runs in the flow instead. */}
          <div className="mt-10 lg:hidden">
            <AdSlot ad={mobileAd} width={327} height={327} />
          </div>

          {post.next && (
            <div className="mt-14 border-t border-[#E3E0D9] pt-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#8A8880]">Next</p>
              <Link
                href={`/blog/${post.next.slug}`}
                className="group mt-1 inline-flex items-center gap-2 font-serif text-[13px] text-[#1C1B1A] transition-opacity hover:opacity-60"
              >
                {post.next.title}
                <ChevronsRightIcon
                  className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 lg:mt-0">{sidebar}</div>
      </div>
    </article>
  );
}
