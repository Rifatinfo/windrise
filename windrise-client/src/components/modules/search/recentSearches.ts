/**
 * The overlay's two lists.
 *
 * Recent searches live in this browser only — they are a convenience for the
 * person typing, not something the shop needs to know — so they sit in
 * localStorage and every read is guarded: private windows and blocked site
 * data throw on access rather than returning empty.
 */

const KEY = "windrise.recent-searches";
const MAX = 6;

/**
 * Popular terms are editorial, not measured. Nothing tracks search volume
 * yet, so this is a curated row rather than a fabricated ranking — edit it
 * here.
 */
export const POPULAR_TERMS = [
  "casual shirts",
  "pants",
  "backpack",
  "wrist watch",
  "baggy pant",
  "sunglass",
] as const;

export function readRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

const write = (terms: string[]) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(terms.slice(0, MAX)));
  } catch {
    // Storage is unavailable; the list simply doesn't persist.
  }
};

/** Most recent first, no duplicates regardless of casing. */
export function addRecentSearch(term: string): string[] {
  const value = term.trim();
  if (!value) return readRecentSearches();

  const next = [
    value,
    ...readRecentSearches().filter(
      (item) => item.toLowerCase() !== value.toLowerCase(),
    ),
  ].slice(0, MAX);

  write(next);
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const next = readRecentSearches().filter((item) => item !== term);
  write(next);
  return next;
}
