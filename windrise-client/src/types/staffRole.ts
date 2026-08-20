/**
 * The staff roles that can be created from the dashboard's "Admin Role"
 * section. One config drives every "Add <role>" page — labels, the list
 * filter and the create endpoint — so the four flows stay identical.
 */
export type StaffRoleKey =
  | "ADMIN"
  | "SHOP_MANAGER"
  | "MEDIA_MANAGER"
  | "CUSTOMER_SUPPORT";

export type StaffRoleConfig = {
  role: StaffRoleKey;
  /** e.g. "Admin" — used in dialogs and confirmations. */
  singular: string;
  /** e.g. "admins" — used in counts and helper copy. */
  plural: string;
  /** Sidebar/breadcrumb label, e.g. "Add Shop Manager". */
  navLabel: string;
  /** Page heading, e.g. "All Shop Managers". */
  heading: string;
  subtitle: string;
  /** POST path used to create this role. */
  createPath: string;
};

export const STAFF_ROLES: Record<StaffRoleKey, StaffRoleConfig> = {
  ADMIN: {
    role: "ADMIN",
    singular: "Admin",
    plural: "admins",
    navLabel: "Add Admin",
    heading: "All Admins",
    subtitle: "Manage every admin account for the store.",
    createPath: "/api/v1/user/create-admin",
  },
  SHOP_MANAGER: {
    role: "SHOP_MANAGER",
    singular: "Shop Manager",
    plural: "shop managers",
    navLabel: "Add Shop Manager",
    heading: "All Shop Managers",
    subtitle: "Manage the people who run day-to-day shop operations.",
    createPath: "/api/v1/user/create-shop-manager",
  },
  MEDIA_MANAGER: {
    role: "MEDIA_MANAGER",
    singular: "Media Manager",
    plural: "media managers",
    navLabel: "Add Media Manager",
    heading: "All Media Managers",
    subtitle: "Manage the people who handle product media and content.",
    createPath: "/api/v1/user/create-media-manager",
  },
  CUSTOMER_SUPPORT: {
    role: "CUSTOMER_SUPPORT",
    singular: "Customer Support",
    plural: "customer support agents",
    navLabel: "Add Customer Support",
    heading: "All Customer Support",
    subtitle: "Manage the agents who handle customer questions and returns.",
    createPath: "/api/v1/user/create-customer-support",
  },
};
