"use client";
import { useState } from "react";
import type { Admin } from "@/types/admin";
import { adminAvatarTone, adminInitials } from "@/types/admin";

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

interface AdminAvatarProps {
  admin: Admin;
  size?: keyof typeof SIZES;
  className?: string;
}

export function AdminAvatar({ admin, size = "md", className = "" }: AdminAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : resolveAvatarUrl(admin.avatar);
  const displayName = admin.name?.trim() || "Admin";

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
      className={`${SIZES[size].box} flex shrink-0 items-center justify-center rounded-full font-semibold ${adminAvatarTone(admin)} ${className}`}
    >
      {adminInitials(admin)}
    </span>
  );
}
