# Loading and Error States Documentation

This document describes the comprehensive loading and error handling implementation across the Ramen Bae application.

## Overview

The application now includes:
- **Skeleton screens** for loading states
- **Error boundaries** for catching React errors
- **Error state components** for user-friendly error messages
- **Loading spinners** for async operations
- **Global error pages** for Next.js routing errors

## Components

### 1. Skeleton Components (`src/components/ui/skeleton.tsx`)

Reusable skeleton components for loading states:

#### Base Skeleton
```tsx
import { Skeleton } from '@/components/ui'

<Skeleton className="h-4 w-full" />
```

#### Specialized Skeletons
- `ProductCardSkeleton` - For product cards in grids
- `ProductDetailSkeleton` - For product detail pages
- `ReviewCardSkeleton` - For review cards
- `CartItemSkeleton` - For cart items
- `CategoryFilterSkeleton` - For category filters

**Usage:**
```tsx
import { ProductCardSkeleton } from '@/components/ui'

{isLoading && (
  <div className="grid grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)}
```

### 2. Loading Spinners (`src/components/ui/loading-spinner.tsx`)

Animated loading indicators:

#### LoadingSpinner
```tsx
import { LoadingSpinner } from '@/components/ui'

<LoadingSpinner size="md" text="Loading..." />
```

**Sizes:** `sm`, `md`, `lg`, `xl`

#### Specialized Loaders
- `PageLoader` - Full-page loading state
- `SectionLoader` - Section-level loading (min-height: 400px)
- `InlineLoader` - Inline loading with padding

**Usage:**
```tsx
import { PageLoader } from '@/components/ui'

{isLoading && <PageLoader text="Loading products..." />}
```

### 3. Error Boundary (`src/components/error/ErrorBoundary.tsx`)

React error boundary for catching component errors:

```tsx
import { ErrorBoundary } from '@/components/error'

<ErrorBoundary onError={(error, errorInfo) => {
  // Log to error service
}}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches React rendering errors
- Shows user-friendly error message
- Provides "Try Again" button to reset
- Logs errors in development
- Can integrate with error reporting services (Sentry, etc.)

### 4. Error Fallback (`src/components/error/ErrorFallback.tsx`)

Default error UI shown by ErrorBoundary:

```tsx
import { ErrorFallback } from '@/components/error'

<ErrorFallback
  error={error}
  resetError={() => window.location.reload()}
  title="Something went wrong"
  message="Custom error message"
/>
```

**Features:**
- Shows error icon
- Displays error title and message
- Shows stack trace in development
- Provides "Try Again" and "Go Home" buttons

### 5. Error State Components (`src/components/error/ErrorState.tsx`)

User-friendly error states for specific scenarios:

#### ErrorState
```tsx
import { ErrorState } from '@/components/error'

<ErrorState
  title="Unable to Load Products"
  message="Failed to load products. Please try again."
  onRetry={() => refetch()}
  icon="error"
/>
```

**Icons:** `error`, `not-found`, `network`

#### Specialized Error States
- `NotFoundError` - For 404 scenarios
- `NetworkError` - For connection issues

**Usage:**
```tsx
import { NotFoundError, NetworkError } from '@/components/error'

// 404 Error
<NotFoundError
  title="Product Not Found"
  message="The product you are looking for does not exist."
/>

// Network Error
<NetworkError
  onRetry={() => refetch()}
/>
```

## Global Error Pages

### 1. Root Error Page (`src/app/error.tsx`)

Catches errors in the entire application:
- Automatically wraps all pages
- Shows ErrorFallback component
- Provides reset functionality
- Logs errors to console

### 2. Not Found Page (`src/app/not-found.tsx`)

Custom 404 page:
- Shows NotFoundError component
- Provides navigation back to home

### 3. Loading Page (`src/app/loading.tsx`)

Global loading state:
- Shows PageLoader component
- Used during route transitions

## Implementation Examples

### Product Listing Page

```tsx
// Loading state
if (isLoading) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Error state
if (error) {
  return (
    <ErrorState
      title="Unable to Load Products"
      message={error.message}
      onRetry={() => refetch()}
    />
  )
}

