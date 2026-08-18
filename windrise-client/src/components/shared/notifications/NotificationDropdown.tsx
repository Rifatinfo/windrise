"use client";

import { BellOffIcon, RefreshCwIcon } from "lucide-react";

import { useNotifications } from "@/contexts/NotificationsContext";
import { NotificationItem } from "./NotificationItem";

export function NotificationDropdown() {
  const { notifications, unreadCount, loading, error, markAllAsRead, retry } = useNotifications();

  return (
    <div
      role="menu"
      aria-label="Notifications"
      className="flex max-h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-pop"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Notifications</h3>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-xs font-medium text-brand transition-opacity hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
        >
          Mark all read
        </button>
      </div>

      <div className="notif-scrollbar min-h-[140px] flex-1 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <NotificationSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <p className="text-sm font-medium text-ink">Couldn&apos;t load notifications</p>
            <p className="text-xs text-ink-muted">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-1 flex items-center gap-1.5 rounded-lg bg-canvas px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-line"
            >
              <RefreshCwIcon className="h-3 w-3" aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-ink-muted">
              <BellOffIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-ink">You&apos;re all caught up</p>
            <p className="text-xs text-ink-muted">No new notifications.</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <ul>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-canvas" />
          <div className="flex-1 space-y-2 pt-0.5">
            <div className="h-2.5 w-3/4 animate-pulse rounded bg-canvas" />
            <div className="h-2 w-1/2 animate-pulse rounded bg-canvas" />
          </div>
        </li>
      ))}
    </ul>
  );
}
