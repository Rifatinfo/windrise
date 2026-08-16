"use client";
import { useState } from "react";
import type { Customer } from "@/types/customer";
import { customerAvatarTone, customerInitials } from "@/types/customer";

function resolveAvatarUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  return `${process.env.NEXT_PUBLIC_API_URL ?? ""}${trimmed}`;
}

const SIZES = {
  sm: { box: "h-9 w-9 text-xs", img: "h-9 w-9" },
  md: { box: "h-10 w-10 text-sm", img: "h-10 w-10" },
  lg: { box: "h-16 w-16 text-lg", img: "h-16 w-16" },
} as const;

interface CustomerAvatarProps {
  customer: Customer;
  size?: keyof typeof SIZES;
  className?: string;
}

export function CustomerAvatar({
  customer,
  size = "md",
  className = "",
}: CustomerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : resolveAvatarUrl(customer.avatar);
  const displayName = customer.name?.trim() || "Customer";

  if (src) {
    return (
      <img
        src={src}
        alt={`${displayName} avatar`}
        onError={() => setFailed(true)}
        className={`${SIZES[size].img} shrink-0 rounded-full border border-line object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`${SIZES[size].box} flex shrink-0 items-center justify-center rounded-full font-semibold ${customerAvatarTone(customer)} ${className}`}
    >
      {customerInitials(customer)}
    </span>
  );
}
