import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";

/**
 * Products for the "You might also like" row.
 *
 * The API ranks these itself — same sub-category first, then same category,
 * then newest — and filters out the product being viewed along with anything
 * hidden or deleted, so nothing needs sifting here.
 *
 * Best-effort by design: the row is a suggestion, so a failure returns an empty
 * list and the section hides rather than taking the product page down with it.
 */
export async function getRelatedProducts(
  productId: string,
  limit?: number,
): Promise<Product[]> {
  try {
    const query = limit ? `?limit=${limit}` : "";
    const res = await serverFetch.get(
      `/api/v1/product/related-products/${encodeURIComponent(productId)}${query}`,
    );

    const result = await res.json();
    if (!result?.success || !Array.isArray(result.data)) return [];

    return result.data as Product[];
  } catch (error) {
    console.error("[getRelatedProducts]", error);
    return [];
  }
}
