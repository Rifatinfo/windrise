"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

export type SortOption =
  | "New Arrivals"
  | "Popular"
  | "Price (Low to High)"
  | "Price (High to Low)"
  | "Name (A-Z)"
  | "Name (Z-A)"
  | "Sale";

export const sortOptions: SortOption[] = [
  "New Arrivals",
  "Popular",
  "Price (Low to High)",
  "Price (High to Low)",
  "Name (A-Z)",
  "Name (Z-A)",
  "Sale",
];

export const lifestyleBanner =
  "/assets/prodduct-page-cover.png";

type SortDropdownProps = {
  value: SortOption;
  options: SortOption[];
  onChange: (value: SortOption) => void;
};

export function SortDropdown({ value, options, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative z-30 ">
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[12px] text-ink lg:text-lg cursor-pointer "
      >
        <span className="font-dm-sans">Sort By:</span>
        <span className="font-light text-muted">{value}</span>
        <ChevronDownIcon
          className={`h-3.5 w-3.5 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Sort products"
          className="absolute left-1/2 top-full z-20 mt-2 w-[190px] lg:w-[234px] -translate-x-1/2 bg-white py-2 shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
        >
          {options.map((option) => {
            const isActive = option === value;
            return (
              <li key={option} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`block w-[calc(100%-32px)] mx-4 px-4 py-[5px] rounded-sm text-center text-[12px] transition-colors lg:text-[17px] ${
                    isActive
                      ? "bg-ink font-normal text-white"
                      : "font-light text-ink hover:bg-neutral-100"
                  }`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