// Empty state
if (products.length === 0) {
  return (
    <div className="text-center py-12">
      <p>No products found</p>
    </div>
  )
}

// Success state
return <ProductGrid products={products} />
```

### Product Detail Page

```tsx
if (isLoading) {
  return <ProductDetailSkeleton />
}

if (error || !product) {
  return (
    <NotFoundError
      title="Product Not Found"
      message="The product you are looking for does not exist."
    />
  )
}

return <ProductDetailLayout product={product} />
```

### Form Submission

```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleSubmit = async () => {
  setIsSubmitting(true)
  setError(null)
  
  try {
    await submitForm()
  } catch (err) {
    setError(err.message)
  } finally {
    setIsSubmitting(false)
  }
}

return (
  <form onSubmit={handleSubmit}>
    {error && (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    )}
    
    <Button disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </Button>
  </form>
)
```

### Infinite Scroll

```tsx
// Initial loading
if (isLoading && products.length === 0) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Products with load more
return (
  <>
    <div className="grid grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
    
    {/* Loading more indicator */}
    {isFetchingNextPage && (
      <div className="grid grid-cols-4 gap-6 mt-6">
        {[...Array(4)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )}
    
    {/* End of results */}
    {!hasNextPage && (
      <div className="text-center text-gray-500 mt-8">
        You've reached the end
      </div>
    )}
  </>
)
```

## Best Practices

### 1. Loading States
- Always show skeleton screens that match the content layout
- Use appropriate skeleton sizes (ProductCardSkeleton for cards, etc.)
- Show loading indicators during async operations
- Disable buttons during submission to prevent double-clicks

### 2. Error Handling
- Wrap components with ErrorBoundary for unexpected errors
- Show user-friendly error messages (not technical details)
- Provide retry functionality when possible
- Log errors for debugging (console in dev, service in prod)

### 3. Empty States
- Show helpful messages when no data is available
- Provide actions to help users (e.g., "Start Shopping" button)
- Use icons to make empty states more visual

### 4. User Feedback
- Show success messages after successful operations
- Clear error messages after user takes action
- Use appropriate colors (red for errors, green for success)
- Auto-dismiss success messages after a few seconds

## Error Reporting Integration

To integrate with error reporting services like Sentry:

```tsx
// src/app/layout.tsx
import * as Sentry from '@sentry/nextjs'

<ErrorBoundary
  onError={(error, errorInfo) => {
    Sentry.captureException(error, {
      extra: errorInfo
    })
  }}
>
  {children}
</ErrorBoundary>
```

## Testing

### Testing Error Boundaries
```tsx
// Throw an error to test error boundary
const ThrowError = () => {
  throw new Error('Test error')
}

// In your component
{isDev && <ThrowError />}
```

### Testing Loading States
```tsx
// Force loading state
const { data, isLoading } = useQuery({
  queryKey: ['test'],
  queryFn: async () => {
    await new Promise(resolve => setTimeout(resolve, 5000))
    return data
  }
})
```

### Testing Error States
```tsx
// Force error state
const { data, error } = useQuery({
  queryKey: ['test'],
  queryFn: async () => {
    throw new Error('Test error')
  }
})
```

## Accessibility

All loading and error components follow accessibility best practices:
- Loading spinners have `role="status"` and `aria-label`
- Error messages are announced to screen readers
- Buttons have proper focus states
- Color contrast meets WCAG AA standards
- Keyboard navigation is fully supported

## Performance

- Skeleton screens prevent layout shift
- Loading states are optimized with React.memo where appropriate
- Error boundaries prevent entire app crashes
- Lazy loading is used for below-the-fold content
