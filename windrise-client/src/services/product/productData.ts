
//================= Category Service =================//

export const fetchProductsByCategory = async (
    category: string,
    searchParams: Promise<{
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        color?: string;
        priceRange?: string;
        stockStatus?: string;
    }>
) => {
    const sp = await searchParams;

    const query = new URLSearchParams({
        category,
        ...(sp.page        && { page: sp.page }),
        ...(sp.limit       && { limit: sp.limit }),
        ...(sp.sortBy      && { sortBy: sp.sortBy }),
        ...(sp.sortOrder   && { sortOrder: sp.sortOrder }),
        ...(sp.color       && { color: sp.color }),           // ✅ added
        ...(sp.priceRange  && { priceRange: sp.priceRange }), // ✅ added
        ...(sp.stockStatus && { stockStatus: sp.stockStatus }),// ✅ added
    }).toString();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product?${query}`,
        { cache: "no-store" }
    );
    return res.json();
};
//================= Sub-Category Service =================//

export const fetchProductsBySubCategory = async (
    subCategory: string,
    searchParams: Promise<{
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: string;
        color?: string;
        priceRange?: string;
        stockStatus?: string;
    }>
) => {
    const sp = await searchParams;

    const query = new URLSearchParams({
        subCategory,
        ...(sp.page && { page: sp.page }),
        ...(sp.limit && { limit: sp.limit }),
        ...(sp.sortBy && { sortBy: sp.sortBy }),
        ...(sp.sortOrder && { sortOrder: sp.sortOrder }),

        // additional filters
        ...(sp.color && { color: sp.color }),
        ...(sp.priceRange && { priceRange: sp.priceRange }),
        ...(sp.stockStatus && { stockStatus: sp.stockStatus }),
    }).toString();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product?${query}`,
        {
            cache: "no-store",
        }
    );

    return res.json();
};