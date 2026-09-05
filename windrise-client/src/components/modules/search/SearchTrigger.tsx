"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import {
  HeaderIconButton,
  type HeaderIconTone,
} from "@/components/modules/home/navbar/HeaderIconButton";

type SearchTriggerProps = {
  tone: HeaderIconTone;
  onOpen: () => void;
};

/**
 * The header's search control.
 *
 * On the results page it also carries the active query, so what is being
 * looked at stays visible in the header after the panel has closed. Tapping
 * it reopens the panel with that term; the × drops the search.
 *
 * Reads `useSearchParams`, so every use of it belongs inside a Suspense
 * boundary — otherwise it forces the whole header to client-render.
 */
export function SearchTrigger({ tone, onOpen }: SearchTriggerProps) {
  const router = useRouter();
  const query = useSearchParams().get("q")?.trim() ?? "";

  return (
    <div className="flex items-center">
      {query && (
        <span
          className={`mr-1 flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[11px] transition-colors sm:text-[12px] ${
            tone === "white"
              ? "bg-white/12 text-white"
              : "bg-black/[0.06] text-black"
          }`}
        >
          <button
            type="button"
            aria-label={`Clear search for ${query}`}
            onClick={() => router.push("/")}
            className="transition-opacity hover:opacity-60"
          >
            <XIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onOpen}
            className="max-w-[120px] truncate transition-opacity hover:opacity-60 sm:max-w-[180px]"
          >
            {query}
          </button>
        </span>
      )}

      <HeaderIconButton name="search" tone={tone} onClick={onOpen} />
    </div>
  );
}
