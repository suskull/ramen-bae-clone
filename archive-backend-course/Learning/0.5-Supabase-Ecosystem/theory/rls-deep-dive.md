# Row Level Security Deep Dive

Understanding RLS and how to use it effectively.

## What is RLS?

**Row Level Security** = Database-level permissions that filter rows based on user

**Frontend Analogy**: Like having automatic if statements in your database queries.

```javascript
// Frontend: Manual filtering (insecure)
const orders = allOrders.filter(order => order.userId === currentUser.id);

// RLS: Automatic filtering (secure)
const { data: orders } = await supabase.from('orders').select('*');
// Only returns current user's orders automatically!
```

## Why RLS?

### Without RLS

```typescript
// ❌ Insecure: User could modify query
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', currentUserId); // User could change this!
```

### With RLS

```typescript
// ✅ Secure: Database enforces filter
const { data } = await supabase
  .from('orders')
  .select('*');
// RLS automatically filters to current user
```

## Policy Types

### SELECT Policies (Read)

```sql
CREATE POLICY "policy_name"
ON table_name FOR SELECT
USING (condition);
```

**USING**: Determines which rows are visible

### INSERT Policies (Create)

```sql
CREATE POLICY "policy_name"
ON table_name FOR INSERT
WITH CHECK (condition);
```

**WITH CHECK**: Validates new rows before insert

### UPDATE Policies (Modify)

```sql
CREATE POLICY "policy_name"
ON table_name FOR UPDATE
USING (condition)        -- Which rows can be updated
WITH CHECK (condition);  -- Validates updated values
```

### DELETE Policies (Remove)

```sql
CREATE POLICY "policy_name"
ON table_name FOR DELETE
USING (condition);
```

## Common Patterns

### 1. Public Read

```sql
CREATE POLICY "public_read"
ON products FOR SELECT
USING (true);
```

### 2. Authenticated Only

```sql
CREATE POLICY "authenticated_only"
ON orders FOR SELECT
USING (auth.role() = 'authenticated');
```

### 3. Own Data Only

```sql
CREATE POLICY "own_data"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

### 4. Role-Based

```sql
CREATE POLICY "admin_access"
ON products FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### 5. Time-Based

```sql
CREATE POLICY "active_only"
ON products FOR SELECT
USING (
  status = 'active' AND
  published_at <= NOW()
);
```

### 6. Conditional Access

```sql
CREATE POLICY "draft_or_published"
ON posts FOR SELECT
USING (
  status = 'published' OR
  (status = 'draft' AND auth.uid() = author_id)
);
```

## Policy Combination

Multiple policies combine with OR logic:

```sql
-- Policy 1: Own data
CREATE POLICY "own_orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Admin access
CREATE POLICY "admin_orders"
ON orders FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Result: Users see own orders OR admins see all orders
```

## Helper Functions

### auth.uid()

Returns current user's ID:

```sql
USING (auth.uid() = user_id)
```

### auth.role()

Returns user's role:

```sql
USING (auth.role() = 'authenticated')
```

### auth.jwt()

Access JWT claims:

```sql
USING (auth.jwt() ->> 'email' = 'admin@example.com')
```

## Best Practices

### 1. Always Enable RLS

```sql
ALTER TABLE sensitive_table ENABLE ROW LEVEL SECURITY;
```

### 2. Test Policies

```typescript
// Test as different users
const { data } = await supabase.from('orders').select('*');
console.log('Visible orders:', data.length);
```

### 3. Use Specific Policies

```sql
-- ❌ Too broad
USING (true)

-- ✅ Specific
USING (auth.uid() = user_id)
```

### 4. Consider Performance

```sql
-- Add indexes for policy conditions
CREATE INDEX orders_user_id_idx ON orders(user_id);
```

### 5. Document Policies

```sql
COMMENT ON POLICY "own_orders" ON orders IS
  'Users can only view their own orders';
```

## Common Pitfalls

### 1. Forgetting to Enable RLS

```sql
-- ❌ Policies exist but RLS not enabled
CREATE POLICY "policy" ON table ...;

-- ✅ Enable RLS first
ALTER TABLE table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy" ON table ...;
```

### 2. No Policies = No Access

```sql
-- If RLS is enabled but no policies exist,
-- nobody can access the table (except table owner)
```

### 3. Policy Conflicts

```sql
-- ❌ Conflicting policies
USING (status = 'active')  -- Policy 1
USING (status = 'draft')   -- Policy 2
-- Result: No rows match both (AND logic within policy)

-- ✅ Use OR in single policy
USING (status IN ('active', 'draft'))
```

## Key Takeaways

- RLS enforces security at database level
- Policies can't be bypassed from client
- Multiple policies combine with OR
- Always enable RLS on sensitive tables
- Test policies thoroughly
- Consider performance implications
- Use helper functions (auth.uid(), etc.)
