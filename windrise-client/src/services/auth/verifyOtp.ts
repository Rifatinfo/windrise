/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { parse } from "cookie";
import { redirect } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

import { serverFetch } from "@/lib/server-fetch";
import {
  getDefaultDashboardRoute,
  isValidRedirectForRole,
  type UserRole,
} from "@/lib/auth-utils";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";

type ActionResult = { success: false; message: string } | null;

/**
 * Second step of a staff sign-in: swap the emailed code for a session.
 *
 * The ticket proving the password step already passed lives in an httpOnly
 * cookie, so the browser never handles it and the code alone is useless.
 */
export const verifyOtp = async (
  _currentState: any,
  formData: FormData
): Promise<ActionResult> => {
  try {
    const otp = String(formData.get("otp") ?? "").trim();
    const redirectTo = formData.get("redirect");

    if (!/^\d{6}$/.test(otp)) {
      return { success: false, message: "Enter the 6 digit code from your email." };
    }

    const otpTicket = await getCookie("otpTicket");
    if (!otpTicket) {
      return {
        success: false,
        message: "This sign-in attempt has expired. Please log in again.",
      };
    }

    const res = await serverFetch.post("/api/v1/auth/verify-otp", {
      body: JSON.stringify({ otpTicket, otp }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message ?? "That code isn't right. Please try again.",
      };
    }

    // Copy the session the backend just issued onto this app's cookies.
    let accessTokenObject: any = null;
    let refreshTokenObject: any = null;

    for (const cookie of res.headers.getSetCookie() ?? []) {
      const parsed = parse(cookie);
      if (parsed["accessToken"]) accessTokenObject = parsed;
      if (parsed["refreshToken"]) refreshTokenObject = parsed;
    }

    if (!accessTokenObject || !refreshTokenObject) {
      return {
        success: false,
        message: "We couldn't start your session. Please log in again.",
      };
    }

    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
    });
    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge:
        parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
      path: refreshTokenObject.Path || "/",
    });

    // The challenge is over — the ticket must not outlive it.
    await deleteCookie("otpTicket");

    let verified: JwtPayload | null = null;
    try {
      const decoded = jwt.verify(
        accessTokenObject.accessToken,
        process.env.JWT_SECRET as string
      );
      if (typeof decoded !== "string") verified = decoded as JwtPayload;
    } catch {
      return {
        success: false,
        message: "Your session token is invalid. Please log in again.",
      };
    }

    if (!verified) {
      return {
        success: false,
        message: "Your session token is invalid. Please log in again.",
      };
    }

    const role = verified.role as UserRole;
    let redirectPath = getDefaultDashboardRoute(role);

    if (redirectTo) {
      const requested = redirectTo.toString();
      if (isValidRedirectForRole(requested, role)) redirectPath = requested;
    }

    redirect(`${redirectPath}?loggedIn=true`);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "We couldn't verify that code. Please try again.",
    };
  }
};

/** Ask the backend for a fresh code for the sign-in already in flight. */
export const resendOtp = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const otpTicket = await getCookie("otpTicket");
    if (!otpTicket) {
      return {
        success: false,
        message: "This sign-in attempt has expired. Please log in again.",
      };
    }

    const res = await serverFetch.post("/api/v1/auth/resend-otp", {
      body: JSON.stringify({ otpTicket }),
      headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();

    if (!res.ok || !result?.success) {
      return {
        success: false,
        message: result?.message ?? "We couldn't send a new code.",
      };
    }

    // A resend mints a new ticket; keep the cookie in step with it.
    if (result.data?.otpTicket) {
      await setCookie("otpTicket", result.data.otpTicket, {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 5,
        path: "/",
      });
    }

    return { success: true, message: result.message ?? "A new code is on its way." };
  } catch {
    return { success: false, message: "We couldn't send a new code." };
  }
};
