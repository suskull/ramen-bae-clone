# Module 9: Performance Optimization (Making Your Backend Fast)

## Learning Objectives
- Understand performance bottlenecks
- Learn database query optimization
- Implement caching strategies
- Optimize API responses
- Monitor and measure performance

## 9.1 Performance Mindset

### Frontend vs Backend Performance

**Frontend Performance:**
```javascript
// Optimize rendering
const MemoizedComponent = React.memo(ExpensiveComponent);

// Code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

**Backend Performance:**
```javascript
// Optimize queries
const products = await supabase
  .from('products')
  .select('id, name, price') // Only needed fields
  .limit(20); // Pagination

// Caching
const cached = await redis.get('products');
if (cached) return cached;
```

**WHY**: Backend performance affects ALL users, frontend performance affects individual users

## 9.2 Database Query Optimization

### N+1 Query Problem

**The Problem:**
```typescript
// ❌ BAD: N+1 queries (1 + N queries)
const products = await supabase.from('products').select('*');

// For each product, fetch category (N queries)
for (const product of products) {
  const category = await supabase
    .from('categories')
    .select('*')
    .eq('id', product.category_id)
    .single();
  
  product.category = category;
}
// Total: 1 + 100 = 101 queries for 100 products! 😱
```

**The Fix:**
```typescript
// ✅ GOOD: Single query with join
const products = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*)
  `);
// Total: 1 query! 🎉
```

**Frontend analogy:**
```javascript
// Like fetching all data at once vs multiple useEffect calls
// ❌ Bad
useEffect(() => fetchUser(), []);
useEffect(() => fetchPosts(), []);
useEffect(() => fetchComments(), []);

// ✅ Good
useEffect(() => {
  Promise.all([fetchUser(), fetchPosts(), fetchComments()]);
}, []);
```

### Select Only What You Need

```typescript
// ❌ BAD: Fetching everything
const products = await supabase
  .from('products')
  .select('*'); // Includes large description, images, etc.

// ✅ GOOD: Only needed fields
const products = await supabase
  .from('products')
  .select('id, name, price, image_url');
```

**Frontend analogy:**
```javascript
// Like destructuring only what you need
const { id, name } = product; // Not const product = {...}
```

### Pagination

```typescript
// ❌ BAD: Loading all products
const products = await supabase
  .from('products')
  .select('*'); // Could be thousands!

// ✅ GOOD: Paginated
const page = 1;
const pageSize = 20;
const start = (page - 1) * pageSize;
const end = start + pageSize - 1;

const { data: products, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(start, end);
```

### Database Indexes

```sql
-- Create index for frequently queried columns
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Composite index for multiple columns
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));
```

**Frontend analogy:**
```javascript
// Like using a Map for O(1) lookups instead of array.find() O(n)
// ❌ Slow: O(n)
const product = products.find(p => p.id === targetId);

// ✅ Fast: O(1)
const productsMap = new Map(products.map(p => [p.id, p]));
const product = productsMap.get(targetId);
```

### Query Optimization Examples

```typescript
// ❌ BAD: Multiple queries
const user = await supabase.from('users').select('*').eq('id', userId).single();
const orders = await supabase.from('orders').select('*').eq('user_id', userId);
const reviews = await supabase.from('reviews').select('*').eq('user_id', userId);

// ✅ GOOD: Single query with joins
const { data } = await supabase
  .from('users')
  .select(`
    *,
    orders(*),
    reviews(*)
  `)
  .eq('id', userId)
  .single();
```

## 9.3 Caching Strategies

### What to Cache?

**Good candidates:**
- Product listings (changes infrequently)
- Category data (rarely changes)
- User profiles (changes occasionally)
- Computed values (expensive calculations)

**Bad candidates:**
- Cart contents (changes frequently)
- Real-time inventory (needs to be accurate)
- User sessions (security risk)

