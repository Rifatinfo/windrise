"use server";

import { redirect } from "next/navigation";
import { deleteCookie } from "./tokenHandlers";

export const logout = async () => {
    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    redirect("/login?loggedOut=true");
};
