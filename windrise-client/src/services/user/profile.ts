"use server";

import { updateTag } from "next/cache";

import { serverFetch } from "@/lib/server-fetch";

type Result = { success: boolean; message: string };

/**
 * Updates the signed-in user's own profile (name, phone, photo).
 * `formData` carries a JSON `data` field and an optional `file`.
 */
export const updateMyProfile = async (formData: FormData): Promise<Result> => {
    try {
        const res = await serverFetch.patch("/api/v1/user/me", {
            credentials: "include",
            body: formData,
        });
        const result = await res.json();

        if (!res.ok || !result?.success) {
            return {
                success: false,
                message: result?.message || "Could not update your profile.",
            };
        }

        // getUserInfo() caches under this tag. updateTag (Next 16) gives this
        // server action read-your-own-writes, so the header, sidebar and this
        // page all pick up the new name/photo instead of the cached copy.
        updateTag("user-info");
        return { success: true, message: "Profile updated successfully." };
    } catch {
        return { success: false, message: "Could not reach the server." };
    }
};

export const changeMyPassword = async (
    oldPassword: string,
    newPassword: string
): Promise<Result> => {
    try {
        const res = await serverFetch.post("/api/v1/auth/change-password", {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        const result = await res.json();

        if (!res.ok || !result?.success) {
            return {
                success: false,
                message: result?.message || "Could not change your password.",
            };
        }
        return { success: true, message: "Password changed successfully." };
    } catch {
        return { success: false, message: "Could not reach the server." };
    }
};
