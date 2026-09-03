/**
 * Blog comments.
 *
 * Reading is public. Writing requires an account: the session cookie travels
 * with the request and the commenter's name comes from it, never from the form.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/blog/public/posts`;

export type BlogComment = {
  id: string;
  name: string;
  avatar: string | null;
  /** Left by a signed-in reader. */
  isMember: boolean;
  body: string;
  createdAt: string;
  parentId: string | null;
};

export type CommentThread = BlogComment & { replies: BlogComment[] };

export type CommentPage = {
  comments: CommentThread[];
  /** Every comment including replies — what the heading counts. */
  totalComments: number;
  meta: { page: number; limit: number; total: number };
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
};

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include", ...init });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return body as Envelope<T>;
}

export async function getComments(
  slug: string,
  page = 1,
  limit = 3,
): Promise<CommentPage> {
  const res = await request<{ comments: CommentThread[]; totalComments: number }>(
    `/${encodeURIComponent(slug)}/comments?page=${page}&limit=${limit}`,
  );

  return {
    comments: res.data.comments,
    totalComments: res.data.totalComments,
    meta: res.meta ?? { page, limit, total: res.data.comments.length },
  };
}

/** Requires a signed-in reader; the cookie carries the session. */
export const postComment = (
  slug: string,
  payload: { body: string; parentId?: string | null },
) =>
  request<BlogComment>(`/${encodeURIComponent(slug)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.data);

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const plural = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? "" : "s"} ago`;

/**
 * "2 days ago", as the design prints it.
 *
 * Written as an explicit ladder rather than a divide-and-rename loop: the loop
 * version names the unit it just divided *by*, which lands one step behind and
 * turns two days into "2 hours ago".
 */
export function timeAgo(value: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);

  if (seconds < 30) return "just now";
  if (seconds < HOUR) return plural(Math.floor(seconds / MINUTE), "minute");
  if (seconds < DAY) return plural(Math.floor(seconds / HOUR), "hour");
  if (seconds < WEEK) return plural(Math.floor(seconds / DAY), "day");
  if (seconds < MONTH) return plural(Math.floor(seconds / WEEK), "week");
  if (seconds < YEAR) return plural(Math.floor(seconds / MONTH), "month");
  return plural(Math.floor(seconds / YEAR), "year");
}
