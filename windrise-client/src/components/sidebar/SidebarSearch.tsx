"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/role";
import { buildNavSearchIndex, searchNav } from "@/utiles/navSearch";

/** Editable elements the "/" shortcut must not steal focus from. */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

export function SidebarSearch({ role }: { role: UserRole }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Built once per role — the list is local and small, so no debouncing.
  const index = useMemo(() => buildNavSearchIndex(role), [role]);
  const results = useMemo(() => searchNav(index, query), [index, query]);

  const showDropdown = open && query.trim().length > 0;

  // Close when clicking outside the whole search component.
  useEffect(() => {
    if (!showDropdown) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showDropdown]);

  // "/" focuses the sidebar search from anywhere in the dashboard.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.blur();
    router.push(path);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!showDropdown || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[Math.min(activeIndex, results.length - 1)];
      if (target) go(target.path);
    }
  };

  return (
    <div ref={rootRef} className="relative px-4 mt-4">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="sidebar-search-results"
          aria-autocomplete="list"
          aria-label="Search pages"
          value={query}
          placeholder="Search..."
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-300 focus:bg-white"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-400"
        >
          /
        </kbd>
      </div>

      {showDropdown && (
        <div
          id="sidebar-search-results"
          role="listbox"
          className="absolute left-4 right-4 z-40 mt-1.5 max-h-72 origin-top overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-md duration-150 animate-in fade-in-0 zoom-in-95"
        >
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <p className="text-sm font-medium text-slate-700">No results found</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Try searching for another page
              </p>
            </div>
          ) : (
            results.map((entry, i) => {
              const Icon = entry.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={entry.path}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(entry.path)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                    isActive ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700">
                      {entry.label}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {entry.context}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
