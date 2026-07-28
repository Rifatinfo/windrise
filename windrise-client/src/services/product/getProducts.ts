import { serverFetch } from "@/lib/server-fetch";

export async function getProducts(queryString?: string) {
  try {
    const res = await serverFetch.get(`/api/v1/product${queryString ? `?${queryString}` : ""}`);

    const result = await res.json();
    return result;
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message || "Something went wrong",
    };
  }
}