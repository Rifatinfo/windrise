import z, { ZodObject } from "zod";

export const zodValidator = <T>(payload: T, schema: ZodObject) => {
  const validatedPayload = schema.safeParse(payload);
  if (!validatedPayload.success) {
    return {
      success: false,
      errors: validatedPayload.error.issues.map((issue) => {
        return {
          field: issue.path[0],
          message: issue.message,
        };
      }),
    };
  }
  return {
    success: true,
    data: validatedPayload.data,
  };
};

export const checkoutSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^01[3-9]\d{8}$/, "Invalid phone number"),
  email: z.email(),
  division: z.string(),
  address: z.string().min(1, "Address is required"),
});