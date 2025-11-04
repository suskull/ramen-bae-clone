# Module 14: Caching Strategies (Making Everything Faster)

## Learning Objectives
- Understand different caching layers
- Implement Redis caching
- Use HTTP caching effectively
- Implement cache invalidation strategies
- Optimize with CDN caching

## 14.1 Why Caching?

### The Speed Problem

```typescript
// Without caching: 500ms every time
const products = await supabase.from('products').select('*');

// With caching: 500ms first time, 5ms after
const products = await getCached('products', () =>
  supabase.from('products').select('*')
);
```

**Frontend analogy:**
```javascript
// Like React Query's caching
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000 // Cache for 5 minutes
});
```

## 14.2 Caching Layers

### The Caching Hierarchy

```
Browser Cache (Fastest, User-specific)
    ↓
CDN Cache (Fast, Geographic)
    ↓
Application Cache (Redis/Memory)
    ↓
Database Query Cache
    ↓
Database (Slowest)
```

## 14.3 In-Memory Caching (Redis)

### Setting Up Redis

```bash
npm install @upstash/redis
```

```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

// Cache helper with TTL
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 1 hour default
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`);
    return cached;
  }
  
  console.log(`Cache MISS: ${key}`);
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Store in cache
  await redis.set(key, data, { ex: ttl });
  
  return data;
}
```

### Using Cache in API Routes

```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category');
  const cacheKey = category ? `products:category:${category}` : 'products:all';
  
  const products = await getCached(
    cacheKey,
    async () => {
      let query = supabase.from('products').select('*');
      
      if (category) {
        query = query.eq('category_id', category);
      }
      
      const { data } = await query;
      return data;
    },
    3600 // Cache for 1 hour
  );
  
  return NextResponse.json({ products });
}
```

## 14.4 Cache Invalidation

### The Hard Problem

> "There are only two hard things in Computer Science: cache invalidation and naming things." - Phil Karlton

### Time-Based Invalidation (TTL)

```typescript
// Cache expires after time
await redis.set('products', data, { ex: 3600 }); // 1 hour

// Good for: Data that changes infrequently
// Bad for: Data that needs to be fresh immediately
```

### Event-Based Invalidation

```typescript
// When product is updated, invalidate cache
export async function PUT(request: NextRequest) {
  const { productId } = await request.json();
  
  // Update product
  await supabase
    .from('products')
    .update(data)
    .eq('id', productId);
  
  // Invalidate related caches
  await redis.del('products:all');
  await redis.del(`product:${productId}`);
  await redis.del(`products:category:${data.categoryId}`);
  
  return NextResponse.json({ success: true });
}
```

### Pattern-Based Invalidation

```typescript
// Invalidate all product-related caches
export async function invalidateProductCaches() {
  const keys = await redis.keys('products:*');
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Usage
await invalidateProductCaches();
```

### Cache-Aside Pattern

```typescript
// Read-through cache
export async function getProduct(id: string) {
  const cacheKey = `product:${id}`;
  
  // 1. Try cache
  const cached = await redis.get(cacheKey);
  if (cached) return cached;
  
  // 2. Fetch from database
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  // 3. Store in cache
  if (data) {
    await redis.set(cacheKey, data, { ex: 3600 });
  }
  
  return data;
}

// Write-through cache
export async function updateProduct(id: string, updates: any) {
  // 1. Update database
  const { data } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  // 2. Update cache
  const cacheKey = `product:${id}`;
  await redis.set(cacheKey, data, { ex: 3600 });
  
  // 3. Invalidate list caches
  await redis.del('products:all');
  
  return data;
}
```

## 14.5 HTTP Caching

### Cache-Control Headers

```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const products = await getProducts();
  
  return NextResponse.json(
    { products },
    {
      headers: {
        // Browser cache for 5 minutes
        'Cache-Control': 'public, max-age=300',
        
        // CDN cache for 1 hour
        'CDN-Cache-Control': 'public, s-maxage=3600',
        
        // Vercel-specific
        'Vercel-CDN-Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  );
}
```

### Cache Control Directives

```typescript
// Different caching strategies
const cacheHeaders = {
  // No caching (for sensitive data)
  noCache: 'no-store, no-cache, must-revalidate',
  
  // Cache for 5 minutes
  short: 'public, max-age=300',
  
  // Cache for 1 hour
  medium: 'public, max-age=3600',
  
  // Cache for 1 day
  long: 'public, max-age=86400',
  
  // Cache forever (for immutable assets)
  immutable: 'public, max-age=31536000, immutable',
  
  // Stale while revalidate (serve stale, fetch fresh in background)
  swr: 'public, max-age=60, stale-while-revalidate=3600'
};
```

### ETag for Conditional Requests

```typescript
// Generate ETag from data
import crypto from 'crypto';

function generateETag(data: any): string {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
}

export async function GET(request: NextRequest) {
  const products = await getProducts();
  const etag = generateETag(products);
  
  // Check if client has current version
  const clientETag = request.headers.get('If-None-Match');
  if (clientETag === etag) {
    return new Response(null, { status: 304 }); // Not Modified
  }
  
  return NextResponse.json(
    { products },
    {
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=300'
      }
    }
  );
}
```

## 14.6 CDN Caching

### Vercel Edge Network

```typescript
// Automatically cached at edge locations
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const products = await getProducts();
  
  return NextResponse.json(
    { products },
    {
      headers: {
        // Cache at edge for 1 hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    }
  );
}
```

### Cache Purging

```typescript
// Purge CDN cache when data changes
export async function purgeCache(paths: string[]) {
  await fetch('https://api.vercel.com/v1/purge', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ paths })
  });
}

