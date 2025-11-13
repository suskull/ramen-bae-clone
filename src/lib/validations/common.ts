import * as z from "zod"

/**
 * Common reusable validation schemas
 * These can be composed into larger schemas
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .regex(/(?=.*\d)/, "Password must contain at least one number")

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")

// Optional name (for profiles where name might not be required)
export const optionalNameSchema = nameSchema.optional()

// Phone number validation (US format)
export const phoneSchema = z
  .string()
  .regex(/^\+?1?\d{10,14}$/, "Please enter a valid phone number")
  .optional()

// URL validation
export const urlSchema = z
  .string()
  .url("Please enter a valid URL")
  .optional()

// Positive number validation
export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number")

// Positive integer validation
export const positiveIntegerSchema = z
  .number()
  .int("Must be a whole number")
  .positive("Must be a positive number")

// Price validation (allows decimals, must be positive)
export const priceSchema = z
  .number()
  .positive("Price must be greater than 0")
  .multipleOf(0.01, "Price can have at most 2 decimal places")

// Quantity validation
export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(999, "Quantity cannot exceed 999")

// Rating validation (1-5 stars)
export const ratingSchema = z
  .number()
  .int("Rating must be a whole number")
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot exceed 5")

// Text area validation (for reviews, comments, etc.)
export const textAreaSchema = z
  .string()
  .min(10, "Must be at least 10 characters")
  .max(1000, "Must be less than 1000 characters")

// Slug validation (URL-friendly strings)
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only")

/**
 * Helper function to create password confirmation schema
 * Usage: passwordWithConfirmation()
 */
export const passwordWithConfirmation = () =>
  z
    .object({
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
