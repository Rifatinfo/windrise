"use client";

import { useEffect, useState } from "react";
import { getUserInfo } from "@/components/modules/auth/getUserInfo";
import { UserInfo } from "@/types/user.interface";

export function useAuth() {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const info = await getUserInfo();
                if (info && info.email) {
                    setUser(info);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { user, loading };
}
