import Link from "next/link";
import {
  BadgePercentIcon,
  BoxesIcon,
  FileBarChart2Icon,
  PackagePlusIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

const ACTIONS = [
  { label: "Add Product", href: "/admin/add-product", icon: PackagePlusIcon },
  { label: "Add Category", href: "/admin/add-product", icon: TagIcon },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Customers", href: "/admin/customer", icon: UsersIcon },
  { label: "Create Coupon", href: "/admin/coupons", icon: BadgePercentIcon },
  { label: "Manage Products", href: "/admin/all-product", icon: BoxesIcon },
  { label: "Reports", href: "#reports", icon: FileBarChart2Icon },
];

export function QuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink shadow-card transition-colors hover:bg-canvas"
        >
          <action.icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          {action.label}
        </Link>
      ))}
    </div>
  );
}
