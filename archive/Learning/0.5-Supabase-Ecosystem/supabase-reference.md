# Supabase Quick Reference

Complete reference for Supabase features and APIs.

## Query Builder

### Select Queries

```typescript
// Get all rows
const { data } = await supabase.from('products').select('*');

// Specific columns
const { data } = await supabase.from('products').select('id, name, price');

// With count
const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' });

// Single row
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();
```

### Filtering

```typescript
// Equal
.eq('column', 'value')

// Not equal
.neq('column', 'value')

// Greater than
.gt('price', 10)

// Greater than or equal
.gte('price', 10)

// Less than
.lt('price', 100)

// Less than or equal
.lte('price', 100)

// Like (case-sensitive)
.like('name', '%ramen%')

// iLike (case-insensitive)
.ilike('name', '%ramen%')

// In array
.in('category_id', ['id1', 'id2'])

// Is null
.is('deleted_at', null)

// Not null
.not('deleted_at', 'is', null)

// Text search
.textSearch('description', 'spicy')

// Multiple filters (AND)
.eq('category_id', 'abc')
.gte('price', 10)
.lte('price', 50)

// OR filters
.or('price.lt.10,price.gt.100')
```

### Ordering and Limiting

```typescript
// Order by
.order('created_at', { ascending: false })

// Multiple order
.order('category_id')
.order('price', { ascending: false })

// Limit
.limit(10)

// Range (pagination)
.range(0, 9) // First 10 items
.range(10, 19) // Next 10 items
```

### Joins (Relationships)

```typescript
// One-to-one
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*)
  `);

// One-to-many
const { data } = await supabase
  .from('products')
  .select(`
    *,
    reviews(*)
  `);

// Nested relationships
const { data } = await supabase
  .from('products')
  .select(`
    *,
    category:categories(*),
    reviews(
      *,
      user:profiles(name, avatar_url)
    )
  `);

// Filter nested
const { data } = await supabase
  .from('products')
  .select(`
    *,
    reviews!inner(rating)
  `)
  .gte('reviews.rating', 4);
```

## Insert, Update, Delete

### Insert

```typescript
// Single insert
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'New Product',
    price: 19.99,
  })
  .select();

// Multiple insert
const { data, error } = await supabase
  .from('products')
  .insert([
    { name: 'Product 1', price: 10 },
    { name: 'Product 2', price: 20 },
  ])
  .select();

// Upsert (insert or update)
const { data, error } = await supabase
  .from('products')
  .upsert({
    id: 'existing-id',
    name: 'Updated Name',
  })
  .select();
```

### Update

```typescript
// Update with filter
const { data, error } = await supabase
  .from('products')
  .update({ price: 24.99 })
  .eq('id', productId)
  .select();

// Update multiple
const { data, error } = await supabase
  .from('products')
  .update({ in_stock: false })
  .eq('inventory', 0)
  .select();
```

### Delete

```typescript
// Delete with filter
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);

// Delete multiple
const { error } = await supabase
  .from('products')
  .delete()
  .lt('created_at', '2023-01-01');
```

## Row Level Security (RLS)

### Enable RLS

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Policy Types

```sql
-- SELECT policy
CREATE POLICY "policy_name"
ON table_name FOR SELECT
USING (condition);

-- INSERT policy
CREATE POLICY "policy_name"
ON table_name FOR INSERT
WITH CHECK (condition);

-- UPDATE policy
CREATE POLICY "policy_name"
ON table_name FOR UPDATE
USING (condition)
WITH CHECK (condition);

-- DELETE policy
CREATE POLICY "policy_name"
ON table_name FOR DELETE
USING (condition);

-- ALL operations
CREATE POLICY "policy_name"
ON table_name FOR ALL
USING (condition)
WITH CHECK (condition);
```

### Common Patterns

```sql
-- Public read
CREATE POLICY "Public read access"
ON products FOR SELECT
USING (true);

-- Authenticated users only
CREATE POLICY "Authenticated users"
ON products FOR SELECT
USING (auth.role() = 'authenticated');

-- Own data only
CREATE POLICY "Users see own data"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Role-based
CREATE POLICY "Admins only"
ON products FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

## Real-time Subscriptions

### Subscribe to Changes

```typescript
// Subscribe to all changes
const channel = supabase
  .channel('table-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'products',
    },
    (payload) => {
      console.log('Change:', payload);
    }
  )
  .subscribe();

// Subscribe to specific events
.on('postgres_changes', { event: 'INSERT', ... }, callback)
.on('postgres_changes', { event: 'UPDATE', ... }, callback)
.on('postgres_changes', { event: 'DELETE', ... }, callback)

// Filter by column
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'products',
  filter: 'id=eq.123'
}, callback)

// Unsubscribe
supabase.removeChannel(channel);
```

### Payload Structure

```typescript
{
  eventType: 'INSERT' | 'UPDATE' | 'DELETE',
  new: { /* new row data */ },
  old: { /* old row data */ },
  schema: 'public',
  table: 'products',
  commit_timestamp: '2024-01-01T00:00:00Z'
}
```

## Storage

### Upload File

```typescript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('path/filename.jpg', file, {
    cacheControl: '3600',
    upsert: false,
  });
```

### Download File

```typescript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .download('path/filename.jpg');
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl('path/filename.jpg');

console.log(data.publicUrl);
```

### Image Transformations

```typescript
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl('path/image.jpg', {
    transform: {
      width: 400,
      height: 400,
      resize: 'cover',
      quality: 80,
    },
  });
```

### List Files

```typescript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
```

### Delete File

```typescript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .remove(['path/filename.jpg']);
```

### Storage Policies

```sql
-- Public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'bucket-name');

-- Authenticated upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bucket-name' AND
  auth.role() = 'authenticated'
);

-- Own files only
CREATE POLICY "Users manage own files"
ON storage.objects FOR ALL
USING (
  bucket_id = 'bucket-name' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Functions

### Call Function

```typescript
const { data, error } = await supabase.rpc('function_name', {
  param1: 'value1',
  param2: 'value2',
});
```

### Create Function

```sql
CREATE OR REPLACE FUNCTION function_name(param1 TEXT, param2 INT)
RETURNS TABLE (column1 TEXT, column2 INT) AS $$
BEGIN
  RETURN QUERY
  SELECT col1, col2
  FROM table_name
  WHERE condition;
END;
$$ LANGUAGE plpgsql;
```

## Error Handling

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*');

if (error) {
  console.error('Error:', error.message);
  console.error('Details:', error.details);
  console.error('Hint:', error.hint);
  console.error('Code:', error.code);
}
```

## Common Patterns

### Pagination

```typescript
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

const totalPages = Math.ceil(count / limit);
```

### Search

```typescript
const { data } = await supabase
  .from('products')
  .select('*')
  .or(`name.ilike.%${search}%,description.ilike.%${search}%`);
```

### Aggregation

```typescript
// Count
const { count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true });

// Using functions
const { data } = await supabase.rpc('get_stats');
```

## Performance Tips

1. **Select only needed columns**
2. **Use indexes for filtered columns**
3. **Implement pagination**
4. **Use RLS for security**
5. **Cache frequently accessed data**
6. **Batch operations when possible**
7. **Use database functions for complex queries**

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
