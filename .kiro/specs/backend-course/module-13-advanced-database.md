# Module 13: Advanced Database Concepts (Mastering Data Management)

## Learning Objectives
- Understand database transactions
- Implement full-text search
- Use database triggers and functions
- Optimize complex queries
- Handle concurrent operations

## 13.1 Database Transactions

### What are Transactions?

**Frontend analogy:**
```javascript
// Like a batch of state updates that either all succeed or all fail
setState(prev => {
  // If any of these fail, none should apply
  const newCart = addItem(prev.cart, item);
  const newInventory = decrementInventory(prev.inventory, item);
  const newTotal = calculateTotal(newCart);
  
  return { cart: newCart, inventory: newInventory, total: newTotal };
});
```

**Database transactions:**
```sql
BEGIN;
  -- All or nothing
  INSERT INTO orders (user_id, total) VALUES ('user123', 29.99);
  INSERT INTO order_items (order_id, product_id) VALUES ('ord123', 'prod456');
  UPDATE products SET inventory = inventory - 1 WHERE id = 'prod456';
COMMIT;
-- If any step fails, everything rolls back
```

### ACID Properties

**Atomicity**: All or nothing
**Consistency**: Data stays valid
**Isolation**: Transactions don't interfere
**Durability**: Changes are permanent

### Implementing Transactions

```typescript
// lib/transactions.ts
export async function createOrderTransaction(
  userId: string,
  cartItems: CartItem[]
) {
  // Start transaction
  const { data, error } = await supabase.rpc('create_order_transaction', {
    p_user_id: userId,
    p_cart_items: cartItems
  });
  
  if (error) throw error;
  return data;
}
```

```sql
-- Database function with transaction
CREATE OR REPLACE FUNCTION create_order_transaction(
  p_user_id UUID,
  p_cart_items JSONB
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product RECORD;
  v_total DECIMAL;
BEGIN
  -- Start transaction (implicit in function)
  
  -- 1. Create order
  INSERT INTO orders (user_id, status)
  VALUES (p_user_id, 'pending')
  RETURNING id INTO v_order_id;
  
  v_total := 0;
  
  -- 2. Process each cart item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_cart_items)
  LOOP
    -- Get product
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'product_id')::UUID
    FOR UPDATE; -- Lock row
    
    -- Check inventory
    IF v_product.inventory < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', v_product.name;
    END IF;
    
    -- Create order item
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (
      v_order_id,
      v_product.id,
      (v_item->>'quantity')::INTEGER,
      v_product.price
    );
    
    -- Update inventory
    UPDATE products
    SET inventory = inventory - (v_item->>'quantity')::INTEGER
    WHERE id = v_product.id;
    
    -- Add to total
    v_total := v_total + (v_product.price * (v_item->>'quantity')::INTEGER);
  END LOOP;
  
  -- 3. Update order total
  UPDATE orders
  SET total = v_total, status = 'confirmed'
  WHERE id = v_order_id;
  
  -- 4. Clear cart
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  -- Return order
  RETURN json_build_object(
    'order_id', v_order_id,
    'total', v_total
  );
  
  -- Transaction commits automatically if no errors
  -- Rolls back automatically if any error occurs
END;
$$ LANGUAGE plpgsql;
```

## 13.2 Full-Text Search

### Basic Text Search

```sql
-- Create full-text search index
CREATE INDEX idx_products_search ON products
USING GIN(to_tsvector('english', name || ' ' || description));

-- Search query
SELECT *
FROM products
WHERE to_tsvector('english', name || ' ' || description)
      @@ to_tsquery('english', 'spicy & ramen');
```

### Implementing Search API

```typescript
// app/api/search/route.ts
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  
  // Full-text search
  const { data: products } = await supabase.rpc('search_products', {
    search_query: query
  });
  
  return NextResponse.json({ results: products });
}
```

