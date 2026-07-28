
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";



export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await serverFetch.get(
      `/api/v1/product/slug/${encodeURIComponent(slug)}`
    );


    const result = await res.json();


    if (!result.success || !result.data) {
      return null;
    }


    return result.data;
  } catch (error) {
    console.error("[getProductBySlug]", error);
    return null;
  }
}