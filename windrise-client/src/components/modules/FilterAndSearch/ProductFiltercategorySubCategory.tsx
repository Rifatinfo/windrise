"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SortDropdown, SortOption, sortOptions } from "./SortDropdown";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ProductFiltercategorySubCategoryProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  shown: number;
};

const SORT_TO_PARAMS: Record<SortOption, Record<string, string>> = {
  "New Arrivals": { sortBy: "createdAt", sortOrder: "desc" },
  Popular: { sortBy: "createdAt", sortOrder: "desc" },
  "Price (Low to High)": { sortBy: "salePrice", sortOrder: "asc" },
  "Price (High to Low)": { sortBy: "salePrice", sortOrder: "desc" },
  "Name (A-Z)": { sortBy: "name", sortOrder: "asc" },
  "Name (Z-A)": { sortBy: "name", sortOrder: "desc" },
  Sale: { sale: "true" },
};

const resolveCurrentSort = (searchParams: URLSearchParams): SortOption => {
  if (searchParams.get("sale") === "true") return "Sale";
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const match = sortOptions.find((option) => {
    const mapped = SORT_TO_PARAMS[option];
    return mapped.sortBy === sortBy && (mapped.sortOrder || "desc") === sortOrder;
  });
  return match || "New Arrivals";
};

const ProductFiltercategorySubCategory = ({
  breadcrumbs,
  title,
  shown,
}: ProductFiltercategorySubCategoryProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = resolveCurrentSort(searchParams);

  const handleSortChange = (next: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("limit");
    params.delete("sortBy");
    params.delete("sortOrder");
    params.delete("sale");

    Object.entries(SORT_TO_PARAMS[next]).forEach(([key, value]) => {
      params.set(key, value);
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div>
      {/* Utility row: breadcrumb / sort / count */}
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:items-center lg:gap-0 md:mt-16">
        <nav aria-label="Breadcrumb" className="lg:justify-self-start  z-30">
          <ol className="flex flex-wrap items-center gap-1 text-[12px] lg:text-lg font-medium font-dm-sans sm:text-[13px] text-[#9E9E9E]">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                  {isLast || !crumb.href ? (
                    <span aria-current={isLast ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-ink"
                      >
                        {crumb.label}
                      </Link>
                      <span aria-hidden="true" className="text-line">
                        /
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="lg:justify-self-center">
          <SortDropdown
            value={sort}
            options={sortOptions}
            onChange={handleSortChange}
          />
        </div>

        <p className="hidden text-[12px] font-light lg:text-lg lg:block lg:justify-self-end">
          Showing <span className="font-normal ">{shown}</span> Items
        </p>
      </div>

      {/* Title row */}
      <div className="mt-5 flex items-baseline justify-between gap-4 sm:mt-6">
        <h1 className="text-[15px] font-medium text-ink lg:text-lg">
          {title}
        </h1>
        <p className="text-[12px] font-light text-muted sm:text-[13px] lg:hidden">
          Showing <span className="font-normal text-ink">{shown}</span> Items
        </p>
      </div>
    </div>
  );
};

export default ProductFiltercategorySubCategory;
