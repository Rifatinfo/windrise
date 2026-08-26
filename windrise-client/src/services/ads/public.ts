/**
 * Storefront ad delivery. The dashboard's ad CRUD lives in
 * `services/blog/blog.ts`; this module only serves what a reader should see.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type ActiveAd = {
  id: string;
  name: string;
  type: "INTERNAL" | "SPONSORED";
  sponsorName: string | null;
  placement: {
    id: string;
    key: string;
    name: string;
    width: number | null;
    height: number | null;
    isNative: boolean;
  } | null;
  imageUrl: string | null;
  htmlSnippet: string | null;
  targetUrl: string | null;
  openInNewTab: boolean;
  frequencyCap: number | null;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };

/** Ads rotate on the editor's schedule, so they are cached briefly too. */
export async function getActiveAds(placementKey: string): Promise<ActiveAd[]> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/ads/active?placementKey=${encodeURIComponent(placementKey)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const body: ApiResponse<ActiveAd[]> = await res.json();
    return body.data ?? [];
  } catch {
    // An empty rail is a far better failure than a broken page.
    return [];
  }
}

/**
 * Impression and click counting. Both are deliberately fire-and-forget:
 * `keepalive` lets a click beacon survive the navigation it triggered, and a
 * failure must never interfere with the reader.
 */
const beacon = (path: string) => {
  try {
    void fetch(`${API_URL}/api/v1${path}`, {
      method: "POST",
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
};

export const trackImpression = (adId: string) => beacon(`/ads/${adId}/impression`);
export const trackClick = (adId: string) => beacon(`/ads/${adId}/click`);