### In-Memory Caching (Redis)

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// Cache helper
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 1 hour default
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get<T>(key);
  if (cached) return cached;
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  await redis.set(key, data, { ex: ttl });
  
  return data;
}
```

**Usage:**
```typescript
// API route with caching
export async function GET(request: NextRequest) {
  const products = await getCached(
    'products:all',
    async () => {
      const { data } = await supabase
        .from('products')
        .select('*');
      return data;
    },
    3600 // Cache for 1 hour
  );
  
  return NextResponse.json({ products });
}
```

**Frontend analogy:**
```javascript
// Like React Query's caching
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 3600000 // 1 hour
});
```

### Cache Invalidation

```typescript
// When product is updated, invalidate cache
export async function PUT(request: NextRequest) {
  const { productId } = await request.json();
  
  // Update product
  await supabase
    .from('products')
    .update(data)
    .eq('id', productId);
  
  // Invalidate caches
  await redis.del('products:all');
  await redis.del(`product:${productId}`);
  
  return NextResponse.json({ success: true });
}
```

### HTTP Caching Headers

```typescript
// API route with cache headers
export async function GET(request: NextRequest) {
  const products = await getProducts();
  
  return NextResponse.json(
    { products },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600'
      }
    }
  );
}
```

## 9.4 API Response Optimization

### Compression

```typescript
// next.config.js
module.exports = {
  compress: true, // Enable gzip compression
};
```

### Response Size Reduction

```typescript
// ❌ BAD: Large response
return NextResponse.json({
  products: products.map(p => ({
    ...p,
    fullDescription: p.description, // Large text
    allImages: p.images, // Multiple large URLs
    reviews: p.reviews // Nested data
  }))
});

// ✅ GOOD: Minimal response
return NextResponse.json({
  products: products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    thumbnail: p.images[0], // Just first image
    rating: p.averageRating // Computed value
  }))
});
```

### Streaming Responses

```typescript
// For large datasets, stream the response
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const products = await getProducts();
      
      controller.enqueue(encoder.encode('{"products":['));
      
      for (let i = 0; i < products.length; i++) {
        const json = JSON.stringify(products[i]);
        controller.enqueue(encoder.encode(json));
        
        if (i < products.length - 1) {
          controller.enqueue(encoder.encode(','));
        }
      }
      
      controller.enqueue(encoder.encode(']}'));
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## 9.5 Connection Pooling

### Database Connections

```typescript
// Supabase handles connection pooling automatically
// But you can configure it

// supabase/config.toml
[db]
pool_size = 15 # Number of connections
max_client_conn = 100 # Max client connections
```

**Frontend analogy:**
```javascript
// Like reusing HTTP connections instead of creating new ones
// Browser does this automatically with HTTP/2
```

## 9.6 Async Operations

### Parallel Execution

```typescript
// ❌ BAD: Sequential (slow)
const user = await getUser(userId);
const orders = await getOrders(userId);
const reviews = await getReviews(userId);
// Total time: 300ms + 200ms + 150ms = 650ms

// ✅ GOOD: Parallel (fast)
const [user, orders, reviews] = await Promise.all([
  getUser(userId),
  getOrders(userId),
  getReviews(userId)
]);
// Total time: max(300ms, 200ms, 150ms) = 300ms
```

### Background Jobs

```typescript
// Don't make user wait for slow operations
export async function POST(request: NextRequest) {
  const order = await createOrder(data);
  
  // ❌ BAD: User waits for email
  await sendOrderConfirmationEmail(order);
  return NextResponse.json({ order });
  
  // ✅ GOOD: Send email in background
  sendOrderConfirmationEmail(order).catch(console.error);
  return NextResponse.json({ order });
}
```

## 9.7 Monitoring and Profiling

### Performance Monitoring

```typescript
// lib/monitoring.ts
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    console.log(`[Performance] ${name}: ${duration}ms`);
    
    // Send to monitoring service
    await fetch('https://analytics.example.com/metrics', {
      method: 'POST',
      body: JSON.stringify({
        metric: name,
        duration,
        timestamp: new Date().toISOString()
      })
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[Performance] ${name} failed after ${duration}ms`);
    throw error;
  }
}

