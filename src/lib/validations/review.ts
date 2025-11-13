import * as z from "zod"
import { ratingSchema, textAreaSchema, nameSchema } from "./common"

/**
 * Review-related validation schemas
 */

// Create review schema
export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: ratingSchema,
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .optional(),
  body: textAreaSchema,
  userName: nameSchema,
  // Media uploads (optional)
  media: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(["image", "video"]),
      })
    )
    .max(5, "Maximum 5 media files allowed")
    .optional(),
})

export type CreateReviewFormData = z.infer<typeof createReviewSchema>

// Update review schema (similar but with optional fields)
export const updateReviewSchema = createReviewSchema.partial().required({
  productId: true,
})

export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>

// Review filter schema (for filtering/searching reviews)
export const reviewFilterSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  verified: z.boolean().optional(),
  sortBy: z.enum(["recent", "helpful", "rating_high", "rating_low"]).optional(),
})

export type ReviewFilterData = z.infer<typeof reviewFilterSchema>
