"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { NavItem } from "./nav-config";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 py-2 text-xs font-medium text-slate-400">
      <span>{label}</span>
      <ChevronRightIcon className="h-3 w-3" />
    </div>
  );
}

function NavLink({
  item,
  isActive,
  count,
}: {
  item: NavItem;
  isActive: boolean;
  count?: number;
}) {
  return (
    <Link
      href={item.path || "#"}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-black text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-black"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{item.label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "ml-auto shrink-0 text-xs tabular-nums",
            isActive ? "text-white/70" : "text-slate-400"
          )}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function NavCollapsible({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const children = item.children ?? [];
  const hasActiveChild = children.some((child) => child.path === pathname);

  // null = follow the route; true/false = the user has toggled it by hand.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);

  // Adjusting state during render (a supported React pattern) so that landing
  // on a child route — e.g. via the sidebar search — expands its parent group
  // even though this component is already mounted and collapsed.
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setManualOpen(null);
  }

  const open = manualOpen ?? hasActiveChild;

  return (
    <div>
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-black"
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span className="truncate">{item.label}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1.5 pt-1.5 pb-1.5">
            {children.map((child) => {
              const isChildActive = child.path === pathname;
              return (
                <Link
                  key={child.id}
                  href={child.path || "#"}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-3 pl-10 text-sm font-medium transition-colors",
                    isChildActive
                      ? "bg-black text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-black"
                  )}
                >
                  <child.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavMain({
  items,
  title,
  counts,
}: {
  items: NavItem[];
  title?: string;
  /** Live badge numbers, keyed by each item's `countKey`. */
  counts?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();
  if (!items.length) return null;

  return (
    <div className="px-4">
      {title && <SectionLabel label={title} />}
      <nav className="space-y-1">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            return <NavCollapsible key={item.id} item={item} pathname={pathname} />;
          }
          const isActive = item.path ? pathname === item.path : false;
          return (
            <NavLink
              key={item.id}
              item={item}
              isActive={isActive}
              count={item.countKey ? counts?.[item.countKey] : undefined}
            />
          );
        })}
      </nav>
    </div>
  );
}
