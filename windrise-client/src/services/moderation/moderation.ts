/**
 * Comment moderation.
 *
 * Admin-only, cookie-authenticated like the rest of the dashboard. Product
 * reviews and blog comments arrive as one list so they can be read and removed
 * in one place.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/moderation`;

export type CommentSource = "PRODUCT" | "BLOG";

export type ModerationComment = {
  id: string;
  source: CommentSource;
  author: {
    name: string;
    /** Phone for a reviewer, email for a blog commenter. */
    contact: string | null;
    isMember: boolean;
    avatar: string | null;
  };
  body: string;
  rating: number | null;
  images: string[];
  target: { title: string; href: string };
  isReply: boolean;
  /** Replies that would go with this one if it were deleted. */
  replyCount: number;
  createdAt: string;
};

export type Counts = { product: number; blog: number; all: number };
export type Meta = { page: number; limit: number; total: number };

export type ListFilters = {
  source?: CommentSource;
  search?: string;
  page?: number;
  limit?: number;
};

type Envelope<T> = { success: boolean; message: string; data: T; meta?: Meta };

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...init });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return body as Envelope<T>;
}

export async function listComments(filters: ListFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) query.set(key, String(value));
  }

  const res = await request<{ comments: ModerationComment[]; counts: Counts }>(
    `/comments?${query.toString()}`,
  );

  return {
    comments: res.data.comments,
    counts: res.data.counts,
    meta: res.meta ?? { page: 1, limit: 20, total: res.data.comments.length },
  };
}

export const deleteComment = (source: CommentSource, id: string) =>
  request<{ deleted: number; source: CommentSource }>(
    `/comments/${source}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

/** Uploads are served through the client's own /uploads rewrite. */
export const mediaUrl = (path: string) => path;

export const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
