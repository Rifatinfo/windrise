"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getNotifications } from "@/services/notifications/notifications";
import type { Notification } from "@/types/notification";

const READ_IDS_STORAGE_KEY = "windrise-read-notifications";
const MAX_STORED_READ_IDS = 300;

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify([...ids].slice(-MAX_STORED_READ_IDS)));
  } catch {
    // Storage may be unavailable (private mode) — read state just won't persist across reloads.
  }
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  handleNotificationClick: (notification: Notification) => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  retry: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Omit<Notification, "isRead">[] | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Loaded client-side only (after mount) so SSR and the first client render agree — avoids a
  // hydration mismatch between an empty server-side Set and whatever's actually in localStorage.
  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getNotifications();
      setRaw(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const notifications = useMemo<Notification[]>(
    () => (raw ?? []).map((n) => ({ ...n, isRead: readIds.has(n.id) })),
    [raw, readIds],
  );

  const unreadCount = useMemo(() => notifications.reduce((sum, n) => sum + (n.isRead ? 0 : 1), 0), [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of raw ?? []) next.add(n.id);
      saveReadIds(next);
      return next;
    });
  }, [raw]);

  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const toggleDropdown = useCallback(() => setIsOpen((v) => !v), []);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      markAsRead(notification.id);
      closeDropdown();
    },
    [markAsRead, closeDropdown],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      error,
      isOpen,
      markAsRead,
      markAllAsRead,
      handleNotificationClick,
      toggleDropdown,
      closeDropdown,
      retry: fetchNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      error,
      isOpen,
      markAsRead,
      markAllAsRead,
      handleNotificationClick,
      toggleDropdown,
      closeDropdown,
      fetchNotifications,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
