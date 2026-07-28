import {
  LayoutDashboardIcon,
  BarChart3,
  UserPlusIcon,
  UsersIcon,
  UserIcon,
  ShoppingCartIcon,
  PackageIcon,
  BoxesIcon,
  PackagePlusIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StoreIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  FolderOpenIcon,
  SearchIcon,
  UserCogIcon,
  ClipboardListIcon,
  BadgeDollarSignIcon,
  WarehouseIcon,
  CarIcon,
} from "lucide-react";
import { UserRole } from "@/types/role";
import { PiInvoice } from "react-icons/pi";
import { FaShippingFast } from "react-icons/fa";

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
    label: "Sales Overview",
    icon: LayoutDashboardIcon,
    roles: ["ADMIN", "SHOP_MANAGER", "MEDIA_MANAGER"],
    path: "/admin",
  },

  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["ADMIN"],
    path: "/admin/analytics",
  },

  {
    id: "all-user",
    label: "Users",
    icon: UsersIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/all-users",
  },

  {
    id: "customer",
    label: "Customers",
    icon: UserIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/customer",
  },

  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCartIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/orders",
  },

  {
    id: "inventory",
    label: "Inventory Management",
    icon: WarehouseIcon,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/admin/inventory",
  },
  {
    id: "all-product",
    label: "All Product",
    icon: BoxesIcon,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/admin/all-product",
  },
  {
    id: "add-product",
    label: "Add Product",
    icon: PackagePlusIcon,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/admin/add-product",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: PiInvoice,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/admin/invoices",
  },
  {
    id: "shipping",
    label: "Shipping",
    icon: FaShippingFast,
    roles: ["ADMIN", "MEDIA_MANAGER"],
    path: "/admin/shipping",
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
    id: "help-center",
    label: "Help Center",
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
    label: "Admin Role",
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
    id: "add-admin",
    label: "Add Admin",
    icon: ShieldCheckIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/add-admin",
  },

  {
    id: "add-shop-manager",
    label: "Add Shop Manager",
    icon: UserCogIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/add-shop-manager",
  },

  {
    id: "add-media-manager",
    label: "Add Media Manager",
    icon: UserPlusIcon,
    roles: ["ADMIN", "SHOP_MANAGER"],
    path: "/admin/add-media-manager",
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
