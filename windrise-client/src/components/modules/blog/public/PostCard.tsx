import Link from "next/link";
import { CalendarIcon, SquarePenIcon } from "lucide-react";

import { mediaUrl } from "@/services/blog/blog";
import type { PublicPost } from "@/services/blog/public";

/** "August 20, 2026" — the format used throughout the Stories pages. */
export const longDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

/**
 * The chips above a card title: the category first, then its tags, each in an
 * outlined pill. Capped at three so a heavily tagged post cannot wrap onto a
 * second row and push its title out of line with the rest of the grid.
 */
function Taxonomy({ post }: { post: PublicPost }) {
  const labels = [
    ...(post.category ? [post.category.name] : []),
    ...post.tags.map((tag) => tag.name),
  ].slice(0, 3);

  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-xl border border-[#E0DED8] px-2.5 py-[6px] font-semibold text-[10px] md:text-[14px] leading-[12px] text-[#969696]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/** One side of the footer: a small glyph and its label. */
function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-[10px] md:text-[14px] leading-none text-[#898A85]">
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

export function PostCard({ post }: { post: PublicPost }) {
  const image = mediaUrl(post.featuredImage);

  return (
    // `h-full` so the footer's `mt-auto` still aligns across a row now that
    // the reveal wrapper, not the article, is the grid item.
    <article className="group flex h-full flex-col">
      <Link href={`/blog/${post.slug}`} className="block overflow-hidden bg-[#E7E5E0]">
        {/* The ad slot in the grid mirrors this ratio so rows stay level. */}
        <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.12em] text-[#A8A59D]">
              Windrise
            </div>
          )}
        </div>
      </Link>

      <div className="mt-[22px] flex flex-1 flex-col">
        <Taxonomy post={post} />

        <h2 className="mt-2 font-serif text-[17px] md:text-xl leading-[1.2] text-[#1C1B1A]">
          <Link href={`/blog/${post.slug}`} className="transition-opacity hover:opacity-70">
            {post.title}
          </Link>
        </h2>

        {/* Author and date sit on one baseline with a hairline strung between
            them, so the rule stretches to whatever the two labels leave. The
            footer is pushed to the bottom, keeping it level across a row of
            cards whose titles run to different lengths. */}
        <div className="mt-auto flex items-center gap-3 pt-4">
          <Meta icon={SquarePenIcon}>{post.author.name}</Meta>

          <span className="h-px min-w-4 flex-1 bg-[#E0DED8]" aria-hidden="true" />

          {post.publishedAt && (
            <Meta icon={CalendarIcon}>{longDate(post.publishedAt)}</Meta>
          )}
        </div>
      </div>
    </article>
  );
}
