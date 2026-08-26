import type {
  Ad,
  AdPlacementSlot,
  AdStats,
  BlogAuthorOption,
  BlogCategory,
  BlogPost,
  BlogStats,
  BlogTag,
  SeoSuggestion,
} from "@/types/blog";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  meta?: { page: number; limit: number; total: number };
  data: T;
};

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

const json = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const query = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "ALL") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
};

// ---------------------------------- Posts ----------------------------------

export type PostListParams = {
  searchTerm?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
};

export const getPosts = (params: PostListParams = {}) =>
  request<BlogPost[]>(`/blog/posts${query(params)}`);

export const getPostStats = () => request<BlogStats>("/blog/posts/stats");

export const getPost = (id: string) => request<BlogPost>(`/blog/posts/${id}`);

export const createPost = (payload: Record<string, unknown>) =>
  request<BlogPost>("/blog/posts", { method: "POST", ...json(payload) });

export const updatePost = (id: string, payload: Record<string, unknown>) =>
  request<BlogPost>(`/blog/posts/${id}`, { method: "PATCH", ...json(payload) });

export const deletePost = (id: string) =>
  request<{ id: string }>(`/blog/posts/${id}`, { method: "DELETE" });

export const duplicatePost = (id: string) =>
  request<BlogPost>(`/blog/posts/${id}/duplicate`, { method: "POST" });

export const bulkUpdateStatus = (ids: string[], status: string) =>
  request<{ count: number }>("/blog/posts/bulk/status", {
    method: "PATCH",
    ...json({ ids, status }),
  });

export const bulkDeletePosts = (ids: string[]) =>
  request<{ count: number }>("/blog/posts/bulk/delete", {
    method: "POST",
    ...json({ ids }),
  });

// -------------------------------- Taxonomy ---------------------------------

export const getCategories = () => request<BlogCategory[]>("/blog/categories");

export const createCategory = (payload: { name: string; slug?: string }) =>
  request<BlogCategory>("/blog/categories", { method: "POST", ...json(payload) });

export const updateCategory = (id: string, payload: { name?: string; slug?: string }) =>
  request<BlogCategory>(`/blog/categories/${id}`, { method: "PATCH", ...json(payload) });

export const deleteCategory = (id: string) =>
  request<{ id: string }>(`/blog/categories/${id}`, { method: "DELETE" });

export const getTags = () => request<BlogTag[]>("/blog/tags");

export const createTag = (name: string) =>
  request<BlogTag>("/blog/tags", { method: "POST", ...json({ name }) });

export const deleteTag = (id: string) =>
  request<{ id: string }>(`/blog/tags/${id}`, { method: "DELETE" });

export const getAuthors = () => request<BlogAuthorOption[]>("/blog/authors");

// ------------------------------- SEO & media -------------------------------

export const suggestSeo = (payload: {
  title: string;
  excerpt?: string | null;
  content?: string | null;
  categoryName?: string | null;
}) => request<SeoSuggestion>("/blog/seo-suggest", { method: "POST", ...json(payload) });

/** Shared by the featured-image picker and the ad creative picker. */
async function uploadTo(path: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Upload failed");
  }
  return (await res.json()) as ApiResponse<{ url: string }>;
}

export const uploadBlogImage = (file: File) => uploadTo("/blog/upload", file);

export type UploadedMedia = {
  url: string;
  name: string;
  mimeType: string;
  size: number;
};

/**
 * Upload for anything the post editor embeds — images, video, audio and
 * document attachments. Images are optimized server-side; everything else is
 * stored byte-for-byte.
 */
export async function uploadBlogMedia(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/v1/blog/upload-media`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Upload failed");
  }
  return (await res.json()) as ApiResponse<UploadedMedia>;
}

/**
 * Uploads come back as `/uploads/...`. next.config rewrites that path to the
 * API server, so leaving it relative keeps the request same-origin — pointing
 * it straight at the API instead trips helmet's Cross-Origin-Resource-Policy
 * and the image never loads.
 */
export const mediaUrl = (path?: string | null) => path || null;

// ----------------------------------- Ads -----------------------------------

export type AdListParams = {
  searchTerm?: string;
  status?: string;
  type?: string;
  placementId?: string;
};

export const getAds = (params: AdListParams = {}) => request<Ad[]>(`/ads${query(params)}`);

export const getAdStats = () => request<AdStats>("/ads/stats");

export const getAd = (id: string) => request<Ad>(`/ads/${id}`);

export const createAd = (payload: Record<string, unknown>) =>
  request<Ad>("/ads", { method: "POST", ...json(payload) });

export const updateAd = (id: string, payload: Record<string, unknown>) =>
  request<Ad>(`/ads/${id}`, { method: "PATCH", ...json(payload) });

export const deleteAd = (id: string) =>
  request<{ id: string }>(`/ads/${id}`, { method: "DELETE" });

export const bulkDeleteAds = (ids: string[]) =>
  request<{ count: number }>("/ads/bulk/delete", { method: "POST", ...json({ ids }) });

export const bulkUpdateAdStatus = (ids: string[], status: string) =>
  request<{ count: number }>("/ads/bulk/status", { method: "PATCH", ...json({ ids, status }) });

export const uploadAdCreative = (file: File) => uploadTo("/ads/upload", file);

// -------------------------------- Placements -------------------------------

export const getPlacements = () => request<AdPlacementSlot[]>("/ads/placements");

export const createPlacement = (payload: {
  name: string;
  description?: string | null;
  width?: number | null;
  height?: number | null;
  isNative?: boolean;
}) => request<AdPlacementSlot>("/ads/placements", { method: "POST", ...json(payload) });

export const deletePlacement = (id: string) =>
  request<{ id: string }>(`/ads/placements/${id}`, { method: "DELETE" });
