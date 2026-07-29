"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Product } from "@/types/product";
import ProductRow from "@/components/table/ProductRow";
import ProductTableHeader from "@/components/table/ProductTableHeader";

interface ProductListProps {
  initialProducts: Product[];
  totalItems: number;
  limit: number;
}

const LOAD_LIMIT = 21;

const ProductList = ({
  initialProducts,
  totalItems,
  limit,
}: ProductListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadedCount = products.length;
  const hasMore = loadedCount < totalItems;

  const queryString = searchParams.toString();

  useEffect(() => {
    setProducts(initialProducts);
    setPage(2);
  }, [queryString, initialProducts]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(queryString);
      params.set("page", String(page));
      params.set("limit", String(LOAD_LIMIT));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/product?${params.toString()}`
      );
      const result = await res.json();

      if (result?.data?.length) {
        setProducts((prev) => [...prev, ...result.data]);
        setPage((p) => p + 1);
      }
    } catch (err) {
      console.error("Failed to load more products", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, queryString]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, loading]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <ProductTableHeader />
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => (
              <ProductRow
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-6 px-4 flex flex-col items-center gap-3 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">{loadedCount}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalItems}</span>{" "}
          products
        </p>

        {hasMore && (
          <button
            onClick={fetchMore}
            disabled={loading}
            className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More >"
            )}
          </button>
        )}

        {isPending && (
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            Updating...
          </div>
        )}

        <div ref={observerRef} className="h-1" />
      </div>
    </div>
  );
};

export default ProductList;
