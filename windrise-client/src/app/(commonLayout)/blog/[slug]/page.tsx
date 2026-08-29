import type { Metadata } from "next";
import { notFound } from "next/navigation";


import { PostArticle } from "@/components/modules/blog/public/PostArticle";
import { PostSidebar } from "@/components/modules/blog/public/PostSidebar";
import { getActiveAds } from "@/services/ads/public";
import { getPublicPost, getPublicPosts } from "@/services/blog/public";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);

  if (!post) return { title: "Story not found" };

  const description = post.metaDescription ?? post.excerpt ?? undefined;

  return {
    title: post.metaTitle ?? post.title,
    description,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    keywords: post.keywords.length > 0 ? post.keywords : undefined,
    openGraph: {
      type: "article",
      title: post.metaTitle ?? post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await getPublicPost(slug);
  // A draft, a private post or a bad slug all land on the 404 page rather than
  // leaking the difference between "not published" and "does not exist".
  if (!post) notFound();

  const [popular, towerAds, squareAds, mobileAds] = await Promise.all([
    getPublicPosts({ limit: 4, sort: "popular", excludeSlug: slug }),
    getActiveAds("sidebar-tower"),
    getActiveAds("sidebar-square"),
    getActiveAds("mobile-sticky"),
  ]);

  
  return (
    <main className="bg-[#F8F9F4] pt-20">
       
      <div className="mx-auto w-full max-w-[1188px] px-5 pt-6 md:px-8 md:pt-10">
       {/* <Breadcrumb
          trail={[
            { label: "Home", href: "/" },
            { label: "Stories", href: "/blog" },
            // { label: post.title },
          ]}
        /> */}
      </div>

      <div className="mx-auto w-full max-w-[1188px] px-5 py-10 md:px-8 md:py-10">
        <PostArticle
          post={post}
          mobileAd={mobileAds[0] ?? null}
          // Passed in rather than placed here: the rail belongs inside the
          // article, level with the body that follows the cover image.
          sidebar={
            <PostSidebar
              popular={popular.data}
              towerAd={towerAds[0] ?? null}
              squareAd={squareAds[0] ?? null}
            />
          }
        />
      </div>

      <div className="mx-auto w-full max-w-[1188px] px-5 md:px-8">
        <hr className="border-[#E3E0D9]" />
      </div>
    </main>
  );
}
