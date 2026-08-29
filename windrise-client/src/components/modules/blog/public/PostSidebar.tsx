import Link from "next/link";

import type { ActiveAd } from "@/services/ads/public";
import { mediaUrl } from "@/services/blog/blog";
import type { PublicPost } from "@/services/blog/public";
import { AdSlot } from "./AdSlot";
import { longDate } from "./PostCard";

function PopularPosts({ posts }: { posts: PublicPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-[13px] font-semibold text-[#1C1B1A]">Popular Posts</h2>

      <ul className="mt-3 space-y-3.5">
        {posts.map((post) => {
          const image = mediaUrl(post.featuredImage);

          return (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group flex gap-3">
                <div className="h-[108px] w-[108px] shrink-0 overflow-hidden bg-[#E7E5E0]">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover rounded-sm  transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-dm-sans text-[12px]  leading-[1.35] text-[#1C1B1A] transition-opacity group-hover:opacity-70">
                    {post.title}
                  </p>
                  {post.publishedAt && (
                    <p className="mt-1 text-[9px] text-[#9A978F] ">{longDate(post.publishedAt)}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * The right rail. It is sticky on desktop so the ads stay in view down a long
 * post, and stacks under the article on tablet and phone where there is no
 * room beside it.
 */
export function PostSidebar({
  popular,
  towerAd,
  squareAd,
}: {
  popular: PublicPost[];
  towerAd: ActiveAd | null;
  squareAd: ActiveAd | null;
}) {
  return (
    // Fills its grid column; sticky so the rail stays with the reader down a
    // long post. It begins level with the body, below the cover image.
    <aside className="w-full lg:sticky lg:top-24">
      <div className="space-y-6">
        <PopularPosts posts={popular} />

        {/* Kept off phones: the mobile layout carries its own in-article unit. */}
        <div className="hidden lg:block">
          <AdSlot ad={towerAd} width={300} height={600} />
        </div>

        <div className="hidden lg:block">
          <AdSlot ad={squareAd} width={300} height={300} />
        </div>
      </div>
    </aside>
  );
}
