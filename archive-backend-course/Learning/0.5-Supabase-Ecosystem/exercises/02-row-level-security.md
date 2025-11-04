# Exercise 02: Row Level Security (RLS)

Implement database-level security with Row Level Security policies.

## Learning Objectives

- Understand RLS concepts
- Create security policies
- Implement user-specific data access
- Handle role-based permissions
- Test RLS policies

## Part 1: RLS Basics (15 minutes)

### Task 1.1: Enable RLS

```sql
-- Enable RLS on table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Task 1.2: Create Basic Policies

```sql
-- Public read access
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (true);

-- Authenticated users only
CREATE POLICY "Authenticated users can view orders"
ON orders FOR SELECT
USING (auth.role() = 'authenticated');

-- Own data only
CREATE POLICY "Users can view own cart"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);
```

## Part 2: CRUD Policies (20 minutes)

### Task 2.1: Cart Items Policies

```sql
-- Users can view own cart items
CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to own cart
CREATE POLICY "Users can add to own cart"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own cart items
CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own cart items
CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
```

### Task 2.2: Test RLS Policies

```typescript
// This automatically filters to current user's cart
const { data: cartItems } = await supabase
  .from('cart_items')
  .select('*, product:products(*)');

// User can't access other users' carts - RLS prevents it!
const { data, error } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', 'other-user-id'); // Returns empty or error
```

## Part 3: Role-Based Policies (20 minutes)

### Task 3.1: Admin Access

```sql
-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Admins can update all products
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### Task 3.2: Combined Policies

```sql
-- Users can view own orders OR admins can view all
CREATE POLICY "Users and admins can view orders"
ON orders FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

## Part 4: Advanced Patterns (15 minutes)

### Task 4.1: Time-Based Access

```sql
-- Only show active products
CREATE POLICY "Show active products only"
ON products FOR SELECT
USING (
  status = 'active' AND
  (published_at IS NULL OR published_at <= NOW())
);
```

### Task 4.2: Conditional Updates

```sql
-- Users can only update draft orders
CREATE POLICY "Users can update draft orders"
ON orders FOR UPDATE
USING (
  auth.uid() = user_id AND
  status = 'draft'
);
```

## Challenges

### Challenge 1: Review Policies
Create RLS policies for product reviews (users can edit own reviews).

### Challenge 2: Organization Access
Implement multi-tenant RLS for organization-based data.

### Challenge 3: Sharing Permissions
Allow users to share cart items with others.

### Challenge 4: Audit Policies
Create policies that log all admin actions.

### Challenge 5: Complex Permissions
Implement policies with multiple conditions and roles.

## Key Takeaways

- RLS enforces security at database level
- Policies can't be bypassed from client
- Use USING for read, WITH CHECK for write
- Test policies thoroughly
- Combine policies with OR logic
- Always enable RLS on sensitive tables

## Next Exercise

Continue to Exercise 03 for Real-time Subscriptions!
