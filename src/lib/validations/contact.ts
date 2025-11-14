import * as z from "zod";
import { emailSchema, nameSchema } from "./common";

/**
 * Contact form validation schema
 */
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  inquiryType: z.enum(["general", "order", "product", "shipping", "returns", "other"], {
    message: "Please select an inquiry type",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
