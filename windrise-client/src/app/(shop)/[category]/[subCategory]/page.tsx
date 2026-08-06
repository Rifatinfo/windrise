/* eslint-disable @typescript-eslint/no-explicit-any */

import ProductFiltercategorySubCategory from "@/components/modules/FilterAndSearch/ProductFiltercategorySubCategory";
import { lifestyleBanner } from "@/components/modules/FilterAndSearch/SortDropdown";
import LoadMoreButton, {
  PRODUCTS_PAGE_SIZE,
} from "@/components/shared/pagination/LoadMoreButton";
import { ComingSoon } from "@/components/shared/product-notFound/ComingSoon";
import ProductCard from "@/components/shared/ProductCard/ProductCard";
import {
  getCategories,
  getSubCategories,
} from "@/services/product/getCategories";
import { fetchProductsBySubCategory } from "@/services/product/productData";
import { Suspense } from "react";

export interface PageProps {
  params: Promise<{
    category: string;
    subCategory: string;
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

const SubCategoryPage = async ({ params, searchParams }: PageProps) => {
  const { category, subCategory } = await params;
  const sp = await searchParams;

  const categoryName = decodeURIComponent(category);
  const subCategoryName = decodeURIComponent(subCategory);

  const [categoryRes, subCategoryRes] = await Promise.all([
    getCategories(),
    getSubCategories(),
  ]);

  const categories = categoryRes?.data || [];
  const subCategories = subCategoryRes?.data || [];

  const matchedCategory = categories.find(
    (c: any) => c.name.toLowerCase() === categoryName.toLowerCase(),
  );

  const matchedSubCategories = subCategories.filter(
    (sc: any) => sc.name.toLowerCase() === subCategoryName.toLowerCase(),
  );

  const matchedSubCategory =
    matchedSubCategories.find(
      (sc: any) => matchedCategory && sc.parentId === matchedCategory.id,
    ) || matchedSubCategories[0];

  if (!matchedSubCategory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div>
          <ComingSoon />
        </div>
      </div>
    );
  }

  const response = await fetchProductsBySubCategory(matchedSubCategory.id, {
    ...sp,
    limit: sp.limit ?? String(PRODUCTS_PAGE_SIZE),
  });

  const products = response?.data ?? [];
  const total = response?.meta?.total ?? 0;

  return (
    <div>
      {/* <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <ProductFiltercategorySubCategory
          breadcrumbs={[
            { label: "Home", href: "/" },
            {
              label: matchedCategory?.name || categoryName,
              href: matchedCategory ? `/${categoryName}` : undefined,
            },
            { label: matchedSubCategory.name },
          ]}
          title={matchedSubCategory.name}
          shown={products.length}
        />

        {products.length === 0 ? (
          <div>
            <div>
              <ComingSoon />
            </div>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-4 lg:gap-y-10">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryName}
                subCategory={subCategoryName}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <LoadMoreButton total={total} shown={products.length} />
        </Suspense>
      </div> */}
       <div>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {products.length > 0 && (
          <ProductFiltercategorySubCategory
            breadcrumbs={[
              { label: "Home", href: "/" },
               {
                 label: matchedCategory?.name || categoryName,
                 href: matchedCategory ? `/${encodeURIComponent(categoryName)}` : undefined,
               },
               { label: matchedSubCategory.name },
             ]}
             title={matchedSubCategory.name}
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
                subCategory={subCategoryName}
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
      <img
        src={lifestyleBanner}
        alt="Three models in relaxed tailoring beside a vintage car on a hillside road"
        loading="lazy"
        className="mt-12 h-[190px] w-full object-cover sm:mt-16 sm:h-[280px] lg:h-auto"
      />
    </div>
  );
};

export default SubCategoryPage;
