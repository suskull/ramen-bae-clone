# Exercise 05: Database Functions

Create and use PostgreSQL functions with Supabase.

## Learning Objectives

- Create database functions
- Call functions from TypeScript
- Use functions for complex queries
- Implement business logic in database
- Optimize with functions

## Part 1: Simple Functions (15 minutes)

### Task 1.1: Create Function

```sql
CREATE OR REPLACE FUNCTION get_product_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM products;
$$ LANGUAGE SQL;
```

### Task 1.2: Call from TypeScript

```typescript
const { data, error } = await supabase.rpc('get_product_count');
console.log(`Total products: ${data}`);
```

## Part 2: Functions with Parameters (20 minutes)

### Task 2.1: Search Function

```sql
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price DECIMAL,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
      to_tsquery('english', search_term)
    ) AS rank
  FROM products p
  WHERE to_tsvector('english', p.name || ' ' || COALESCE(p.description, ''))
    @@ to_tsquery('english', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

```typescript
const { data } = await supabase.rpc('search_products', {
  search_term: 'spicy & ramen',
});
```

## Part 3: Complex Business Logic (20 minutes)

### Task 3.1: Order Total Calculation

```sql
CREATE OR REPLACE FUNCTION calculate_order_total(order_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'subtotal', COALESCE(SUM(oi.price * oi.quantity), 0),
    'tax', COALESCE(SUM(oi.price * oi.quantity), 0) * 0.08,
    'shipping', CASE
      WHEN COALESCE(SUM(oi.price * oi.quantity), 0) >= 50 THEN 0
      ELSE 5.99
    END,
    'total', COALESCE(SUM(oi.price * oi.quantity), 0) * 1.08 +
      CASE
        WHEN COALESCE(SUM(oi.price * oi.quantity), 0) >= 50 THEN 0
        ELSE 5.99
      END
  ) INTO result
  FROM order_items oi
  WHERE oi.order_id = calculate_order_total.order_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## Part 4: Triggers and Functions (15 minutes)

### Task 4.1: Auto-Update Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Task 4.2: Inventory Management

```sql
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET inventory = inventory - quantity
  WHERE id = product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  IF (SELECT inventory FROM products WHERE id = product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient inventory';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

## Challenges

### Challenge 1: User Statistics
Create function to get user stats (orders, reviews, etc.).

### Challenge 2: Product Recommendations
Build recommendation algorithm in database.

### Challenge 3: Inventory Alerts
Function to check low stock products.

### Challenge 4: Sales Report
Generate sales report for date range.

### Challenge 5: Data Migration
Create function to migrate old data format.

## Key Takeaways

- Functions run on database server
- Use for complex queries
- Better performance than multiple queries
- Can enforce business logic
- Use LANGUAGE plpgsql for complex logic
- Always handle errors

## Next Exercise

Continue to Exercise 06 for Complete Integration!
