/**
 * Storefront product search.
 *
 * Two shapes on purpose: `suggestProducts` is the typeahead behind the header
 * overlay and returns only what a suggestion row draws, while `searchProducts`
 * returns full products for the results grid.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const BASE = `${API_URL}/api/v1/product`;

export type Suggestion = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  regularPrice: number;
  salePrice: number | null;
  category: string | null;
  subCategory: string | null;
};

export type SearchSort = {
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
};

/** Product URLs are /{category}/{subCategory}/{slug}. */
export const suggestionHref = (item: {
  slug: string;
  category: string | null;
  subCategory: string | null;
}) => {
  if (!item.category) return "#";
  const middle = item.subCategory
    ? encodeURIComponent(item.subCategory)
    : "product";
  return `/${encodeURIComponent(item.category)}/${middle}/${encodeURIComponent(item.slug)}`;
};

/**
 * Uploads are requested through the client's own `/uploads` rewrite, not from
 * the API host directly: the API sends `Cross-Origin-Resource-Policy:
 * same-origin`, so an absolute URL to it is blocked by the browser and the
 * image silently renders blank.
 */
export const productImageSrc = (url: string | null) => url || null;

export async function suggestProducts(
  query: string,
  limit = 6,
  signal?: AbortSignal,
): Promise<{ items: Suggestion[]; total: number }> {
  const trimmed = query.trim();
  if (!trimmed) return { items: [], total: 0 };

  const res = await fetch(
    `${BASE}/search/suggest?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
    { signal, cache: "no-store" },
  );
  if (!res.ok) return { items: [], total: 0 };

  const body = await res.json();
  return { items: body.data ?? [], total: body.meta?.total ?? 0 };
}

/** Server-side: the /search page's own fetch. */
export async function searchProducts(query: string, params: SearchSort = {}) {
  const trimmed = query.trim();
  if (!trimmed) return { data: [], meta: { page: 1, limit: 0, total: 0 } };

  const search = new URLSearchParams({ q: trimmed });
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  const res = await fetch(`${BASE}/search?${search.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) return { data: [], meta: { page: 1, limit: 0, total: 0 } };

  const body = await res.json();
  return {
    data: body.data ?? [],
    meta: body.meta ?? { page: 1, limit: 0, total: 0 },
  };
}
