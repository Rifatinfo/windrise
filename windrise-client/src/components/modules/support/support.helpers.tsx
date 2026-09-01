"use client";

import Image from "next/image";
import { LayoutGridIcon, MailIcon, MessageSquareIcon } from "lucide-react";
import { FaFacebookMessenger, FaInstagram, FaWhatsapp } from "react-icons/fa";

import type {
  ConversationStatus,
  Presence,
  Priority,
  SupportChannel,
} from "@/services/support/support";

/**
 * How each channel presents itself: the brand mark, its colour, and the name
 * agents actually use. Kept in one place so the sidebar, the list rows and the
 * conversation header can never drift apart.
 */
export const CHANNEL_META: Record<
  SupportChannel,
  { label: string; tint: string; ring: string; Icon: (props: { className?: string }) => React.ReactNode }
> = {
  WINDEE: {
    label: "Windee (Website)",
    tint: "bg-[#efeaff] text-[#6d4ee6]",
    ring: "bg-[#6d4ee6]",
    Icon: ({ className }) => (
      <Image
        src="/assets/Windee-Chatbot.png"
        alt=""
        width={16}
        height={16}
        className={className ?? "h-3.5 w-3.5 object-contain"}
      />
    ),
  },
  MESSENGER: {
    label: "Messenger",
    tint: "bg-[#e6f0ff] text-[#0084ff]",
    ring: "bg-[#0084ff]",
    Icon: ({ className }) => <FaFacebookMessenger className={className ?? "h-3.5 w-3.5"} />,
  },
  WHATSAPP: {
    label: "WhatsApp",
    tint: "bg-[#e6f7ed] text-[#25d366]",
    ring: "bg-[#25d366]",
    Icon: ({ className }) => <FaWhatsapp className={className ?? "h-3.5 w-3.5"} />,
  },
  INSTAGRAM: {
    label: "Instagram",
    tint: "bg-[#fdeaf3] text-[#e1306c]",
    ring: "bg-[#e1306c]",
    Icon: ({ className }) => <FaInstagram className={className ?? "h-3.5 w-3.5"} />,
  },
  EMAIL: {
    label: "Email",
    tint: "bg-[#fdeaea] text-[#e5484d]",
    ring: "bg-[#e5484d]",
    Icon: ({ className }) => <MailIcon className={className ?? "h-3.5 w-3.5"} />,
  },
  COMMENTS: {
    label: "Comments",
    tint: "bg-[#eef0f4] text-[#7b8194]",
    ring: "bg-[#7b8194]",
    Icon: ({ className }) => <MessageSquareIcon className={className ?? "h-3.5 w-3.5"} />,
  },
};

export const ALL_CHANNELS_META = {
  label: "All Channels",
  Icon: ({ className }: { className?: string }) => (
    <LayoutGridIcon className={className ?? "h-3.5 w-3.5"} />
  ),
};

export const STATUS_BADGE: Record<ConversationStatus, { label: string; className: string }> = {
  IN_QUEUE: { label: "In Queue", className: "bg-[#f0ecff] text-[#6d4ee6]" },
  WITH_AGENT: { label: "With Agent", className: "bg-[#e7f7ee] text-[#1a9f5b]" },
  CLOSED: { label: "Closed", className: "bg-[#eef0f4] text-[#7b8194]" },
};

export const PRIORITY_BADGE: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-[#eef0f4] text-[#7b8194]" },
  MEDIUM: { label: "Medium", className: "bg-[#fff4e0] text-[#b7791f]" },
  HIGH: { label: "High", className: "bg-[#ffedec] text-[#d0342c]" },
  URGENT: { label: "Urgent", className: "bg-[#fde8e8] text-[#b21f1f]" },
};

export const PRESENCE_META: Record<Presence, { label: string; dot: string }> = {
  AVAILABLE: { label: "Available", dot: "bg-[#22c55e]" },
  BUSY: { label: "Busy", dot: "bg-[#f59e0b]" },
  AWAY: { label: "Away", dot: "bg-[#f59e0b]" },
  OFFLINE: { label: "Offline", dot: "bg-[#9aa1b1]" },
};

/** Order status as shown on the Recent Orders card. */
export const ORDER_STATUS_TONE = (status: string) =>
  status === "DELIVERED"
    ? "text-[#1a9f5b]"
    : status === "CANCELED" || status === "FAILED" || status === "EXPIRED"
      ? "text-[#d0342c]"
      : "text-[#b7791f]";

export const prettyEnum = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const clock = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const longDateTime = (value: string) =>
  `${new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} ${clock(value)}`;

export const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** "2m 18s", the format the response-time card uses. */
export const duration = (seconds: number | null) => {
  if (seconds === null) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
};

export const tk = (value: number) => `৳${Math.round(value).toLocaleString("en-US")}`;

/** Initials for the avatar fallback, e.g. "Rizwan Ahmed" → "RA". */
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

/**
 * A stable colour per person, so the same customer keeps the same avatar tint
 * across sessions instead of flickering on every render.
 */
const AVATAR_TINTS = [
  "bg-[#e9e3ff] text-[#5b3fd6]",
  "bg-[#dff1ff] text-[#1a6fb0]",
  "bg-[#ffe8ec] text-[#c23a5b]",
  "bg-[#e3f6ea] text-[#1a8a4f]",
  "bg-[#fff0dc] text-[#b1741a]",
  "bg-[#eae7f8] text-[#5c4fa3]",
];

export const avatarTint = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
};

export function Avatar({
  name,
  src,
  size = 36,
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const dimension = { width: size, height: size };

  if (src) {
    return (
      // Contacts come from Meta's CDN and from our own /uploads; next/image
      // would need every one of those hosts declared up front.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={dimension}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={dimension}
      className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarTint(name)} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
