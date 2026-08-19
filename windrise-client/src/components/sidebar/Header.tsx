'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LogOutIcon, MenuIcon, UserIcon, UserRoundIcon } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { getUserAvatar, getRoleLabel } from '@/utiles/user-utils';
import { NotificationBell } from '@/components/shared/notifications/NotificationBell';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { logout } from '@/services/auth/logoutUser';

export function Header() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const avatar = user ? getUserAvatar(user) : '';

  return (
    <header className="flex min-h-[68px] items-center border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <button
        type="button"
        className="mr-3 rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="ml-auto flex min-w-0 items-center justify-end gap-3 sm:gap-4">
        <NotificationBell />

        {!loading && user && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              aria-label="Account menu"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 cursor-pointer"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={user.name}
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white ring-2 ring-gray-100">
                  {user.name?.trim()?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                </span>
              )}
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={10} className="w-60 p-0">
              {/* Identity */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatar}
                    alt={user.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {user.name?.trim()?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{getRoleLabel(user.role)}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="p-1.5">
                <Link
                  href="/my-profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <UserRoundIcon className="h-4 w-4 shrink-0 text-slate-500" />
                  Edit Profile
                </Link>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <LogOutIcon className="h-4 w-4 shrink-0" />
                  Log Out
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </header>
  );
}
