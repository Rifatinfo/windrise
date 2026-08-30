"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

/**
 * The dial-code picker in front of the phone input.
 *
 * Flags are images rather than the regional-indicator emoji: Windows has no
 * flag glyphs, so 🇧🇩 renders there as the letters "BD" — which is exactly what
 * this field was showing before.
 */

export type Country = { iso: string; name: string; dial: string };

/** Bangladesh first; the rest are where Windrise customers tend to be. */
export const COUNTRIES: Country[] = [
  { iso: "bd", name: "Bangladesh", dial: "+880" },
  { iso: "in", name: "India", dial: "+91" },
  { iso: "pk", name: "Pakistan", dial: "+92" },
  { iso: "np", name: "Nepal", dial: "+977" },
  { iso: "lk", name: "Sri Lanka", dial: "+94" },
  { iso: "my", name: "Malaysia", dial: "+60" },
  { iso: "sg", name: "Singapore", dial: "+65" },
  { iso: "ae", name: "United Arab Emirates", dial: "+971" },
  { iso: "sa", name: "Saudi Arabia", dial: "+966" },
  { iso: "qa", name: "Qatar", dial: "+974" },
  { iso: "kw", name: "Kuwait", dial: "+965" },
  { iso: "om", name: "Oman", dial: "+968" },
  { iso: "gb", name: "United Kingdom", dial: "+44" },
  { iso: "us", name: "United States", dial: "+1" },
  { iso: "ca", name: "Canada", dial: "+1" },
  { iso: "au", name: "Australia", dial: "+61" },
  { iso: "it", name: "Italy", dial: "+39" },
  { iso: "de", name: "Germany", dial: "+49" },
  { iso: "fr", name: "France", dial: "+33" },
  { iso: "jp", name: "Japan", dial: "+81" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

function Flag({ iso, name }: { iso: string; name: string }) {
  const [failed, setFailed] = useState(false);

  // Deliberately not next/image: an external host would need adding to
  // next.config's remotePatterns, and this is a 20px decorative asset.
  if (failed) {
    return (
      <span className="text-[10px] font-semibold uppercase text-[#6E6A82]">{iso}</span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      alt={name}
      width={20}
      height={14}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-[14px] w-[20px] shrink-0 rounded-[2px] object-cover"
    />
  );
}

export function CountryPhoneSelect({
  value,
  onChange,
}: {
  value: Country;
  onChange: (country: Country) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        // The field sits inside a <label>, so a plain click would be forwarded
        // to the phone input and steal focus back from the list.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((current) => !current)}
        aria-label="Select country dialling code"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#4A4660]"
      >
        <Flag iso={value.iso} name={value.name} />
        {value.dial}
        <ChevronDownIcon
          className={`h-3 w-3 text-[#9B98AC] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+8px)] z-20 max-h-[190px] w-[210px] overflow-y-auto rounded-lg border border-[#EAE8F2] bg-white py-1 shadow-[0_10px_28px_rgba(27,24,48,0.14)]"
        >
          {COUNTRIES.map((country) => (
            <li key={`${country.iso}-${country.dial}`}>
              <button
                type="button"
                role="option"
                aria-selected={country.iso === value.iso}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(country);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F7F5FF] ${
                  country.iso === value.iso ? "bg-[#F7F5FF]" : ""
                }`}
              >
                <Flag iso={country.iso} name={country.name} />
                <span className="min-w-0 flex-1 truncate text-[#1B1830]">
                  {country.name}
                </span>
                <span className="shrink-0 text-[#9B98AC]">{country.dial}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
