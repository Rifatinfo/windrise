import { z } from "zod";

export const createAdminZodSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.email("Valid email is required"),
    phone: z.string().min(11, "Contact number is required").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    avatar : z
        .instanceof(File)
        .refine((file) => file.size > 0, "Profile photo is required"),
});

export const updateAdminZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Contact number is required"),
});