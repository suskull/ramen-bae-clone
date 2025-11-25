# React 19 & Next.js 16 Migration Design Document

## Overview

This design document outlines the technical approach for migrating the Ramen Bae e-commerce platform to leverage React 19 and Next.js 16 features. The migration focuses on improving user experience through smoother transitions, optimistic updates, better form handling, and cleaner code architecture. We'll adopt modern patterns while maintaining backward compatibility and progressive enhancement.

### Key Features to Implement

1. **View Transitions** - Smooth page navigation animations
2. **useEffectEvent** - Cleaner effect logic separation
3. **useOptimistic** - Instant UI feedback for mutations
4. **useFormStatus** - Better form submission states
5. **Parallel Routes** - Simultaneous content rendering
6. **Intercepting Routes** - Modal-based navigation
7. **Server Actions** - Modern form handling
8. **Suspense Streaming** - Progressive content loading

## Architecture

### 1. View Transitions Setup

#### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true, // Enable View Transitions API integration
  },
}

export default nextConfig
```

#### Root Layout with View Transitions
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
      </body>
    </html>
  )
}
```

#### View Transition Hook
```typescript
// src/hooks/useViewTransition.ts
'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function useViewTransition() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigate = (href: string) => {
    if (!document.startViewTransition) {
      router.push(href)
      return
    }

    startTransition(() => {
      document.startViewTransition(() => {
        router.push(href)
      })
    })
  }

  return { navigate, isPending }
}
```

#### CSS for View Transitions
```css
/* src/app/globals.css */
@view-transition {
  navigation: auto;
}

/* Customize transition for specific elements */
::view-transition-old(product-image),
::view-transition-new(product-image) {
  animation-duration: 0.3s;
}

::view-transition-old(product-title),
::view-transition-new(product-title) {
  animation-duration: 0.25s;
}

/* Smooth crossfade for content */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.2s;
}
```

### 2. Optimistic Updates for Cart

#### Cart Store with Optimistic State
```typescript
// src/stores/useCartStore.ts
'use client'

import { create } from 'zustand'
import { useOptimistic } from 'react'

interface CartItem {
  id: string
  product_id: string
  quantity: number
  price: number
  optimistic?: boolean // Flag for optimistic items
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, { ...item, optimistic: true }] 
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, quantity, optimistic: true } : item
    )
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
}))
```

#### Add to Cart with Optimistic Update
```typescript
// src/components/product/AddToCartButton.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { addToCart } from '@/lib/actions/cart'

export function AddToCartButton({ productId, price }: Props) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCart, addOptimisticItem] = useOptimistic(
    cart,
    (state, newItem: CartItem) => [...state, { ...newItem, optimistic: true }]
  )

  const handleAddToCart = async () => {
    const tempItem = {
      id: `temp-${Date.now()}`,
      product_id: productId,
      quantity: 1,
      price,
      optimistic: true,
    }

    // Optimistically add item
    addOptimisticItem(tempItem)

    // Start server action
    startTransition(async () => {
      try {
        await addToCart(productId, 1)
        // Server confirms - optimistic flag removed automatically
      } catch (error) {
        // Revert optimistic update on error
        console.error('Failed to add to cart:', error)
      }
    })
  }

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isPending}
      className="btn-primary"
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

### 3. Intercepting Routes for Modals

#### Directory Structure for Modal Interception
```
src/app/
├── products/
│   ├── page.tsx                    # Product grid
│   ├── @modal/                     # Parallel route for modal
│   │   ├── (.)slug]/              # Intercept same level
│   │   │   └── page.tsx           # Modal view
│   │   └── default.tsx            # Default (null)
│   ├── [slug]/
│   │   └── page.tsx               # Full product page
│   └── layout.tsx                 # Layout with modal slot
```

#### Products Layout with Modal Slot
```typescript
// src/app/products/layout.tsx
export default function ProductsLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

#### Modal Default (Hidden State)
```typescript
// src/app/products/@modal/default.tsx
export default function Default() {
  return null
}
```

#### Intercepted Product Modal
```typescript
// src/app/products/@modal/(.)slug]/page.tsx
import { Modal } from '@/components/ui/modal'
import { ProductQuickView } from '@/components/product/ProductQuickView'

export default async function ProductModal({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  return (
    <Modal>
      <ProductQuickView slug={slug} />
    </Modal>
  )
}
```

