# React Query Management Guide

## Query Key Structure

We use a **Query Key Factory** pattern to manage all query keys centrally in `src/lib/query-keys.ts`.

### Benefits
- **Type-safe**: TypeScript ensures correct key usage
- **Consistent**: All keys follow the same pattern
- **Easy invalidation**: Invalidate related queries easily
- **Discoverable**: All keys in one place

### Key Hierarchy

```typescript
['products']                          // All products
['products', 'list']                  // All product lists
['products', 'list', 'electronics']   // Products in electronics category
['products', 'detail']                // All product details
['products', 'detail', '123']         // Specific product detail
```

## Usage Examples

### 1. Basic Query

```typescript
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getProducts } from '@/lib/api/products'

function ProductList({ category }: { category: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.products.list(category),
    queryFn: () => getProducts(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### 2. Mutation with Invalidation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

function CreateProductForm() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Invalidate all product lists to refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.products.lists() 
      })
    },
  })

  return (
    <button onClick={() => mutation.mutate({ name: 'New Product' })}>
      Create Product
    </button>
  )
}
```

### 3. Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async (updatedProduct) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ 
      queryKey: queryKeys.products.detail(updatedProduct.id) 
    })

    // Snapshot previous value
    const previous = queryClient.getQueryData(
      queryKeys.products.detail(updatedProduct.id)
    )

    // Optimistically update
    queryClient.setQueryData(
      queryKeys.products.detail(updatedProduct.id),
      updatedProduct
    )

    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(
        queryKeys.products.detail(variables.id),
        context.previous
      )
    }
  },
  onSettled: (data, error, variables) => {
    // Always refetch after mutation
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.products.detail(variables.id) 
    })
  },
})
```

### 4. Prefetching

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

function ProductCard({ product }: { product: Product }) {
  const queryClient = useQueryClient()

  const prefetchDetails = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.detail(product.id),
      queryFn: () => getProductDetails(product.id),
      staleTime: 5 * 60 * 1000,
    })
  }

  return (
    <div onMouseEnter={prefetchDetails}>
      {product.name}
    </div>
  )
}
```

### 5. Manual Cache Updates

```typescript
// Set data directly (useful after mutations)
queryClient.setQueryData(
  queryKeys.products.detail('123'),
  newProductData
)

// Get data from cache
const product = queryClient.getQueryData(
  queryKeys.products.detail('123')
)

// Remove from cache
queryClient.removeQueries({ 
  queryKey: queryKeys.products.detail('123') 
})
```

## Invalidation Patterns

### Invalidate All Products
```typescript
queryClient.invalidateQueries({ 
  queryKey: queryKeys.products.all 
})
```

### Invalidate All Product Lists (but not details)
```typescript
queryClient.invalidateQueries({ 
  queryKey: queryKeys.products.lists() 
})
```

### Invalidate Specific Category
```typescript
queryClient.invalidateQueries({ 
  queryKey: queryKeys.products.list('electronics') 
})
```

### Invalidate Multiple Related Queries
```typescript
await Promise.all([
  queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }),
  queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
])
```

## Best Practices

### 1. Always Use the Query Key Factory
❌ Don't:
```typescript
useQuery({ queryKey: ['products', category], ... })
```

✅ Do:
```typescript
useQuery({ queryKey: queryKeys.products.list(category), ... })
```

### 2. Set Appropriate Stale Times
```typescript
// Frequently changing data
staleTime: 30 * 1000 // 30 seconds

// Moderately stable data
staleTime: 5 * 60 * 1000 // 5 minutes

// Rarely changing data
staleTime: 60 * 60 * 1000 // 1 hour
```

### 3. Use Custom Hooks
Create custom hooks that encapsulate query logic:

```typescript
// src/hooks/useProducts.ts
export function useProducts(category: string) {
  return useQuery({
    queryKey: queryKeys.products.list(category),
    queryFn: () => getProducts(category),
    staleTime: 5 * 60 * 1000,
  })
}
```

### 4. Handle Loading and Error States
```typescript
const { data, isLoading, error, refetch } = useProducts(category)

if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} onRetry={refetch} />
return <ProductList products={data} />
```

### 5. Use Mutations for Data Changes
Always use mutations (not queries) for POST, PUT, PATCH, DELETE:

```typescript
const mutation = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() })
  },
})
```

## Common Patterns

### Dependent Queries
```typescript
const { data: user } = useUser()
const { data: orders } = useQuery({
  queryKey: queryKeys.orders.list({ userId: user?.id }),
  queryFn: () => getOrders(user!.id),
  enabled: !!user, // Only run when user exists
})
```

### Parallel Queries
```typescript
const products = useProducts('all')
const categories = useCategories()

// Both queries run in parallel
```

### Infinite Queries (Pagination)
```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: queryKeys.products.lists(),
  queryFn: ({ pageParam = 0 }) => getProducts({ page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})
```

## Debugging

### React Query Devtools
The devtools are automatically included in development:

```typescript
// Already set up in src/providers/query-provider.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

Press the React Query icon in the bottom corner to:
- View all queries and their states
- See query keys and data
- Manually refetch or invalidate queries
- Monitor cache size and performance

### Logging
```typescript
const query = useProducts(category)
console.log({
  data: query.data,
  isLoading: query.isLoading,
  isFetching: query.isFetching,
  isStale: query.isStale,
  dataUpdatedAt: query.dataUpdatedAt,
})
```

## Migration Checklist

When adding new features:

1. ✅ Add query keys to `src/lib/query-keys.ts`
2. ✅ Create API functions in `src/lib/api/`
3. ✅ Create custom hooks in `src/hooks/`
4. ✅ Use the hooks in components
5. ✅ Add mutations with proper invalidation
6. ✅ Test with React Query Devtools
