"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellIcon } from "lucide-react";

import { useNotifications } from "@/contexts/NotificationsContext";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const { unreadCount, isOpen, toggleDropdown, closeDropdown } = useNotifications();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) closeDropdown();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDropdown();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeDropdown]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`relative shrink-0 rounded-full p-2 text-gray-600 transition-colors duration-150 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 ${
          isOpen ? "bg-gray-100 text-gray-900" : ""
        }`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 z-50 mt-2 w-[320px] max-w-[92vw] origin-top-right"
          >
            <NotificationDropdown />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
