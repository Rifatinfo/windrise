/**
 * Product reviews.
 *
 * Public endpoints — a reviewer is usually a guest. Eligibility is decided by
 * the server against the order book, so nothing here is trusted to gate.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/product-review`;

export type Review = {
  id: string;
  /** Already masked server-side when the customer typed a phone or email. */
  name: string;
  rating: number;
  body: string;
  images: string[];
  createdAt: string;
};

export type ReviewSummary = {
  /** Null when nothing has been reviewed yet — not zero, which reads as bad. */
  average: number | null;
  total: number;
  distribution: { stars: number; count: number; percent: number }[];
};

export type Eligibility = {
  eligible: boolean;
  alreadyReviewed: boolean;
  orderNo: string | null;
  existingReview: { rating: number; body: string; images: string[] } | null;
  reason: string | null;
};

export type ReviewPage = {
  summary: ReviewSummary;
  reviews: Review[];
  meta: { page: number; limit: number; total: number };
};

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
};

async function request<T>(path: string, init?: RequestInit): Promise<Envelope<T>> {
  const res = await fetch(`${BASE}${path}`, init);
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return body as Envelope<T>;
}

const json = (payload: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

export async function getReviews(
  productId: string,
  page = 1,
  limit = 3,
): Promise<ReviewPage> {
  const res = await request<{ summary: ReviewSummary; reviews: Review[] }>(
    `/product/${encodeURIComponent(productId)}?page=${page}&limit=${limit}`,
  );

  return {
    summary: res.data.summary,
    reviews: res.data.reviews,
    meta: res.meta ?? { page, limit, total: res.data.reviews.length },
  };
}

export const checkEligibility = (productId: string, phone: string) =>
  request<Eligibility>("/eligibility", json({ productId, phone })).then((r) => r.data);

export const submitReview = (payload: {
  productId: string;
  name: string;
  phone: string;
  rating: number;
  body: string;
  images?: string[];
}) => request<Review>("", json(payload)).then((r) => r.data);

export async function uploadReviewImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(body.message ?? "Couldn't upload that image.");
  return body.data.url as string;
}

/**
 * Uploads are served through the client's own `/uploads` rewrite, so the stored
 * relative path is used as given — an absolute URL to the API host trips the
 * server's cross-origin resource policy.
 */
export const reviewImageUrl = (path: string) => path;

export const reviewDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
