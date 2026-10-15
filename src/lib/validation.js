import { z } from "zod";

// Pakistani phone regex: supports 03001234567, 0300-1234567, +923001234567, 923001234567
export const PAKISTANI_PHONE_REGEX = /^(?:\+92|92|0)?3[0-9]{2}-?[0-9]{7}$/;

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name cannot exceed 60 characters"),
  phone: z
    .string()
    .trim()
    .regex(
      PAKISTANI_PHONE_REGEX,
      "Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567)"
    ),
  address: z
    .string()
    .trim()
    .min(5, "Complete street address is required (at least 5 characters)")
    .max(180, "Address cannot exceed 180 characters"),
  area: z
    .string()
    .trim()
    .min(2, "Please select or provide a valid delivery area"),
  city: z.string().trim().default("Gujranwala"),
  instructions: z
    .string()
    .trim()
    .max(200, "Instructions cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
});