```sql
-- Search function with ranking
CREATE OR REPLACE FUNCTION search_products(search_query TEXT)
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
    ts_rank(
      to_tsvector('english', p.name || ' ' || p.description),
      to_tsquery('english', search_query)
    ) as rank
  FROM products p
  WHERE to_tsvector('english', p.name || ' ' || p.description)
        @@ to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

### Advanced Search with Filters

```typescript
// Search with filters
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const category = request.nextUrl.searchParams.get('category');
  const minPrice = request.nextUrl.searchParams.get('minPrice');
  const maxPrice = request.nextUrl.searchParams.get('maxPrice');
  
  let dbQuery = supabase
    .from('products')
    .select('*');
  
  // Full-text search
  if (query) {
    dbQuery = dbQuery.textSearch('name,description', query);
  }
  
  // Filters
  if (category) {
    dbQuery = dbQuery.eq('category_id', category);
  }
  if (minPrice) {
    dbQuery = dbQuery.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    dbQuery = dbQuery.lte('price', parseFloat(maxPrice));
  }
  
  const { data: products } = await dbQuery;
  
  return NextResponse.json({ results: products });
}
```

## 13.3 Database Triggers

### Automatic Timestamp Updates

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on products table
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Audit Log Trigger

```sql
-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to products table
CREATE TRIGGER products_audit
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger();
```

### Inventory Alert Trigger

```sql
-- Trigger for low inventory alerts
CREATE OR REPLACE FUNCTION check_low_inventory()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inventory < 10 AND OLD.inventory >= 10 THEN
    -- Insert into alerts table
    INSERT INTO alerts (type, message, product_id)
    VALUES (
      'low_inventory',
      'Product ' || NEW.name || ' has low inventory: ' || NEW.inventory,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER low_inventory_alert
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_low_inventory();
```

## 13.4 Advanced Queries

### Window Functions

```sql
-- Rank products by sales within each category
SELECT
  p.name,
  p.category_id,
  COUNT(oi.id) as sales_count,
  RANK() OVER (
    PARTITION BY p.category_id
    ORDER BY COUNT(oi.id) DESC
  ) as rank_in_category
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.category_id
ORDER BY p.category_id, rank_in_category;
```

### Common Table Expressions (CTEs)

```sql
-- Calculate customer lifetime value
WITH customer_orders AS (
  SELECT
    user_id,
    COUNT(*) as order_count,
    SUM(total) as total_spent
  FROM orders
  WHERE status = 'completed'
  GROUP BY user_id
),
customer_segments AS (
  SELECT
    user_id,
    order_count,
    total_spent,
    CASE
      WHEN total_spent > 500 THEN 'VIP'
      WHEN total_spent > 200 THEN 'Regular'
      ELSE 'New'
    END as segment
  FROM customer_orders
)
SELECT
  segment,
  COUNT(*) as customer_count,
  AVG(total_spent) as avg_spent,
  AVG(order_count) as avg_orders
FROM customer_segments
GROUP BY segment;
```

### Recursive Queries

```sql
-- Category hierarchy (parent-child relationships)
WITH RECURSIVE category_tree AS (
  -- Base case: top-level categories
  SELECT id, name, parent_id, 1 as level
  FROM categories
  WHERE parent_id IS NULL
  
  UNION ALL
  
  -- Recursive case: child categories
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, name;
```

## 13.5 Query Optimization

### EXPLAIN ANALYZE

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
-- - Seq Scan (bad) vs Index Scan (good)
-- - High execution time
-- - Large number of rows
```

### Creating Optimal Indexes

```sql
-- Single column index
CREATE INDEX idx_products_price ON products(price);

-- Composite index (order matters!)
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Partial index (for specific conditions)
CREATE INDEX idx_active_products ON products(created_at)
WHERE deleted_at IS NULL;

-- Expression index
CREATE INDEX idx_products_lower_name ON products(LOWER(name));
```

### Query Rewriting

```typescript
// ❌ BAD: N+1 query
const products = await supabase.from('products').select('*');
for (const product of products) {
  const reviews = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id);
  product.reviews = reviews;
}

// ✅ GOOD: Single query with join
const products = await supabase
  .from('products')
  .select(`
    *,
    reviews(*)
  `);
```

## 13.6 Concurrency Control

### Optimistic Locking

```typescript
// Using version numbers
export async function updateProduct(id: string, updates: any, version: number) {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      version: version + 1
    })
    .eq('id', id)
    .eq('version', version) // Only update if version matches
    .select()
    .single();
  
  if (!data) {
    throw new Error('Product was modified by another user');
  }
  
  return data;
}
```

### Pessimistic Locking

```sql
-- Lock row for update
BEGIN;

SELECT * FROM products
WHERE id = 'prod123'
FOR UPDATE; -- Locks the row

-- Other transactions wait here

UPDATE products
SET inventory = inventory - 1
WHERE id = 'prod123';

COMMIT; -- Releases lock
```

## 13.7 Database Functions

### Aggregation Functions

```sql
-- Calculate product statistics
CREATE OR REPLACE FUNCTION product_stats(product_uuid UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'avg_rating', COALESCE(AVG(rating), 0),
    'review_count', COUNT(*),
    'five_star_count', COUNT(*) FILTER (WHERE rating = 5),
    'one_star_count', COUNT(*) FILTER (WHERE rating = 1)
  )
  FROM reviews
  WHERE product_id = product_uuid;
$$ LANGUAGE SQL;

-- Usage
SELECT product_stats('prod-123');
```

### Business Logic Functions

```sql
-- Calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping(
  order_total DECIMAL,
  country_code TEXT
) RETURNS DECIMAL AS $$
BEGIN
  -- Free shipping over $50
  IF order_total >= 50 THEN
    RETURN 0;
  END IF;
  
  -- Country-specific rates
  CASE country_code
    WHEN 'US' THEN RETURN 5.99;
    WHEN 'CA' THEN RETURN 7.99;
    WHEN 'MX' THEN RETURN 9.99;
    ELSE RETURN 12.99;
  END CASE;
END;
$$ LANGUAGE plpgsql;
```

## 13.8 Materialized Views

### Creating Materialized Views

```sql
-- Expensive query that we want to cache
CREATE MATERIALIZED VIEW product_analytics AS
SELECT
  p.id,
  p.name,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT oi.id) as items_sold,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.price * oi.quantity) as total_revenue,
  AVG(r.rating) as avg_rating,
  COUNT(DISTINCT r.id) as review_count
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name;

-- Create index on materialized view
CREATE INDEX idx_product_analytics_revenue
ON product_analytics(total_revenue DESC);

-- Refresh materialized view (run periodically)
REFRESH MATERIALIZED VIEW product_analytics;
```

```typescript
// Query materialized view (fast!)
const { data } = await supabase
  .from('product_analytics')
  .select('*')
  .order('total_revenue', { ascending: false })
  .limit(10);
```

## 13.9 JSON Operations

### Querying JSONB Data

```sql
-- Products table with JSONB metadata
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT,
  metadata JSONB
);

-- Insert with JSON data
INSERT INTO products (name, metadata) VALUES
('Ramen Mix', '{"ingredients": ["noodles", "seasoning"], "allergens": ["wheat", "soy"]}');

-- Query JSON fields
SELECT * FROM products
WHERE metadata->>'organic' = 'true';

-- Query nested JSON
SELECT * FROM products
WHERE metadata->'nutrition'->>'calories' < '200';

-- Query JSON arrays
SELECT * FROM products
WHERE metadata->'allergens' ? 'wheat';

-- Update JSON fields
UPDATE products
SET metadata = jsonb_set(
  metadata,
  '{price_history}',
  metadata->'price_history' || '{"date": "2024-01-01", "price": 19.99}'::jsonb
)
WHERE id = 'prod123';
```

## 13.10 Key Takeaways

- **Transactions** ensure data consistency (all or nothing)
- **Full-text search** enables powerful search features
- **Triggers** automate database operations
- **Window functions** enable advanced analytics
- **Indexes** are crucial for query performance
- **Concurrency control** prevents data conflicts
- **Materialized views** cache expensive queries
- **JSONB** provides flexible schema

## Next Module Preview

In Module 14, we'll learn about Caching Strategies - how to make your application blazingly fast!