// Usage
await purgeCache(['/api/products', '/api/products/featured']);
```

## 14.7 Query Result Caching

### Memoization

```typescript
// Cache function results in memory
const cache = new Map<string, { data: any; timestamp: number }>();

export function memoize<T>(
  fn: (...args: any[]) => Promise<T>,
  ttl: number = 60000 // 1 minute
) {
  return async (...args: any[]): Promise<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await fn(...args);
    cache.set(key, { data, timestamp: Date.now() });
    
    return data;
  };
}

// Usage
const getProductsMemoized = memoize(getProducts, 60000);
```

### React Query on Frontend

```typescript
// Frontend caching with React Query
import { useQuery } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false
  });
}
```

## 14.8 Advanced Caching Patterns

### Cache Warming

```typescript
// Pre-populate cache with frequently accessed data
export async function warmCache() {
  console.log('Warming cache...');
  
  // Cache popular products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sales_count', { ascending: false })
    .limit(100);
  
  for (const product of products) {
    await redis.set(`product:${product.id}`, product, { ex: 3600 });
  }
  
  // Cache categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*');
  
  await redis.set('categories:all', categories, { ex: 86400 });
  
  console.log('Cache warmed successfully');
}

// Run on deployment
warmCache().catch(console.error);
```

### Cache Stampede Prevention

```typescript
// Prevent multiple requests from fetching same data
const locks = new Map<string, Promise<any>>();

export async function getCachedWithLock<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Check cache
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  
  // Check if another request is already fetching
  if (locks.has(key)) {
    return locks.get(key)!;
  }
  
  // Create lock
  const promise = (async () => {
    try {
      const data = await fetcher();
      await redis.set(key, data, { ex: ttl });
      return data;
    } finally {
      locks.delete(key);
    }
  })();
  
  locks.set(key, promise);
  return promise;
}
```

### Layered Caching

```typescript
// Multiple cache layers
export async function getProductLayered(id: string) {
  // Layer 1: In-memory cache (fastest)
  const memoryKey = `product:${id}`;
  if (memoryCache.has(memoryKey)) {
    return memoryCache.get(memoryKey);
  }
  
  // Layer 2: Redis cache (fast)
  const redisKey = `product:${id}`;
  const cached = await redis.get(redisKey);
  if (cached) {
    memoryCache.set(memoryKey, cached);
    return cached;
  }
  
  // Layer 3: Database (slow)
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  // Populate caches
  if (data) {
    await redis.set(redisKey, data, { ex: 3600 });
    memoryCache.set(memoryKey, data);
  }
  
  return data;
}
```

## 14.9 Cache Monitoring

### Cache Metrics

```typescript
// Track cache performance
export class CacheMetrics {
  private hits = 0;
  private misses = 0;
  
  recordHit() {
    this.hits++;
  }
  
  recordMiss() {
    this.misses++;
  }
  
  getHitRate() {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }
  
  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
      total: this.hits + this.misses
    };
  }
}

export const cacheMetrics = new CacheMetrics();

// Usage
export async function getCachedWithMetrics<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await redis.get<T>(key);
  
  if (cached !== null) {
    cacheMetrics.recordHit();
    return cached;
  }
  
  cacheMetrics.recordMiss();
  const data = await fetcher();
  await redis.set(key, data, { ex: ttl });
  
  return data;
}

// Metrics endpoint
export async function GET() {
  return NextResponse.json(cacheMetrics.getStats());
}
```

## 14.10 Best Practices

### What to Cache

✅ **Good candidates:**
- Product listings
- Category data
- User profiles
- Static content
- Computed values (expensive calculations)
- External API responses

❌ **Bad candidates:**
- Shopping cart (changes frequently)
- Real-time inventory
- User sessions (security risk)
- Personalized content
- Financial transactions

### Cache Key Design

```typescript
// Good cache key patterns
const cacheKeys = {
  // Specific
  product: (id: string) => `product:${id}`,
  products: (category?: string) => 
    category ? `products:category:${category}` : 'products:all',
  
  // With version
  productV2: (id: string) => `v2:product:${id}`,
  
  // With user context
  userCart: (userId: string) => `cart:user:${userId}`,
  
  // With filters
  productSearch: (query: string, filters: any) =>
    `products:search:${query}:${JSON.stringify(filters)}`
};
```

### TTL Guidelines

```typescript
const ttlConfig = {
  // Very stable data
  categories: 86400, // 24 hours
  
  // Moderately stable
  products: 3600, // 1 hour
  
  // Frequently changing
  inventory: 300, // 5 minutes
  
  // Real-time (short cache to reduce load)
  cart: 60, // 1 minute
  
  // Computed values
  analytics: 1800 // 30 minutes
};
```

## 14.11 Key Takeaways

- **Caching dramatically improves performance**
- **Multiple cache layers** (browser, CDN, Redis, database)
- **Cache invalidation** is the hardest part
- **TTL** balances freshness and performance
- **HTTP caching** reduces server load
- **Monitor cache hit rates** to optimize
- **Cache keys** should be specific and versioned

## Next Module Preview

In Module 15, we'll bring everything together with a Final Project Integration - building a complete feature using all the concepts you've learned!
