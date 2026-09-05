"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import {
  applySort,
  resolveCurrentSort,
  SortDropdown,
  SortOption,
  sortOptions,
} from "@/components/modules/FilterAndSearch/SortDropdown";

type SearchResultsHeaderProps = {
  query: string;
  total: number;
};

export function SearchResultsHeader({ query, total }: SearchResultsHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const sort = resolveCurrentSort(searchParams);

  const handleSortChange = (next: SortOption) => {
    // `applySort` keeps `q` and clears the previous sort's params, so the two
    // never stack up in the URL.
    const params = applySort(new URLSearchParams(searchParams.toString()), next);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-light text-muted lg:text-[13px]">
          Search results for
        </p>
        <h1 className="mt-1 break-words text-[18px] font-medium text-ink lg:text-[26px]">
          {query || "everything"}{" "}
          <span className="font-light text-muted">({total})</span>
        </h1>
      </div>

      {total > 0 && (
        <div className="shrink-0 pt-1">
          <SortDropdown
            value={sort}
            options={sortOptions}
            onChange={handleSortChange}
          />
        </div>
      )}
    </div>
  );
}