#### Modal Component with Router Back
```typescript
// src/components/ui/modal.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleClose])

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        {children}
      </DialogContent>
    </Dialog>
  )
}
```

### 4. Forms with React 19 Actions

#### Contact Form with useActionState
```typescript
// src/app/contact/page.tsx
'use client'

import { useActionState } from 'react'
import { submitContactForm } from '@/lib/actions/contact'
import { SubmitButton } from '@/components/forms/SubmitButton'

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    { message: '', errors: {} }
  )

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="input"
        />
        {state.errors?.name && (
          <p className="text-red-500 text-sm">{state.errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="input"
        />
        {state.errors?.email && (
          <p className="text-red-500 text-sm">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="input"
        />
        {state.errors?.message && (
          <p className="text-red-500 text-sm">{state.errors.message}</p>
        )}
      </div>

      <SubmitButton />

      {state.message && (
        <p className="text-green-600">{state.message}</p>
      )}
    </form>
  )
}
```

#### Submit Button with useFormStatus
```typescript
// src/components/forms/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary"
    >
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

#### Server Action for Form Submission
```typescript
// src/lib/actions/contact.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function submitContactForm(
  prevState: any,
  formData: FormData
) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed',
    }
  }

  try {
    // Send email or save to database
    await sendContactEmail(validatedFields.data)

    revalidatePath('/contact')
    
    return {
      message: 'Thank you! We will get back to you soon.',
      errors: {},
    }
  } catch (error) {
    return {
      message: 'Failed to send message. Please try again.',
      errors: {},
    }
  }
}
```

### 5. useEffectEvent for Cleaner Effects

#### Analytics Tracking with useEffectEvent
```typescript
// src/hooks/useProductView.ts
'use client'

import { useEffect, useEffectEvent } from 'react'

export function useProductView(productId: string, userId: string | null) {
  // Non-reactive callback - won't cause effect to re-run
  const trackView = useEffectEvent((id: string, user: string | null) => {
    // Track product view with current user state
    analytics.track('product_viewed', {
      product_id: id,
      user_id: user,
      timestamp: Date.now(),
    })
  })

  useEffect(() => {
    // Only re-run when productId changes, not when userId changes
    trackView(productId, userId)
  }, [productId]) // userId not in dependencies!
}
```

#### Scroll Restoration with useEffectEvent
```typescript
// src/hooks/useScrollRestoration.ts
'use client'

import { useEffect, useEffectEvent } from 'react'
import { usePathname } from 'next/navigation'

