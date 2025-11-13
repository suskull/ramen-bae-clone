import * as z from "zod"
import { emailSchema, passwordSchema, nameSchema, passwordWithConfirmation } from "./common"

/**
 * Authentication-related validation schemas
 */

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export type SignInFormData = z.infer<typeof signInSchema>

// Sign up schema
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
  })
  .merge(passwordWithConfirmation())

export type SignUpFormData = z.infer<typeof signUpSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = passwordWithConfirmation()

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Update profile schema
export const updateProfileSchema = z.object({
  name: nameSchema,
  // Email is typically not editable, but included for display
  email: emailSchema.optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// Change password schema (for authenticated users)
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
  })
  .merge(passwordWithConfirmation())

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
