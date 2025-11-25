# Quick Start: Advanced Database

Master advanced PostgreSQL features in 15 minutes!

## Step 1: Transactions (3 minutes)

### What are Transactions?

Transactions ensure multiple operations succeed or fail together (ACID properties).

### Basic Transaction

```sql
BEGIN;
  -- Deduct inventory
  UPDATE products
  SET inventory = inventory - 1
  WHERE id = 'product-123';

  -- Create order
  INSERT INTO orders (user_id, product_id, quantity)
  VALUES ('user-456', 'product-123', 1);

  -- If everything succeeds
COMMIT;

-- If anything fails
-- ROLLBACK;
```

### Using Transactions in Supabase

```typescript
// Supabase doesn't directly support transactions in client
// Use Edge Functions or Database Functions for transactions

// Database Function approach
CREATE OR REPLACE FUNCTION create_order_with_inventory(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_current_inventory INTEGER;
BEGIN
  -- Check inventory
  SELECT inventory INTO v_current_inventory
  FROM products
  WHERE id = p_product_id
  FOR UPDATE; -- Lock row

  IF v_current_inventory < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory';
  END IF;

  -- Update inventory
  UPDATE products
  SET inventory = inventory - p_quantity
  WHERE id = p_product_id;

  -- Create order
  INSERT INTO orders (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  RETURNING id INTO v_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id
  );
END;
$$ LANGUAGE plpgsql;
```

**Call from TypeScript**:

```typescript
const { data, error } = await supabase.rpc('create_order_with_inventory', {
  p_user_id: userId,
  p_product_id: productId,
  p_quantity: 2,
});
```

## Step 2: Triggers (4 minutes)

### Auto-Update Timestamps

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to table
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Auto-Create Profile on User Signup

```sql
-- Trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Update Product Rating on Review

```sql
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET average_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE product_id = NEW.product_id
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();
```

## Step 3: Full-Text Search (4 minutes)

### Add Search Column

```sql
-- Add tsvector column
ALTER TABLE products
ADD COLUMN search_vector tsvector;

-- Create index
CREATE INDEX products_search_idx
ON products USING GIN(search_vector);

-- Update search vector
UPDATE products
SET search_vector =
  to_tsvector('english', name || ' ' || COALESCE(description, ''));

-- Auto-update trigger
CREATE OR REPLACE FUNCTION products_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('english', NEW.name || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_trigger();
```

### Search Query

```sql
-- Basic search
SELECT *
FROM products
WHERE search_vector @@ to_tsquery('english', 'spicy & ramen');

-- Ranked search
SELECT *,
  ts_rank(search_vector, to_tsquery('english', 'spicy & ramen')) AS rank
FROM products
WHERE search_vector @@ to_tsquery('english', 'spicy & ramen')
ORDER BY rank DESC;
```

### Using in Supabase

```typescript
// Create database function
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.price,
    ts_rank(p.search_vector, to_tsquery('english', search_term)) AS rank
  FROM products p
  WHERE p.search_vector @@ to_tsquery('english', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

// Call from TypeScript
const { data } = await supabase.rpc('search_products', {
  search_term: 'spicy & ramen',
});
```

## Step 4: Database Functions (2 minutes)

### Calculate Order Total

```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS DECIMAL AS $$
  SELECT SUM(price * quantity)
  FROM order_items
  WHERE order_id = $1;
$$ LANGUAGE SQL;
```

### Get User Statistics

```sql
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(DISTINCT o.id),
    'total_spent', COALESCE(SUM(o.total), 0),
    'total_reviews', COUNT(DISTINCT r.id),
    'average_rating', COALESCE(AVG(r.rating), 0)
  ) INTO result
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  LEFT JOIN reviews r ON r.user_id = u.id
  WHERE u.id = user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

**Call from TypeScript**:

```typescript
const { data } = await supabase.rpc('get_user_stats', {
  user_id: userId,
});

console.log(data);
// {
//   total_orders: 5,
//   total_spent: 249.95,
//   total_reviews: 3,
//   average_rating: 4.5
// }
```

## Step 5: Complex Queries (2 minutes)

### Window Functions

```sql
-- Rank products by sales within each category
SELECT
  p.name,
  p.category_id,
  COUNT(oi.id) as sales,
  RANK() OVER (
    PARTITION BY p.category_id
    ORDER BY COUNT(oi.id) DESC
  ) as rank_in_category
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.category_id
ORDER BY p.category_id, rank_in_category;
```

### Common Table Expressions (CTEs)

```sql
-- Get top customers with their favorite products
WITH customer_orders AS (
  SELECT
    user_id,
    COUNT(*) as order_count,
    SUM(total) as total_spent
  FROM orders
  GROUP BY user_id
),
customer_favorites AS (
  SELECT
    o.user_id,
    p.name as favorite_product,
    COUNT(*) as purchase_count,
    ROW_NUMBER() OVER (
      PARTITION BY o.user_id
      ORDER BY COUNT(*) DESC
    ) as rn
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  GROUP BY o.user_id, p.id, p.name
)
SELECT
  u.email,
  co.order_count,
  co.total_spent,
  cf.favorite_product
FROM users u
JOIN customer_orders co ON co.user_id = u.id
JOIN customer_favorites cf ON cf.user_id = u.id AND cf.rn = 1
WHERE co.order_count >= 3
ORDER BY co.total_spent DESC;
```

## Advanced Patterns

### Recursive Queries (Category Tree)

```sql
-- Get all subcategories
WITH RECURSIVE category_tree AS (
  -- Base case
  SELECT id, name, parent_id, 1 as level
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, name;
```

### JSON Aggregation

```sql
-- Get products with reviews as JSON
SELECT
  p.id,
  p.name,
  json_agg(
    json_build_object(
      'rating', r.rating,
      'body', r.body,
      'user', r.user_id
    )
  ) as reviews
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.name;
```

### Materialized Views

```sql
-- Create materialized view for expensive query
CREATE MATERIALIZED VIEW product_stats AS
SELECT
  p.id,
  p.name,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT r.id) as review_count,
  AVG(r.rating) as average_rating,
  SUM(oi.quantity) as total_sold
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
LEFT JOIN reviews r ON r.product_id = p.id
GROUP BY p.id, p.name;

-- Create index
CREATE INDEX ON product_stats(order_count DESC);

-- Refresh periodically
REFRESH MATERIALIZED VIEW product_stats;
```

## Query Optimization

### Use EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE
SELECT * FROM products
WHERE category_id = 'abc-123'
AND price BETWEEN 10 AND 50;

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - Execution time
-- - Rows returned vs estimated
```

### Add Appropriate Indexes

```sql
-- Single column
CREATE INDEX idx_products_category ON products(category_id);

-- Composite index
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Partial index
CREATE INDEX idx_active_products ON products(id)
WHERE status = 'active';

-- GIN index for full-text search
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Use The Index, Luke](https://use-the-index-luke.com/)

Let's master databases! 🗄️
