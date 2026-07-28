import { UserInfo } from "@/types/user.interface";

export const getUserAvatar = (user: UserInfo): string => {
    return user.admin?.avatar || user.customer?.avatar || user.shopManager?.avatar || user.mediaManager?.avatar || "";
};

export const getRoleLabel = (role: string): string => {
    switch (role) {
        case "ADMIN":
            return "Admin";
        case "SHOP_MANAGER":
            return "Shop Manager";
        case "MEDIA_MANAGER":
            return "Media Manager";
        case "CUSTOMER":
            return "Customer";
        default:
            return "User";
    }
};
