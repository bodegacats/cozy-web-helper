import { z } from "zod";

export const quoteFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  notes: z
    .string()
    .trim()
    .max(2000, { message: "Notes must be less than 2000 characters" })
    .optional()
    .default(""),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
