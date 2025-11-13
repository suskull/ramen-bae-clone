# Validation Schemas

This directory contains all Zod validation schemas used throughout the application. Schemas are organized by domain and can be easily reused across components.

## Structure

```
validations/
├── index.ts          # Central export point
├── common.ts         # Reusable field validators
├── auth.ts           # Authentication schemas
└── README.md         # This file
```

## Usage

### Import from the central export

```typescript
import { signUpSchema, emailSchema, passwordSchema } from "@/lib/validations"
```

### Use with React Hook Form

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpFormData } from "@/lib/validations"

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<SignUpFormData>({
  resolver: zodResolver(signUpSchema),
})
```

## Available Schemas

### Common Validators (`common.ts`)

Reusable field-level validators that can be composed into larger schemas:

- `emailSchema` - Email validation
- `passwordSchema` - Strong password validation (8+ chars, uppercase, lowercase, number)
- `nameSchema` - Name validation (2-50 chars, letters only)
- `phoneSchema` - Phone number validation (optional)
- `urlSchema` - URL validation (optional)
- `positiveNumberSchema` - Positive number validation
- `positiveIntegerSchema` - Positive integer validation
- `priceSchema` - Price validation (positive, 2 decimal places)
- `quantitySchema` - Quantity validation (1-999)
- `ratingSchema` - Rating validation (1-5 stars)
- `textAreaSchema` - Text area validation (10-1000 chars)
- `slugSchema` - URL-friendly slug validation
- `passwordWithConfirmation()` - Helper for password + confirm password

### Auth Schemas (`auth.ts`)

Authentication-related form schemas:

- `signInSchema` - Sign in form (email, password)
- `signUpSchema` - Sign up form (name, email, password, confirmPassword)
- `forgotPasswordSchema` - Forgot password form (email)
- `resetPasswordSchema` - Reset password form (password, confirmPassword)
- `updateProfileSchema` - Update profile form (name, email)
- `changePasswordSchema` - Change password form (currentPassword, password, confirmPassword)

Each schema exports a corresponding TypeScript type (e.g., `SignUpFormData`).

## Creating New Schemas

### 1. Add to existing file or create new domain file

For product-related validations, create `product.ts`:

```typescript
import * as z from "zod"
import { nameSchema, priceSchema, slugSchema } from "./common"

export const createProductSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  price: priceSchema,
  description: z.string().min(10).max(500),
})

export type CreateProductFormData = z.infer<typeof createProductSchema>
```

### 2. Export from index.ts

```typescript
export * from "./product"
```

### 3. Use in your component

```typescript
import { createProductSchema, type CreateProductFormData } from "@/lib/validations"
```

## Best Practices

1. **Reuse common validators** - Don't duplicate validation logic
2. **Export types** - Always export the inferred TypeScript type
3. **Descriptive error messages** - Make errors user-friendly
4. **Compose schemas** - Use `.merge()` and `.extend()` to build complex schemas
5. **Keep schemas focused** - One schema per form/use case
6. **Document complex validations** - Add comments for business logic

## Examples

### Composing schemas

```typescript
import { emailSchema, passwordWithConfirmation } from "./common"

export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
  })
  .merge(passwordWithConfirmation())
```

### Custom refinements

```typescript
export const orderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
    total: priceSchema,
  })
  .refine((data) => calculateTotal(data.items) === data.total, {
    message: "Total does not match cart items",
    path: ["total"],
  })
```

### Optional fields

```typescript
export const updateProfileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional(), // Optional field
  bio: textAreaSchema.optional(),
})
```

## Future Additions

Consider adding schemas for:

- `product.ts` - Product creation/editing
- `order.ts` - Order placement and management
- `review.ts` - Product reviews
- `address.ts` - Shipping/billing addresses
- `payment.ts` - Payment information
