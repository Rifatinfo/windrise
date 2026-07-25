import { UserRole } from "@/lib/auth-utils";
import { IAdmin } from "./admin.interface";
import { ICustomer } from "./customer.interface";


export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    needPasswordChange: boolean;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
    admin?: IAdmin;
    customer?: ICustomer;
    
    createdAt: string;
    updatedAt: string;
}