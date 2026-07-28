

import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  BarChart3,
  Plus,
  StoreIcon,
  UsersIcon,
  SettingsIcon,
  SearchIcon,
  UserCogIcon,
  ShieldCheckIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FolderOpenIcon,
} from "lucide-react";
import { UserRole } from "@/types/role";

export type NavItem = {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
  path?: string;
};

// =====================
// Dashboard Section
// =====================
export const NAV_MAIN: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/dashboard",
  },

  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["ADMIN"],
    path: "/dashboard/analytics",
  },

  {
    id: "products",
    label: "Add Products",
    icon: Plus,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/dashboard/add-product",
  },

  {
    id: "all-products",
    label: "All Products",
    icon: StoreIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/dashboard/all-products",
  },

  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCartIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/dashboard/orders",
  },

  {
    id: "media-library",
    label: "Media Library",
    icon: FolderOpenIcon,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/dashboard/media-library",
  },
];

// =====================
// More Section
// =====================
export const NAV_SECONDARY: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    icon: SettingsIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/dashboard/settings",
  },

  {
    id: "search",
    label: "Search",
    icon: SearchIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/dashboard/search",
  },
];

// =====================
// Role Specific Section
// =====================
export const NAV_ROLE: NavItem[] = [
  // =====================
  // ADMIN
  // =====================
  {
    id: "admin-create",
    label: "Create Admin",
    icon: UserCogIcon,
    roles: ["ADMIN"],
    path: "/admin/create-admin",
  },

  {
    id: "control-authority",
    label: "Control Authority",
    icon: ShieldCheckIcon,
    roles: ["ADMIN"],
    path: "/admin/control-authority",
  },

  {
    id: "manage-managers",
    label: "Manage Managers",
    icon: UsersIcon,
    roles: ["ADMIN"],
    path: "/admin/managers",
  },

  // =====================
  // SHOP MANAGER
  // =====================
  {
    id: "my-shop",
    label: "My Shop",
    icon: StoreIcon,
    roles: ["SHOP_MANAGER"],
    path: "/shop-dashboard/my-shop",
  },

  {
    id: "manage-staff",
    label: "Manage Staff",
    icon: UsersIcon,
    roles: ["SHOP_MANAGER"],
    path: "/shop-dashboard/staff",
  },

  // =====================
  // MEDIA MANAGER
  // =====================
  {
    id: "upload-media",
    label: "Upload Media",
    icon: ImageIcon,
    roles: ["MEDIA_MANAGER"],
    path: "/shop-dashboard/upload-media",
  },

  {
    id: "manage-images",
    label: "Manage Images",
    icon: ImageIcon,
    roles: ["MEDIA_MANAGER"],
    path: "/shop-dashboard/images",
  },

  {
    id: "manage-videos",
    label: "Manage Videos",
    icon: VideoIcon,
    roles: ["MEDIA_MANAGER"],
    path: "/shop-dashboard/videos",
  },

  {
    id: "media-posts",
    label: "Media Posts",
    icon: FileTextIcon,
    roles: ["MEDIA_MANAGER"],
    path: "/shop-dashboard/media-posts",
  },
];