"use client";

import { NAV_MAIN, NAV_SECONDARY, NAV_ROLE, NAV_CONTENT } from "./nav-config";
import { NavMain } from "./NavMain";
import { SidebarSearch } from "./SidebarSearch";

import { UserRole } from "@/lib/auth-utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { filterNavByRole } from "@/utiles/filterNav";
import { NavBottom } from "./NavBottom";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/services/auth/logoutUser";
import { getUserAvatar, getRoleLabel } from "@/utiles/user-utils";
import { useContentCounts } from "@/services/blog/contentCounts";


export function AppSidebar() {
  const { user, loading } = useAuth();

  // Hook order has to stay stable, so the fetch is gated by a flag rather
  // than by returning early above it.
  const contentCounts = useContentCounts(Boolean(user));

  if (loading) return null;
  if (!user) return null;

  const role = user.role as UserRole;
  const avatar = getUserAvatar(user);

  const navMain = filterNavByRole(NAV_MAIN, role);
  const navAdmin = filterNavByRole(NAV_ROLE, role);
  const navSecondary = filterNavByRole(NAV_SECONDARY, role);
  const navContent = filterNavByRole(NAV_CONTENT, role);


  // Section label adapts to who's logged in
  const adminSectionTitle = getRoleLabel(role);
  
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="bg-white md:pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Link href="/dashboard">
                <Image
                  className="block dark:hidden mx-auto mb-1 ml-2"
                  src="/assets/Logo_Black.png"
                  width={140}
                  height={120}
                  alt="Black Logo"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Sits under the logo and above Dashboards. Only surfaces routes
            this role can already reach. */}
        <SidebarSearch role={role} />
      </SidebarHeader>

      <SidebarContent className="flex flex-col pt-2 bg-white">

        <NavMain items={navMain} title="Dashboards" />

        {navContent.length > 0 && (
          <NavMain
            items={navContent}
            title="Content"
            counts={contentCounts ?? undefined}
          />
        )}

        {navAdmin.length > 0 && (
          <div className="mt-auto">
            <NavMain items={navAdmin} title={adminSectionTitle} />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-white">
        <NavBottom
          items={navSecondary}
          title="More"
          user={{
            name: user.name || "Unknown User",
            email: user.email || "",
            avatar: avatar,
            role: role,
          }}
          onLogout={logout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
