/* eslint-disable @typescript-eslint/no-explicit-any */

import ProductFiltercategorySubCategory from "@/components/modules/FilterAndSearch/ProductFiltercategorySubCategory";
import { ComingSoon } from "@/components/shared/product-notFound/ComingSoon";
import LoadMoreButton, {
  PRODUCTS_PAGE_SIZE,
} from "@/components/shared/pagination/LoadMoreButton";
import ProductCard from "@/components/shared/ProductCard/ProductCard";
import { getCategories } from "@/services/product/getCategories";
import { fetchProductsByCategory } from "@/services/product/productData";
import { Suspense } from "react";

export interface PageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    color?: string;
    priceRange?: string;
    stockStatus?: string;
    sale?: string;
  }>;
}

const CategoryPage = async ({ params, searchParams }: PageProps) => {
  const { category } = await params;
  const sp = await searchParams;

  const categoryName = decodeURIComponent(category);

  const categoryRes = await getCategories();
  const categories = categoryRes?.data || [];

  const matchedCategory = categories.find(
    (c: any) => c.name.toLowerCase() === categoryName.toLowerCase(),
  );

  if (!matchedCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div>
          <ComingSoon />
        </div>
      </div>
    );
  }

  const response = await fetchProductsByCategory(matchedCategory.id, {
    ...sp,
    limit: sp.limit ?? String(PRODUCTS_PAGE_SIZE),
  });

  const products = response?.data ?? [];
  const total = response?.meta?.total ?? 0;

  return (
    // <div className="mt-16">
    //   <div className="space-y-6 px-4 sm:px-6 lg:px-8">
    //     <ProductFiltercategorySubCategory
    //       breadcrumbs={[
    //         { label: "Home", href: "/" },
    //         { label: matchedCategory.name },
    //       ]}
    //       title={matchedCategory.name}
    //       shown={products.length}
    //     />

    //     {products.length === 0 ? (
    //       <div>
    //         <div>
    //           <ComingSoon />
    //         </div>
    //       </div>
    //     ) : (
    //       <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-4 lg:gap-y-10">
    //         {products.map((product: any) => (
    //           <ProductCard
    //             key={product.id}
    //             product={product}
    //             category={categoryName}
    //           />
    //         ))}
    //       </div>
    //     )}
    //   </div>

    //   <div className="px-4 sm:px-6 lg:px-8">
    //     <Suspense fallback={null}>
    //       <LoadMoreButton total={total} shown={products.length} />
    //     </Suspense>
    //   </div>
    // </div>
    <div>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {products.length > 0 && (
          <ProductFiltercategorySubCategory
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: matchedCategory.name },
            ]}
            title={matchedCategory.name}
            shown={products.length}
          />
        )}

        {products.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-4 lg:gap-y-10">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryName}
              />
            ))}
          </div>
        )}
      </div>

      {/* No padding wrapper here — full bleed */}
      {products.length === 0 && (
        <div className="w-full min-h-screen">
          <ComingSoon />
        </div>
      )}

      {products.length > 0 && (
        <div className="px-4 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <LoadMoreButton total={total} shown={products.length} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
