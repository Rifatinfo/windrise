'use client';
import { BellIcon, MenuIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getUserAvatar } from '@/utiles/user-utils';

export function Header() {
    const { user, loading } = useAuth();
    const avatar = user ? getUserAvatar(user) : "";

    return (
    <header className="flex min-h-[68px] items-center border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <button type="button" className="mr-3 rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 lg:hidden" aria-label="Open menu">
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="ml-auto flex min-w-0 items-center justify-end gap-3 sm:gap-4">
        <button type="button" className="relative shrink-0 rounded-full p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        {!loading && user && (
          <div className="flex items-center gap-2">
            {avatar ? (
              <img src={avatar} alt={user.name} className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-gray-100" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 ring-2 ring-gray-100">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>
            )}
            {/* <span className="hidden text-sm font-medium text-gray-700 sm:inline">{user.name}</span> */}
          </div>
        )}
      </div>
    </header>
  );
}
