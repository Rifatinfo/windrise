import { serverFetch } from "@/lib/server-fetch";

export async function getCategories() {
  try {
    const res = await serverFetch.get(`/api/v1/product/category`);

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


export async function getSubCategories() {
  try {
    const res = await serverFetch.get(`/api/v1/product/sub-category`);

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