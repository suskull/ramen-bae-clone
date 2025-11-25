# Module 9: Performance Optimization

Learn to build fast, scalable backend systems.

## What You'll Learn

- Database query optimization
- Caching strategies
- API performance optimization
- Load testing
- Profiling and monitoring
- Indexing strategies
- N+1 query prevention

## Why Performance Matters

Slow backends lead to:
- Poor user experience
- Lost customers
- Higher costs
- Scalability issues
- Competitive disadvantage

## Quick Start

1. Identify slow queries
2. Add database indexes
3. Implement caching
4. Measure improvements

## Structure

- `exercises/` - Optimize real code
- `theory/` - Performance concepts
- `examples/` - Optimization patterns
- `QUICK-START.md` - Quick wins
- `performance-reference.md` - Optimization guide

## Prerequisites

- Completed Module 6 (Edge Functions)
- Understanding of database queries
- Basic caching knowledge
- Profiling tools familiarity

## Learning Path

1. **Exercise 01**: Query optimization
2. **Exercise 02**: Database indexing
3. **Exercise 03**: Caching implementation
4. **Exercise 04**: API optimization
5. **Exercise 05**: Load testing
6. **Exercise 06**: Complete optimization

## Performance Metrics

### Response Time
- < 100ms: Excellent
- 100-300ms: Good
- 300-1000ms: Acceptable
- > 1000ms: Needs optimization

### Database Queries
- < 10ms: Excellent
- 10-50ms: Good
- 50-100ms: Acceptable
- > 100ms: Needs optimization

## Quick Wins

### Add Indexes
```sql
-- Speed up queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user ON orders(user_id);
```

### Use Select Specific Columns
```typescript
// ❌ Slow
const { data } = await supabase.from('products').select('*');

// ✅ Fast
const { data } = await supabase
  .from('products')
  .select('id, name, price');
```

### Implement Caching
```typescript
// Cache frequently accessed data
const cached = await redis.get('products');
if (cached) return JSON.parse(cached);

const { data } = await supabase.from('products').select('*');
await redis.set('products', JSON.stringify(data), 'EX', 3600);
```

### Pagination
```typescript
// Don't load everything at once
const { data } = await supabase
  .from('products')
  .select('*')
  .range(0, 19); // First 20 items
```

## Resources

- [Database Performance](https://use-the-index-luke.com/)
- [Web Performance](https://web.dev/performance/)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)

Let's build fast backends! ⚡
