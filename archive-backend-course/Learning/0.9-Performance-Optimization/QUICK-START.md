# Quick Start: Performance Optimization

Optimize your backend in 15 minutes!

## Performance Goals

- API response time < 300ms
- Database queries < 50ms
- Page load time < 2s
- Handle 100+ concurrent users

## Step 1: Database Indexing (3 minutes)

### Add Indexes to Frequently Queried Columns

```sql
-- Index foreign keys
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Index commonly filtered columns
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_products_category_price ON products(category_id, price);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### Check Query Performance

```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM products
WHERE category_id = 'abc-123'
AND price BETWEEN 10 AND 50;

-- Look for "Seq Scan" (bad) vs "Index Scan" (good)
```

## Step 2: Query Optimization (4 minutes)

### Select Only Needed Columns

```typescript
// ❌ SLOW - Fetches all columns
const { data } = await supabase.from('products').select('*');

// ✅ FAST - Only needed columns
const { data } = await supabase
  .from('products')
  .select('id, name, price, image_url');
```

### Use Pagination

```typescript
// ❌ SLOW - Loads everything
const { data } = await supabase.from('products').select('*');

// ✅ FAST - Paginated
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;

const { data } = await supabase
  .from('products')
  .select('*')
  .range(offset, offset + limit - 1);
```

### Avoid N+1 Queries

```typescript
// ❌ SLOW - N+1 queries
const { data: products } = await supabase.from('products').select('*');

for (const product of products) {
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', product.category_id)
    .single();
  // N queries!
}

// ✅ FAST - Single query with join
const { data: products } = await supabase.from('products').select(`
    *,
    category:categories(*)
  `);
```

## Step 3: Caching (4 minutes)

### API Route Caching

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const { data } = await supabase.from('products').select('*');

  return NextResponse.json(
    { products: data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    }
  );
}
```

### React Query Caching

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

export function ProductList() {
  const { data, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      return response.json();
    },
    staleTime: 60000, // Cache for 1 minute
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data.products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### Redis Caching (Advanced)

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function GET() {
  // Check cache first
  const cached = await redis.get('products');
  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch from database
  const { data } = await supabase.from('products').select('*');

  // Cache for 5 minutes
  await redis.set('products', data, { ex: 300 });

  return NextResponse.json({ products: data });
}
```

## Step 4: API Optimization (2 minutes)

### Parallel Requests

```typescript
// ❌ SLOW - Sequential
const { data: products } = await supabase.from('products').select('*');
const { data: categories } = await supabase.from('categories').select('*');
const { data: reviews } = await supabase.from('reviews').select('*');

// ✅ FAST - Parallel
const [
  { data: products },
  { data: categories },
  { data: reviews }
] = await Promise.all([
  supabase.from('products').select('*'),
  supabase.from('categories').select('*'),
  supabase.from('reviews').select('*'),
]);
```

### Streaming Responses

```typescript
// For large datasets
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      const { data } = await supabase.from('products').select('*');

      for (const product of data) {
        controller.enqueue(JSON.stringify(product) + '\n');
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' },
  });
}
```

## Step 5: Monitoring (2 minutes)

### Add Performance Logging

```typescript
export async function GET() {
  const start = Date.now();

  const { data } = await supabase.from('products').select('*');

  const duration = Date.now() - start;
  console.log(`Query took ${duration}ms`);

  if (duration > 100) {
    console.warn('Slow query detected!');
  }

  return NextResponse.json({ products: data });
}
```

### Database Query Monitoring

```sql
-- Enable query logging in Supabase dashboard
-- View slow queries in Logs section

-- Or query pg_stat_statements
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Quick Wins

### 1. Add Database Indexes

```sql
-- Run these on your most queried tables
CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);
```

### 2. Enable Caching

```typescript
// Add to API routes
headers: {
  'Cache-Control': 'public, s-maxage=60'
}
```

### 3. Use Pagination

```typescript
// Always paginate lists
.range(offset, offset + limit - 1)
```

### 4. Select Specific Columns

```typescript
// Don't use SELECT *
.select('id, name, price')
```

### 5. Optimize Images

```typescript
// Use Supabase image transformations
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('image.jpg', {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover',
    },
  });
```

## Performance Testing

### Load Testing with k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/api/products');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

```bash
# Run load test
k6 run load-test.js
```

## Common Issues

**Slow Queries**
- Add indexes
- Use EXPLAIN ANALYZE
- Optimize joins
- Add pagination

**High Memory Usage**
- Limit result sets
- Use streaming for large data
- Implement pagination

**Slow API Responses**
- Enable caching
- Optimize database queries
- Use CDN for static assets
- Implement compression

## Performance Checklist

- [ ] Database indexes on foreign keys
- [ ] Indexes on frequently filtered columns
- [ ] Pagination on all lists
- [ ] Select only needed columns
- [ ] Caching headers on API routes
- [ ] Parallel requests where possible
- [ ] Image optimization
- [ ] Query performance monitoring
- [ ] Load testing completed

## Resources

- [Database Performance](https://use-the-index-luke.com/)
- [Web Performance](https://web.dev/performance/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)

Let's build fast backends! ⚡
