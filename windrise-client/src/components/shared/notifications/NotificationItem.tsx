"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangleIcon,
  CircleMinusIcon,
  CreditCardIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  TriangleAlertIcon,
  TrendingUpIcon,
} from "lucide-react";

import { useNotifications } from "@/contexts/NotificationsContext";
import type { Notification } from "@/types/notification";
import { formatRelativeTime } from "@/utils/format";

interface NotificationVisual {
  icon: LucideIcon;
  container: string;
  iconClass: string;
  /** Only set for the "out of stock" solid stop-shape treatment — fills the icon glyph itself. */
  fill?: string;
}

// Resolved from `type` + a title keyword, since a couple of source alerts share one `type`
// (e.g. "Out of stock" and "Low stock alert" are both `stock`) but need visually distinct icons.
function resolveNotificationVisual(notification: Notification): NotificationVisual {
  const title = notification.title.toLowerCase();

  if (notification.type === "stock") {
    if (title.includes("out of stock")) {
      return {
        icon: CircleMinusIcon,
        container: "bg-red-50",
        iconClass: "text-white",
        fill: "#e5484d",
      };
    }
    return { icon: TriangleAlertIcon, container: "bg-amber-50", iconClass: "text-amber-600" };
  }

  if (notification.type === "order") {
    if (title.includes("payment")) {
      return { icon: CreditCardIcon, container: "bg-sky-50", iconClass: "text-sky-600" };
    }
    return { icon: ShoppingCartIcon, container: "bg-indigo-50", iconClass: "text-indigo-600" };
  }

  if (notification.type === "shipment") {
    return { icon: PackageIcon, container: "bg-emerald-50", iconClass: "text-[#a3703f]" };
  }

  if (notification.type === "product") {
    return { icon: TagIcon, container: "bg-violet-50", iconClass: "text-violet-600" };
  }

  if (notification.type === "analytics") {
    return { icon: TrendingUpIcon, container: "bg-cyan-50", iconClass: "text-cyan-600" };
  }

  return { icon: AlertTriangleIcon, container: "bg-rose-50", iconClass: "text-rose-600" };
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const { handleNotificationClick } = useNotifications();
  const visual = resolveNotificationVisual(notification);

  return (
    <li className="border-b border-line/60 last:border-0">
      <Link
        href={notification.link}
        onClick={() => handleNotificationClick(notification)}
        role="menuitem"
        className={`flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-canvas focus:outline-none focus-visible:bg-canvas focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40 ${
          notification.isRead ? "" : "bg-brand-soft/25"
        }`}
      >
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${visual.container}`}>
          <visual.icon
            className={`h-4 w-4 ${visual.iconClass}`}
            aria-hidden="true"
            {...(visual.fill ? { fill: visual.fill } : {})}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[13px] leading-snug ${
              notification.isRead ? "font-medium text-ink-soft" : "font-semibold text-ink"
            }`}
          >
            {notification.title}
          </p>
          {notification.message && (
            <p className={`mt-0.5 truncate text-xs ${notification.isRead ? "text-ink-muted" : "text-ink-soft"}`}>
              {notification.message}
            </p>
          )}
          <p className="mt-1 text-[11px] text-ink-muted">{formatRelativeTime(notification.timestamp)}</p>
        </div>
        {!notification.isRead && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        )}
      </Link>
    </li>
  );
}
