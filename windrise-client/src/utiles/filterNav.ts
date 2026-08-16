

import { NavItem } from "@/components/sidebar/nav-config";
import { UserRole } from "@/types/role";



export const filterNavByRole = (items: NavItem[], role: UserRole) => {
  const result: NavItem[] = [];

  for (const item of items) {
    if (item.roles.includes(role)) {
      result.push({
        ...item,
        children: item.children
          ? item.children.filter((child) => child.roles.includes(role))
          : undefined,
      });
    } else if (item.children) {
      const visibleChildren = item.children.filter((child) =>
        child.roles.includes(role)
      );
      result.push(...visibleChildren);
    }
  }

  return result;
};