export function useScrollRestoration() {
  const pathname = usePathname()
  const scrollPositions = useRef<Map<string, number>>(new Map())

  // Non-reactive restore function
  const restoreScroll = useEffectEvent((path: string) => {
    const savedPosition = scrollPositions.current.get(path)
    if (savedPosition !== undefined) {
      window.scrollTo({ top: savedPosition, behavior: 'smooth' })
    }
  })

  useEffect(() => {
    // Save current scroll position
    const handleScroll = () => {
      scrollPositions.current.set(pathname, window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Restore scroll for this path
    restoreScroll(pathname)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname]) // restoreScroll not in dependencies!
}
```

#### Cart Sync with useEffectEvent
```typescript
// src/components/auth/AuthCartSync.tsx
'use client'

import { useEffect, useEffectEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCartStore } from '@/stores/useCartStore'

export function AuthCartSync() {
  const { user } = useAuth()
  const cart = useCartStore()

  // Non-reactive sync function
  const syncCart = useEffectEvent(async (userId: string | null, items: CartItem[]) => {
    if (userId) {
      // Sync local cart to server
      await syncCartToServer(userId, items)
    }
  })

  useEffect(() => {
    // Only re-run when user changes, not when cart items change
    syncCart(user?.id ?? null, cart.items)
  }, [user?.id]) // cart.items not in dependencies!

  return null
}
```

### 6. Parallel Routes for Profile Dashboard

#### Profile Directory Structure
```
src/app/profile/
├── layout.tsx                      # Layout with parallel slots
├── page.tsx                        # Default profile view
├── @sidebar/
│   ├── page.tsx                   # Sidebar content
│   └── default.tsx                # Sidebar default
├── @content/
│   ├── page.tsx                   # Main content
│   ├── orders/
│   │   └── page.tsx               # Orders view
│   ├── settings/
│   │   └── page.tsx               # Settings view
│   └── default.tsx                # Content default
```

#### Profile Layout with Parallel Slots
```typescript
// src/app/profile/layout.tsx
export default function ProfileLayout({
  children,
  sidebar,
  content,
}: {
  children: React.ReactNode
  sidebar: React.ReactNode
  content: React.ReactNode
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          {sidebar}
        </aside>
        <main className="lg:col-span-3">
          {content || children}
        </main>
      </div>
    </div>
  )
}
```

#### Sidebar with Independent Navigation
```typescript
// src/app/profile/@sidebar/page.tsx
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

export default function ProfileSidebar() {
  return (
    <nav className="space-y-2">
      <Link 
        href="/profile" 
        className="block p-3 rounded hover:bg-gray-100"
      >
        Overview
      </Link>
      <Link 
        href="/profile/orders" 
        className="block p-3 rounded hover:bg-gray-100"
      >
        Orders
      </Link>
      <Link 
        href="/profile/settings" 
        className="block p-3 rounded hover:bg-gray-100"
      >
        Settings
      </Link>
    </nav>
  )
}
```

### 7. Suspense Boundaries for Loading States

#### Product Page with Suspense
```typescript
// src/app/products/[slug]/page.tsx
import { Suspense } from 'react'
import { ProductHeader } from '@/components/product/ProductHeader'
import { ProductDetails } from '@/components/product/ProductDetails'
import { ProductReviews } from '@/components/product/ProductReviews'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { ProductHeaderSkeleton, ProductDetailsSkeleton } from '@/components/product/skeletons'

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<ProductHeaderSkeleton />}>
        <ProductHeader slug={slug} />
      </Suspense>

      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails slug={slug} />
      </Suspense>

      <Suspense fallback={<div>Loading reviews...</div>}>
        <ProductReviews slug={slug} />
      </Suspense>

      <Suspense fallback={<div>Loading related products...</div>}>
        <RelatedProducts slug={slug} />
      </Suspense>
    </div>
  )
}
```

#### Skeleton Components
```typescript
// src/components/product/skeletons.tsx
export function ProductHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  )
}

export function ProductDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded" />
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}
```

## Performance Optimizations

### 1. Prefetching Strategy
```typescript
// src/components/product/ProductCard.tsx
'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter()

  // Prefetch on hover
  const handleMouseEnter = () => {
    router.prefetch(`/products/${product.slug}`)
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      onMouseEnter={handleMouseEnter}
      className="block"
    >
      {/* Product card content */}
    </Link>
  )
}
```

### 2. Image Optimization
```typescript
// src/components/product/ProductImage.tsx
import Image from 'next/image'

export function ProductImage({ 
  src, 
  alt, 
  priority = false 
}: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={800}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      className="object-cover"
    />
  )
}
```

### 3. Route Caching
```typescript
// src/app/products/[slug]/page.tsx
export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const products = await getPopularProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}
```

## Testing Strategy

### Unit Tests
- Test `useEffectEvent` hooks in isolation
- Test optimistic update logic
- Test form validation schemas
- Test utility functions

### Integration Tests
- Test Server Actions with form submissions
- Test cart sync with authentication
- Test modal interception flows
- Test parallel route navigation

### E2E Tests
- Test complete shopping flow with optimistic updates
- Test modal interception from product grid
- Test form submissions with loading states
- Test View Transitions across browsers

## Migration Path

1. **Phase 1**: Enable View Transitions and test navigation
2. **Phase 2**: Migrate cart to use `useOptimistic`
3. **Phase 3**: Implement modal interception for products
4. **Phase 4**: Migrate forms to Server Actions
5. **Phase 5**: Refactor effects to use `useEffectEvent`
6. **Phase 6**: Implement parallel routes for profile
7. **Phase 7**: Add Suspense boundaries throughout
8. **Phase 8**: Optimize and test performance

## Browser Compatibility

- View Transitions: Chrome 111+, Edge 111+ (fallback to instant navigation)
- React 19 features: All modern browsers
- Progressive enhancement for older browsers
- Polyfills not required (graceful degradation)
