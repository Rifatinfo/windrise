

import { NavItem } from "@/components/sidebar/nav-config";
import { UserRole } from "@/types/role";



export const filterNavByRole = (items: NavItem[], role: UserRole) => 
    items.filter((item) => item.roles.includes(role));