# Module 5: Supabase Ecosystem

Master the complete Supabase platform - your all-in-one backend solution!

## What You'll Learn

- Supabase query builder mastery
- Row Level Security (RLS) policies
- Real-time subscriptions
- File storage and transformations
- Database functions and triggers
- Advanced querying techniques

## Why Supabase?

Traditional backend requires building:
- Database setup
- Authentication system
- File storage
- Real-time features
- API endpoints
- Security layer

Supabase provides all of this out of the box!

## Quick Start

1. **[Complete Setup Guide](./SUPABASE-SETUP.md)** - Full 45-minute setup (start here!)
2. **[Quick Start](./QUICK-START.md)** - 15-minute feature overview
3. Work through exercises progressively
4. Test real-time features live

## Structure

- `SUPABASE-SETUP.md` - **Complete setup guide (start here!)**
- `QUICK-START.md` - Quick feature overview
- `exercises/` - Hands-on RLS, real-time, storage
- `theory/` - Deep dives into concepts
- `examples/` - Production patterns
- `supabase-reference.md` - Quick API reference

## Prerequisites

- Completed Module 4 (Authentication)
- Supabase project configured
- Basic SQL knowledge
- Understanding of database relationships

## Learning Path

1. **Exercise 01**: Query builder mastery
2. **Exercise 02**: Row Level Security policies
3. **Exercise 03**: Real-time subscriptions
4. **Exercise 04**: File storage and uploads
5. **Exercise 05**: Database functions
6. **Exercise 06**: Complete feature integration

## Key Concepts

### Direct Database Access
```typescript
// Frontend queries database directly (securely!)
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId);
```

### Row Level Security
```sql
-- Database enforces permissions
CREATE POLICY "Users see own data"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);
```

### Real-time
```typescript
// Listen to database changes
supabase
  .channel('products')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' },
    (payload) => console.log(payload)
  )
  .subscribe();
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Guide](https://supabase.com/docs/guides/realtime)
- [Storage Guide](https://supabase.com/docs/guides/storage)

Let's master Supabase! 🚀
