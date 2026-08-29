import type { Metadata } from "next";

import { StoriesGrid } from "@/components/modules/blog/public/StoriesGrid";
import { StoriesHero } from "@/components/modules/blog/public/StoriesHero";
import { getActiveAds } from "@/services/ads/public";
import { getPublicPosts } from "@/services/blog/public";

export const metadata: Metadata = {
  title: "The Windrise Stories",
  description:
    "Discover stories, perspectives, and inspiration from the world of fashion, culture, and contemporary life.",
};

/** Two full three-up rows plus the ad slot and one more row. */
const PAGE_SIZE = 12;

export default async function StoriesPage() {
  const [posts, gridAds] = await Promise.all([
    getPublicPosts({ page: 1, limit: PAGE_SIZE }),
    getActiveAds("blog-grid-card"),
  ]);

  return (
    // No top padding: the hero is full-bleed and runs under the fixed header,
    // which is transparent until the page is scrolled. It carries the
    // breadcrumb itself.
    <main className="bg-[#F8F9F4]">
      <StoriesHero />

      <section className="mx-auto w-full max-w-[1188px] px-5 py-12 md:px-8 md:py-16">
        <StoriesGrid
          initialPosts={posts.data}
          total={posts.meta.total}
          pageSize={PAGE_SIZE}
          ad={gridAds[0] ?? null}
        />
      </section>

      <div className="mx-auto w-full max-w-[1188px] px-5 md:px-8">
        <hr className="border-[#E3E0D9]" />
      </div>
    </main>
  );
}
