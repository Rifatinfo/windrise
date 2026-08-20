"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontalIcon,
  PencilIcon,
  PowerIcon,
  Trash2Icon,
  UserCheckIcon,
} from "lucide-react";
import type { Admin, AdminStatus } from "@/types/admin";
import { ADMIN_STATUS_META } from "@/types/admin";
import { AdminAvatar } from "./AdminAvatar";

/** Row action menu geometry — used to anchor and flip the portalled menu. */
const MENU_WIDTH = 176; // matches the old w-44
const MENU_MAX_HEIGHT = 148; // Edit + Deactivate + Delete, plus padding

function formatDateOnly(input: string | Date): string {
  if (!input) return "-";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface AdminsTableProps {
  /** Role label used in the column header and empty state, e.g. "Shop Manager". */
  roleLabel?: string;
  /** Plural label used in the empty state, e.g. "shop managers". */
  rolePlural?: string;
  admins: Admin[];
  currentUserId?: string;
  serialOf?: (admin: Admin) => number;
  onEdit: (admin: Admin) => void;
  onToggleStatus: (admin: Admin, status: AdminStatus) => void;
  onDelete: (admin: Admin) => void;
}

function RowMenu({
  admin,
  currentUserId,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  admin: Admin;
  currentUserId?: string;
  onEdit: () => void;
  onToggleStatus: (status: AdminStatus) => void;
  onDelete: () => void;
}) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const open = menuPos !== null;
  const isSelf = admin.id === currentUserId;

  useEffect(() => {
    if (!open) return;
    const close = () => setMenuPos(null);
    document.addEventListener("click", close);
    // The menu is fixed-positioned, so it must close rather than drift when
    // the page or the table's own horizontal scroller moves.
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const inactive = admin.status === "INACTIVE";

  /**
   * Anchors the menu to the trigger in viewport coordinates. It renders in a
   * portal on <body>, so the table's `overflow-x-auto` wrapper — which also
   * clips vertically — can no longer cut the menu off.
   */
  const toggleMenu = () => {
    if (open) {
      setMenuPos(null);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const GAP = 6;
    const flipUp = rect.bottom + GAP + MENU_MAX_HEIGHT > window.innerHeight;

    setMenuPos({
      top: flipUp ? rect.top - GAP - MENU_MAX_HEIGHT : rect.bottom + GAP,
      // right-aligned to the trigger, kept inside the viewport
      left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
    });
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${admin.name ?? "admin"}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          toggleMenu();
        }}
        className="cursor-pointer rounded-lg border border-line p-1.5 text-ink-muted transition-colors duration-150 hover:border-slate-300 hover:text-ink"
      >
        <MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {menuPos && createPortal(
        <div
          role="menu"
          onClick={(event) => event.stopPropagation()}
          style={{ top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
          className="fixed z-50 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-pop"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuPos(null);
              onEdit();
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-ink transition-colors duration-150 hover:bg-slate-50"
          >
            <PencilIcon className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            Edit
          </button>

          {!isSelf && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuPos(null);
                onToggleStatus(inactive ? "ACTIVE" : "INACTIVE");
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-ink transition-colors duration-150 hover:bg-slate-50"
            >
              {inactive ? (
                <UserCheckIcon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <PowerIcon className="h-4 w-4 text-amber-600" aria-hidden="true" />
              )}
              {inactive ? "Activate" : "Deactivate"}
            </button>
          )}

          {!isSelf && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuPos(null);
                onDelete();
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-rose-600 transition-colors duration-150 hover:bg-rose-50"
            >
              <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          )}

          {isSelf && (
            <p className="px-3 py-2 text-xs text-ink-muted">
              You cannot deactivate or delete your own account.
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export function AdminsTable({
  admins,
  roleLabel = "Admin",
  rolePlural = "admins",
  currentUserId,
  serialOf,
  onEdit,
  onToggleStatus,
  onDelete,
}: AdminsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-line bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
              <th scope="col" className="px-5 py-3">
                Serial
              </th>
              <th scope="col" className="px-3 py-3">
                {roleLabel}
              </th>
              <th scope="col" className="px-3 py-3">
                Status
              </th>
              <th scope="col" className="px-3 py-3">
                Created
              </th>
              <th scope="col" className="px-3 py-3">
                Updated
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const status = ADMIN_STATUS_META[admin.status];
              const isSelf = admin.id === currentUserId;

              return (
                <tr
                  key={admin.id}
                  className="border-b border-line align-middle transition-colors duration-150 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 text-sm tabular-nums text-ink-soft">
                    {serialOf ? serialOf(admin) : admins.indexOf(admin) + 1}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <AdminAvatar admin={admin} size="md" />
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                          {admin.name?.trim() || "Unnamed Admin"}
                          {isSelf && (
                            <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                              You
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-ink-soft">
                          {admin.email?.trim() || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-ink-muted">
                    {formatDateOnly(admin.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-sm tabular-nums text-ink-muted">
                    {formatDateOnly(admin.updatedAt)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      <RowMenu
                        admin={admin}
                        currentUserId={currentUserId}
                        onEdit={() => onEdit(admin)}
                        onToggleStatus={(status) => onToggleStatus(admin, status)}
                        onDelete={() => onDelete(admin)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {admins.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
          <UserCheckIcon className="h-6 w-6 text-ink-soft" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">No {rolePlural} found</p>
          <p className="text-xs text-ink-muted">
            Click “Add {roleLabel}” in the top right to create one.
          </p>
        </div>
      )}
    </section>
  );
}
