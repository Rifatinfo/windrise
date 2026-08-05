"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export const PRODUCTS_PAGE_SIZE = 12;

interface LoadMoreButtonProps {
  total: number;
  shown: number;
}

const LoadMoreButton = ({ total, shown }: LoadMoreButtonProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const remaining = Math.max(0, total - shown);

  const loadMore = () => {
    const params = new URLSearchParams(searchParams.toString());
    const currentLimit = Number(params.get("limit")) || PRODUCTS_PAGE_SIZE;
    params.set("limit", String(currentLimit + PRODUCTS_PAGE_SIZE));
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="py-6">
      <div className="mt-12 flex flex-col items-center sm:mt-16">
        {remaining > 0 ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="flex flex-col items-center gap-1 disabled:opacity-50"
          >
            <span className="text-[13px] font-medium text-ink underline decoration-line underline-offset-[6px] transition-opacity hover:opacity-60">
              {isPending ? "Loading..." : "Load more"}
            </span>
            <span className="text-[11px] font-light text-muted">
              {remaining} items left
            </span>
          </button>
        ) : (
          <p className="text-[11px] font-light text-muted">
            You&rsquo;ve seen all {total} items
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadMoreButton;
