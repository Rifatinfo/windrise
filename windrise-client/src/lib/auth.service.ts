import { verifyAccessToken } from "@/lib/jwtHanlders";
import { deleteCookie, getCookie, setCookie } from "@/services/auth/tokenHandlers";

import { parse } from "cookie";
import { serverFetch } from "./server-fetch";
import { zodValidator } from "./zodValidator";
import { forgotPasswordSchema } from "@/services/zod/user.validation";
import { changePasswordSchema, resetPasswordSchema } from "@/services/zod/auth.validation";



export async function getNewAccessToken() {
    try {
        const accessToken = await getCookie("accessToken");
        const refreshToken = await getCookie("refreshToken");

        //Case 1: Both tokens are missing - user is logged out
        if (!accessToken && !refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        // Case 2 : Access Token exist- and need to verify
        if (accessToken) {
            const verifiedToken = await verifyAccessToken(accessToken);

            if (verifiedToken.success) {
                return {
                    tokenRefreshed: false,
                }
            }
        }

        //Case 3 : refresh Token is missing- user is logged out
        if (!refreshToken) {
            return {
                tokenRefreshed: false,
            }
        }

        //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
        // This is the only case we need to call the API

        // Now we know: accessToken is invalid/missing AND refreshToken exists
        // Safe to call the API
        let accessTokenObject: null | any = null;
        let refreshTokenObject: null | any = null;

        // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
        const response = await serverFetch.post("/api/v1/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`,
            },
        });

        const result = await response.json();


        const setCookieHeaders = response.headers.getSetCookie();

        if (setCookieHeaders && setCookieHeaders.length > 0) {
            setCookieHeaders.forEach((cookie: string) => {
                const parsedCookie = parse(cookie);

                if (parsedCookie['accessToken']) {
                    accessTokenObject = parsedCookie;
                }
                if (parsedCookie['refreshToken']) {
                    refreshTokenObject = parsedCookie;
                }
            })
        } else {
            throw new Error("No Set-Cookie header found");
        }

        if (!accessTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        if (!refreshTokenObject) {
            throw new Error("Tokens not found in cookies");
        }

        await deleteCookie("accessToken");
        await setCookie("accessToken", accessTokenObject.accessToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(accessTokenObject['Max-Age']) || 1000 * 60 * 60,
            path: accessTokenObject.Path || "/",
            sameSite: accessTokenObject['SameSite'] || "none",
        });

        await deleteCookie("refreshToken");
        await setCookie("refreshToken", refreshTokenObject.refreshToken, {
            secure: true,
            httpOnly: true,
            maxAge: parseInt(refreshTokenObject['Max-Age']) || 1000 * 60 * 60 * 24 * 90,
            path: refreshTokenObject.Path || "/",
            sameSite: refreshTokenObject['SameSite'] || "none",
        });

        if (!result.success) {
            throw new Error(result.message || "Token refresh failed");
        }


        return {
            tokenRefreshed: true,
            success: true,
            message: "Token refreshed successfully"
        };


    } catch (error: any) {
        return {
            tokenRefreshed: false,
            success: false,
            message: error?.message || "Something went wrong",
        };
    }

}

export async function forgotPassword(_prevState: any, formData: FormData) {
    // Build validation payload
    const validationPayload = {
        email: formData.get("email") as string,
    };

    // Validate
    const validatedPayload = zodValidator(
        validationPayload,
        forgotPasswordSchema
        
    );

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {
        // API Call
        const response = await serverFetch.post("/api/v1/auth/forgot-password", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: validationPayload.email,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Failed to send reset link");
        }

        return {
            success: true,
            message: "Password reset link has been sent to your email!",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function resetPassword(_prevState: any, formData: FormData) {
    const isEmailReset = formData.get("isEmailReset") === "true";
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;

    console.log("Token", token);
    // Build validation payload
    const validationPayload = {
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate
    const validatedPayload = zodValidator(
        validationPayload,
        resetPasswordSchema
    );

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {

        // if (token) {
        //     jwt.verify(token, process.env.RESET_PASS_SECRET as string);
        // }
        
        let response;

        if (isEmailReset) {
            // Case 1: Password reset from email link (with token)
            if (!email || !token) {
                return {
                    success: false,
                    message: "Invalid reset link",
                };
            }

            response = await serverFetch.post("/api/v1/auth/reset-password", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    email: email,
                    password: validationPayload.newPassword,
                }),
            });
        } else {
            // Case 2: Newly created user (authenticated, needPasswordChange)
            response = await serverFetch.post("/api/v1/auth/reset-password", {
                headers: {
                    "Content-Type": "application/json",
                    
                },
                 credentials: "include",
                body: JSON.stringify({
                    password: validationPayload.newPassword,
                }),
            });
        }

        const result = await response.json();


        if (!result.success) {
            throw new Error(result.message || "Password reset failed");
        }

        return {
            success: true,
            message: "Password reset successfully! Redirecting to login...",
            redirectToLogin: true,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}

export async function changePassword(_prevState: any, formData: FormData) {
    // Build validation payload
    const validationPayload = {
        oldPassword: formData.get("oldPassword") as string,
        newPassword: formData.get("newPassword") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate
    const validatedPayload = zodValidator(
        validationPayload,
        changePasswordSchema
    );

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        };
    }

    try {
        // API Call
        const response = await serverFetch.post("/api/v1/auth/change-password", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oldPassword: validationPayload.oldPassword,
                newPassword: validationPayload.newPassword,
            }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Password change failed");
        }

        return {
            success: true,
            message: result.message || "Password changed successfully!",
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || "Something went wrong",
            formData: validationPayload,
        };
    }
}