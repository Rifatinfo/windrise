"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";

import { MENU_DURATION, MENU_EASE } from "@/components/modules/home/navbar/MenuToggle";
import {
  productImageSrc,
  suggestProducts,
  suggestionHref,
  type Suggestion,
} from "@/services/product/search";
import {
  addRecentSearch,
  POPULAR_TERMS,
  readRecentSearches,
  removeRecentSearch,
} from "./recentSearches";

/**
 * Six, because the suggestion grid runs 2 / 3 / 6 columns — every breakpoint
 * divides into it, so the last row is always full.
 */
const SUGGEST_LIMIT = 6;

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);

  const typing = query.trim().length > 0;

  // localStorage is read after mount, never during render: the server has no
  // way to know what this browser has stored and would hydrate a mismatch.
  // The URL is read the same way — reopening on the results page should bring
  // the current query back into the field, and reading it here rather than
  // with useSearchParams keeps the header out of a Suspense boundary.
  useEffect(() => {
    if (!isOpen) return;
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    setRecent(readRecentSearches());
    // The panel is sliding in; focusing on the next frame lets it start
    // moving before the keyboard opens on a phone.
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // The page behind must not scroll under the panel.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  /**
   * Typeahead. Debounced so a request goes out per pause rather than per
   * keystroke, and the previous one is aborted so a slow early response can't
   * land after a faster later one and show results for a stale query.
   */
  useEffect(() => {
    const term = query.trim();
    if (!isOpen || !term) {
      setResults([]);
      setTotal(0);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const id = window.setTimeout(async () => {
      try {
        const { items, total: count } = await suggestProducts(
          term,
          SUGGEST_LIMIT,
          controller.signal,
        );
        setResults(items);
        setTotal(count);
      } catch {
        // An abort means a newer query has already taken over, so leave the
        // screen to it. A real failure should not keep pretending to load.
        if (!controller.signal.aborted) {
          setResults([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [query, isOpen]);

  const submit = useCallback(
    (term: string) => {
      const value = term.trim();
      if (!value) return;
      setRecent(addRecentSearch(value));
      onClose();
      router.push(`/search?q=${encodeURIComponent(value)}`);
    },
    [onClose, router],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dims the page. Below the panel, above everything else. */}
          <motion.button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-[10000] cursor-default bg-black/55"
          />

          {/* Comes down from above the viewport and retracts the same way, on
              the drawer's curve so every panel in the header moves alike. */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: MENU_DURATION, ease: MENU_EASE }}
            className="fixed inset-x-0 top-0 z-[10001] flex h-dvh flex-col bg-[#080808] font-dm-sans text-white sm:h-auto sm:max-h-dvh"
          >
            <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col overflow-y-auto px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-8 lg:px-6">
              {/* Field + Cancel */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit(query);
                }}
                className="flex shrink-0 items-center gap-4 sm:gap-10"
              >
                <div className="relative min-w-0 flex-1">
                  <SearchIcon
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8A8A]"
                    strokeWidth={1.6}
                  />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search"
                    aria-label="Search products"
                    autoComplete="off"
                    // Safari draws its own clear button on type=search and it
                    // would sit on top of ours.
                    className="h-10 w-full rounded-full bg-[#262626] pl-10 pr-10 text-[14px] text-white outline-none placeholder:text-[#8A8A8A] focus:bg-[#2E2E2E] [&::-webkit-search-cancel-button]:appearance-none sm:h-11"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] transition-colors hover:text-white"
                    >
                      <XIcon className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 text-[13px] text-white/90 transition-opacity hover:opacity-60 sm:text-[14px]"
                >
                  Cancel
                </button>
              </form>

              {typing ? (
                <Results
                  results={results}
                  total={total}
                  searching={searching}
                  query={query}
                  onSeeAll={() => submit(query)}
                  onNavigate={() => {
                    addRecentSearch(query);
                    onClose();
                  }}
                />
              ) : (
                <Browse
                  recent={recent}
                  onPick={submit}
                  onRemoveRecent={(term) => setRecent(removeRecentSearch(term))}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** What the panel shows before anything is typed. */
function Browse({
  recent,
  onPick,
  onRemoveRecent,
}: {
  recent: string[];
  onPick: (term: string) => void;
  onRemoveRecent: (term: string) => void;
}) {
  return (
    <>
      <section className="mt-7 shrink-0 sm:mt-8">
        <h2 className="text-[11px] text-[#8A8A8A]">Popular Search Terms</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_TERMS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onPick(term)}
              className="rounded-full bg-[#1E1E1E] px-4 py-2 text-[12px] text-white/90 transition-colors hover:bg-[#2C2C2C] sm:text-[13px]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-8 sm:mt-9">
          <h2 className="text-[11px] text-[#8A8A8A]">Recent searches</h2>
          <ul className="mt-2">
            {recent.map((term) => (
              <li key={term} className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onPick(term)}
                  className="min-w-0 flex-1 truncate py-2.5 text-left text-[15px] text-white transition-opacity hover:opacity-60 sm:text-[17px]"
                >
                  {term}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${term} from recent searches`}
                  onClick={() => onRemoveRecent(term)}
                  className="shrink-0 p-1 text-[#8A8A8A] transition-colors hover:text-white"
                >
                  <XIcon className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

/** What replaces it once there is a query. */
function Results({
  results,
  total,
  searching,
  query,
  onSeeAll,
  onNavigate,
}: {
  results: Suggestion[];
  total: number;
  searching: boolean;
  query: string;
  onSeeAll: () => void;
  onNavigate: () => void;
}) {
  // Two on a phone, then three, then a single full row on a wide screen —
  // SUGGEST_LIMIT is 6 so the last row is never left with an orphan.
  const grid = "mt-3 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-6 lg:gap-x-3";

  // A heading over an empty grid reads as broken while a slow request is in
  // flight, so the first pass shows placeholder cards instead.
  if (searching && results.length === 0) {
    return (
      <section className="mt-7 sm:mt-8" aria-busy="true">
        <h2 className="text-[11px] text-[#8A8A8A]">Searching…</h2>
        <div className={grid}>
          {Array.from({ length: SUGGEST_LIMIT }, (_, cell) => (
            <div key={cell}>
              <span className="block aspect-[4/5] w-full animate-pulse rounded-md bg-[#141414]" />
              <span className="mt-2 block h-3 w-3/4 animate-pulse rounded bg-[#141414]" />
              <span className="mt-1.5 block h-3 w-2/5 animate-pulse rounded bg-[#111111]" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Nothing found is only worth saying once the request has actually settled.
  if (results.length === 0) {
    return (
      <p className="mt-8 shrink-0 text-[13px] text-[#8A8A8A]">
        No products match “{query.trim()}”.
      </p>
    );
  }

  return (
    <section className="mt-7 min-h-0 sm:mt-8">
      <h2 className="text-[11px] text-[#8A8A8A]">Products</h2>

      <ul className={grid}>
        {results.map((item) => {
          const image = productImageSrc(item.image);
          const price = item.salePrice ?? item.regularPrice;
          const struck =
            item.salePrice != null && item.salePrice !== item.regularPrice;

          return (
            <li key={item.id}>
              <Link
                href={suggestionHref(item)}
                onClick={onNavigate}
                className="group block"
              >
                {/* Same 4:5 frame the storefront cards use. The tile is the
                    panel's own black rather than a lighter placeholder, so an
                    image that hasn't arrived leaves a hole in the grid instead
                    of a row of grey boxes. */}
                <span className="block aspect-[4/5] w-full overflow-hidden rounded-md bg-[#080808]">
                  {image && (
                    // Product art comes from the API host, not /public.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                    />
                  )}
                </span>
                <span className="mt-2 block truncate text-[12px] text-white/90 lg:text-[12.5px]">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-[12px] text-white lg:text-[13px]">
                  ৳ {price.toFixed(2)}
                  {struck && (
                    <span className="ml-1.5 text-[11px] text-[#6B6B6B] line-through">
                      ৳ {item.regularPrice.toFixed(2)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {total > 0 && (
        <button
          type="button"
          onClick={onSeeAll}
          className="mt-5 w-full rounded-lg border border-white/15 py-2.5 text-[12.5px] text-white/90 transition-colors hover:bg-white/5 sm:text-[13px]"
        >
          See all {total} {total === 1 ? "result" : "results"} for “{query.trim()}”
        </button>
      )}
    </section>
  );
}
