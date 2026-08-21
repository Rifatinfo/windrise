"use client";

import { cn } from "@/lib/utils";

/**
 * The one toggle used across the dashboard.
 *
 * On is solid black with the white knob sitting flush right; off is a light
 * grey track with the knob left. The knob is inset by the same 2px on both
 * sides so it reads as centred at either end.
 */
export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Announced to screen readers — the visible text usually sits beside it. */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b0b0b]",
        checked ? "bg-[#0b0b0b]" : "bg-[#e2e8f0]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
    >
      {/* `left` is pinned rather than left to the static position, which a
          button's centred text alignment would otherwise put mid-track. The
          knob then travels the 20px between the two 2px insets. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
