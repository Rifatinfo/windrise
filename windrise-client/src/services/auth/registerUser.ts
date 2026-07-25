
/* registerUser.ts */

"use server";

/*  eslint-disable @typescript-eslint/no-explicit-any */

import { zodValidator } from "@/lib/zodValidator";
import { loginUser } from "./loginUser";
import { serverFetch } from "@/lib/server-fetch";
import { signUpSchema } from "../zod/user.validation";

export const registerUser = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword")
        };

        console.log("Formdata --- ", payload);
        if (zodValidator(payload, signUpSchema).success === false) {
            return zodValidator(payload, signUpSchema);
        }
        const validatedPayload: any = zodValidator(payload, signUpSchema).data;
        console.log("validated payloaddddddd : ", validatedPayload)
        const registerData = {
            password: validatedPayload.password,
            name: validatedPayload.name,
            email: validatedPayload.email,
        }
        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(registerData));

        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/create-customer`, {
        //     method: "POST",
        //     body: newFormData, // FormData
        // });
        if (formData.get("file")) {
            newFormData.append("file", formData.get("file") as Blob);
        }

        const res = await serverFetch.post("/api/v1/user/create-customer", {
            body: newFormData,
        })
        const result = await res.json();
        console.log(result, res);

        if (result.success) {
            await loginUser(_currentState, formData);
        }

        return result;
    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        return { success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : "Registration Failed. Please try again"}` };
    }
}