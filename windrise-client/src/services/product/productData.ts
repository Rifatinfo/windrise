export type ProductQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  color?: string;
  priceRange?: string;
  stockStatus?: string;
  sale?: string;
};

const buildQuery = (
  base: Record<string, string>,
  params: ProductQueryParams,
) =>
  new URLSearchParams({
    ...base,
    ...(params.page && { page: params.page }),
    ...(params.limit && { limit: params.limit }),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
    ...(params.color && { color: params.color }),
    ...(params.priceRange && { priceRange: params.priceRange }),
    ...(params.stockStatus && { stockStatus: params.stockStatus }),
    ...(params.sale && { sale: params.sale }),
  }).toString();

const fetchProducts = async (query: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product?${query}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    return { success: false, meta: null, data: [] };
  }

  return res.json();
};

//================= Category Service =================//

export const fetchProductsByCategory = async (
  categoryId: string,
  params: ProductQueryParams = {},
) => fetchProducts(buildQuery({ category: categoryId }, params));

//================= Sub-Category Service =================//

export const fetchProductsBySubCategory = async (
  subCategoryId: string,
  params: ProductQueryParams = {},
) => fetchProducts(buildQuery({ subCategory: subCategoryId }, params));