// Usage
export async function GET(request: NextRequest) {
  const products = await measurePerformance(
    'fetch-products',
    () => supabase.from('products').select('*')
  );
  
  return NextResponse.json({ products });
}
```

### Database Query Analysis

```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 10
ORDER BY p.created_at DESC
LIMIT 20;

-- Look for:
-- - Sequential scans (bad) vs Index scans (good)
-- - High execution time
-- - Large number of rows processed
```

## 9.8 Edge Computing

### Vercel Edge Functions

```typescript
// app/api/products/route.ts
export const runtime = 'edge'; // Run on edge network

export async function GET(request: NextRequest) {
  // Runs closer to user = faster response
  const products = await getProducts();
  return NextResponse.json({ products });
}
```

**Benefits:**
- Lower latency (closer to users)
- Better scalability
- Reduced costs

## 9.9 Practical Optimization Example

### Before Optimization

```typescript
// ❌ SLOW: Multiple issues
export async function GET(request: NextRequest) {
  // Issue 1: No caching
  const products = await supabase
    .from('products')
    .select('*'); // Issue 2: Selecting all fields
  
  // Issue 3: N+1 queries
  for (const product of products) {
    const category = await supabase
      .from('categories')
      .select('*')
      .eq('id', product.category_id)
      .single();
    product.category = category;
    
    // Issue 4: More N+1 queries
    const reviews = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id);
    product.reviews = reviews;
  }
  
  // Issue 5: No pagination
  return NextResponse.json({ products });
}
```

### After Optimization

```typescript
// ✅ FAST: All issues fixed
export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const pageSize = 20;
  
  // Fix 1: Add caching
  const products = await getCached(
    `products:page:${page}`,
    async () => {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      
      // Fix 2: Select only needed fields
      // Fix 3: Use joins instead of N+1
      const { data } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          category:categories(id, name),
          avg_rating:reviews(rating).avg()
        `)
        .range(start, end); // Fix 5: Pagination
      
      return data;
    },
    3600 // Cache for 1 hour
  );
  
  return NextResponse.json(
    { products },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600'
      }
    }
  );
}
```

**Performance improvement:**
- Before: ~2000ms (2 seconds)
- After: ~50ms (0.05 seconds)
- **40x faster!** 🚀

## 9.10 Performance Checklist

### Database
- [ ] Indexes on frequently queried columns
- [ ] No N+1 queries (use joins)
- [ ] Select only needed fields
- [ ] Pagination for large datasets
- [ ] Connection pooling configured

### Caching
- [ ] Redis/memory cache for expensive operations
- [ ] HTTP cache headers set appropriately
- [ ] Cache invalidation strategy in place
- [ ] CDN configured for static assets

### API
- [ ] Response compression enabled
- [ ] Minimal response payloads
- [ ] Parallel execution where possible
- [ ] Background jobs for slow operations
- [ ] Rate limiting to prevent abuse

### Monitoring
- [ ] Performance metrics tracked
- [ ] Slow queries identified and optimized
- [ ] Error rates monitored
- [ ] Resource usage tracked

## 9.11 Key Takeaways

- **Measure first** - Don't optimize blindly
- **Database queries** are often the bottleneck
- **Caching** can provide massive speedups
- **N+1 queries** are a common performance killer
- **Pagination** is essential for large datasets
- **Indexes** make queries faster
- **Parallel execution** reduces total time
- **Monitor continuously** - Performance degrades over time

## 9.12 Performance Metrics

### What to Measure

```typescript
// Key metrics to track
const metrics = {
  // Response time
  p50: 100, // 50th percentile (median)
  p95: 250, // 95th percentile
  p99: 500, // 99th percentile
  
  // Throughput
  requestsPerSecond: 1000,
  
  // Error rate
  errorRate: 0.01, // 1%
  
  // Database
  queryTime: 50,
  connectionPoolUsage: 0.7, // 70%
  
  // Cache
  cacheHitRate: 0.85 // 85%
};
```

## Next Module Preview

In Module 10, we'll learn about Testing Backend Code - how to ensure your backend works correctly and reliably!
