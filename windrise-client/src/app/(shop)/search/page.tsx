/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense } from "react";
import type { Metadata } from "next";

import { SearchResultsHeader } from "@/components/modules/search/SearchResultsHeader";
import LoadMoreButton, {
  PRODUCTS_PAGE_SIZE,
} from "@/components/shared/pagination/LoadMoreButton";
import { RevealGroup, RevealItem } from "@/components/shared/motion/Reveal";
import ProductCard from "@/components/shared/ProductCard/ProductCard";
import { searchProducts } from "@/services/product/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = (await searchParams).q?.trim();
  return { title: query ? `Search: ${query} — Windrise` : "Search — Windrise" };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  const { data: products, meta } = await searchProducts(query, {
    page: sp.page,
    limit: sp.limit ?? String(PRODUCTS_PAGE_SIZE),
    sortBy: sp.sortBy,
    sortOrder: sp.sortOrder,
  });

  const total = meta?.total ?? 0;

  return (
    <div className="min-h-[70vh] px-6 pb-16 pt-20 md:px-20 md:pt-26 lg:px-20">
      <Suspense fallback={null}>
        <SearchResultsHeader query={query} total={total} />
      </Suspense>

      {products.length > 0 ? (
        <>
          <RevealGroup className="mt-6 grid grid-cols-2 gap-x-3 gap-y-7 sm:mt-7 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 lg:gap-4 lg:gap-y-10">
            {products.map((product: any) => (
              <RevealItem key={product.id} className="h-full">
                {/* No category is passed: a search crosses departments, so the
                    card builds its link from the product's own filing. */}
                <ProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Suspense fallback={null}>
            <LoadMoreButton total={total} shown={products.length} />
          </Suspense>
        </>
      ) : (
        <Empty query={query} />
      )}
    </div>
  );
};

function Empty({ query }: { query: string }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <p className="text-[15px] text-ink lg:text-lg">
        {query ? (
          <>
            No results for{" "}
            <span className="font-medium">&ldquo;{query}&rdquo;</span>
          </>
        ) : (
          "Search for a product"
        )}
      </p>
      <p className="mt-2 text-[13px] font-light text-muted lg:text-[15px]">
        {query
          ? "Check the spelling, or try a shorter or more general term."
          : "Use the search in the header to look through the store."}
      </p>
    </div>
  );
}

export default SearchPage;
