"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, LogOutIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import { NavItem } from "./nav-config";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 py-2 text-xs font-medium text-slate-400">
      <span>{label}</span>
      <ChevronRightIcon className="h-3 w-3" />
    </div>
  );
}

export function NavBottom({
  items,
  title,
  user,
  onLogout,
}: {
  items: NavItem[];
  title: string;
  user: { name: string; email: string; avatar: string; role: string };
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const roleLabel = user.role === "ADMIN" ? "Admin" : user.role === "SHOP_MANAGER" ? "Shop Manager" : user.role === "MEDIA_MANAGER" ? "Media Manager" : "User";
  return (
    <section className="shrink-0 px-[18px] pb-4 pt-3" aria-label={`${title} navigation`}>
      {items?.length > 0 && (
        <>
          <SectionLabel label={title} />
          <div className="space-y-1">
            {items?.map((item) => {
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
          </div>
        </>
      )}

      {/* Inline profile + logout row */}
      <div className="mt-3">
        <div className="flex items-center gap-3 rounded-lg py-2">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
              <UserIcon className="h-5 w-5 text-gray-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Log out"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
