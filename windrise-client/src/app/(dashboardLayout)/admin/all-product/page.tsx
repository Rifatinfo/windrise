import { Plus } from "lucide-react";
import { getProducts } from "@/services/product/getProducts";
import Link from "next/link";

import ProductFilters from "@/components/modules/FilterAndSearch/ProductFilters";
import ProductList from "@/components/shared/pagination/ProductList";

const LOAD_LIMIT = 21;

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParamsObj = await searchParams;

  const filterParams = new URLSearchParams();
  Object.entries(searchParamsObj).forEach(([key, value]) => {
    if (key === "page") return;
    if (Array.isArray(value)) {
      value.forEach((v) => filterParams.append(key, v));
    } else if (value !== undefined) {
      filterParams.set(key, value);
    }
  });

  filterParams.set("page", "1");
  filterParams.set("limit", String(LOAD_LIMIT));

  const queryString = filterParams.toString();
  const productsResult = await getProducts(queryString);

  const products = productsResult?.data ?? [];
  const totalItems = productsResult?.meta?.total ?? 0;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                {totalItems} items
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Manage your product inventory and pricing
            </p>
          </div>
          <Link href="/dashboard/addProduct">
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-orange-500/20 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </Link>
        </div>

        {/* Filters & Search */}
        <ProductFilters />

        <ProductList
          initialProducts={products}
          totalItems={totalItems}
          limit={LOAD_LIMIT}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
