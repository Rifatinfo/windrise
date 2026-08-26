"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FieldSelectOption = {
  value: string;
  label: string;
};

/**
 * A single-line wrapper over the shadcn Select for the many places that just
 * need "a list of options with a current value". Anything needing groups,
 * icons or custom item markup should use the Select primitives directly.
 */
export function FieldSelect({
  value,
  onValueChange,
  options,
  label,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: FieldSelectOption[];
  /** Announced to screen readers, since the trigger is a button not a <select>. */
  label: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(String(next ?? ""))}
      disabled={disabled}
      // Base UI needs the item list up front so the trigger can show the
      // current value's label before the popup has ever been opened.
      items={options}
    >
      <SelectTrigger
        aria-label={label}
        className={cn(
          "h-10 w-full justify-between rounded-lg border-slate-200 bg-white px-3 text-[13px] text-slate-900",
          triggerClassName,
          className
        )}
      >
        <SelectValue placeholder={placeholder ?? label} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
