"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { NavItem } from "./nav-config";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 py-2 text-xs font-medium text-slate-400">
      <span>{label}</span>
      <ChevronRightIcon className="h-3 w-3" />
    </div>
  );
}

export function NavMain({ items, title }: { items: NavItem[]; title?: string }) {
  const pathname = usePathname();
  if (!items.length) return null;

  return (
    <div className="px-4">
      {title && <SectionLabel label={title} />}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = item.path ? pathname === item.path : false;
          return (
            <Link
              key={item.id}
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
            </Link>
          );
        })}
      </nav>
    </div>
  );
}