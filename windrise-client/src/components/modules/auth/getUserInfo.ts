/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { UserInfo } from "@/types/user.interface";


export const getUserInfo = async (): Promise<UserInfo | any> => {
    try {

        const response = await serverFetch.get("/api/v1/auth/me", {
            next: { tags: ["user-info"], revalidate: 180 },

        })

        const result = await response.json();
        console.log("user : ", result);
        if (result.success && result.data) {
            const userInfo: UserInfo = {
                name: result.data.name || result.data.admin?.name || result.data.customer?.name || result.data.shopManager?.name || result.data.mediaManager?.name || "Unknown User",
                ...result.data
            };

            return userInfo;
        }

        return null;
    } catch (error: any) {
        console.log(error);
        return null;
    }

}
