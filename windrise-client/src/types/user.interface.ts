import { UserRole } from "@/lib/auth-utils";
import { IAdmin } from "./admin.interface";
import { ICustomer } from "./customer.interface";
import { IMediaManager } from "./media-manager.interface";
import { IShopManager } from "./shop-manager.interface";


export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    needPasswordChange: boolean;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
    admin?: IAdmin;
    customer?: ICustomer;
    shopManager?: IShopManager;
    mediaManager?: IMediaManager;
    
    createdAt: string;
    updatedAt: string;
}