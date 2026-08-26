/**
 * Storefront reads for the Stories pages.
 *
 * Separate from `blog.ts` on purpose: nothing here needs credentials, so these
 * calls run on the server during render and are cached, while the dashboard
 * module stays cookie-bound.
 */

import type { BlogPost } from "@/types/blog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type PublicPost = BlogPost;

/** A post's detail response carries the link shown at the foot of the page. */
export type PublicPostDetail = PublicPost & {
  next: { title: string; slug: string } | null;
};

export type PostsPage = {
  meta: { page: number; limit: number; total: number };
  data: PublicPost[];
};

/** `meta` sits beside `data`, not inside it — see the server's sendResponse. */
type ApiResponse<T> = {
  success: boolean;
  message: string;
  meta?: { page: number; limit: number; total: number } | null;
  data: T;
};

/**
 * Storefront content changes when an editor publishes, not per request, so a
 * short revalidate keeps the pages fast without going stale for long.
 */
const REVALIDATE_SECONDS = 60;

async function read<T>(path: string): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    // A storefront page must still render if the API is unreachable.
    return null;
  }
}

export async function getPublicPosts(params: {
  page?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  sort?: "recent" | "popular";
  excludeSlug?: string;
} = {}): Promise<PostsPage> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });

  const body = await read<PublicPost[]>(`/blog/public/posts?${query.toString()}`);
  const data = body?.data ?? [];

  return {
    // The server omits meta on an error response, so fall back to what came
    // back rather than reporting a total the grid would page against forever.
    meta: body?.meta ?? { page: 1, limit: data.length, total: data.length },
    data,
  };
}

export async function getPublicPost(slug: string): Promise<PublicPostDetail | null> {
  const body = await read<PublicPostDetail>(`/blog/public/posts/${encodeURIComponent(slug)}`);
  return body?.data ?? null;
}
