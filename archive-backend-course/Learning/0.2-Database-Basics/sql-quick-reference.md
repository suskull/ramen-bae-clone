# 📖 SQL Quick Reference

A cheat sheet for common SQL operations.

## Table Operations

### Create Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) CHECK (price > 0),
  inventory INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Alter Table
```sql
-- Add column
ALTER TABLE products ADD COLUMN description TEXT;

-- Drop column
ALTER TABLE products DROP COLUMN description;

-- Rename column
ALTER TABLE products RENAME COLUMN name TO product_name;

-- Add constraint
ALTER TABLE products ADD CONSTRAINT unique_name UNIQUE (name);
```

### Drop Table
```sql
DROP TABLE products;
DROP TABLE IF EXISTS products;  -- No error if doesn't exist
DROP TABLE products CASCADE;     -- Delete dependent objects too
```

---

## CRUD Operations

### INSERT
```sql
-- Single row
INSERT INTO products (name, price) VALUES ('Ramen Mix', 15.99);

-- Multiple rows
INSERT INTO products (name, price) VALUES
  ('Spicy Mix', 17.99),
  ('Classic Mix', 12.99);

-- Return inserted data
INSERT INTO products (name, price) 
VALUES ('New Product', 19.99)
RETURNING *;

-- Insert from SELECT
INSERT INTO products_backup 
SELECT * FROM products WHERE price > 10;
```

### SELECT
```sql
-- All columns
SELECT * FROM products;

-- Specific columns
SELECT name, price FROM products;

-- With alias
SELECT name AS product_name, price AS cost FROM products;

-- Distinct values
SELECT DISTINCT category FROM products;

-- Limit results
SELECT * FROM products LIMIT 10;

-- Skip rows (pagination)
SELECT * FROM products LIMIT 10 OFFSET 20;
```

### UPDATE
```sql
-- Update single row
UPDATE products SET price = 16.99 WHERE id = 'uuid';

-- Update multiple columns
UPDATE products 
SET price = 16.99, inventory = 100 
WHERE id = 'uuid';

-- Update with calculation
UPDATE products SET price = price * 1.1;

-- Return updated data
UPDATE products SET price = 20.00 
WHERE name = 'Ramen Mix'
RETURNING *;
```

### DELETE
```sql
-- Delete specific rows
DELETE FROM products WHERE price < 10;

-- Delete all rows
DELETE FROM products;

-- Return deleted data
DELETE FROM products WHERE id = 'uuid' RETURNING *;
```

---

## WHERE Clause

### Comparison Operators
```sql
SELECT * FROM products WHERE price = 15.99;   -- Equal
SELECT * FROM products WHERE price != 15.99;  -- Not equal
SELECT * FROM products WHERE price > 15.99;   -- Greater than
SELECT * FROM products WHERE price >= 15.99;  -- Greater or equal
SELECT * FROM products WHERE price < 15.99;   -- Less than
SELECT * FROM products WHERE price <= 15.99;  -- Less or equal
```

### Logical Operators
```sql
-- AND
SELECT * FROM products WHERE price > 10 AND inventory > 0;

-- OR
SELECT * FROM products WHERE price < 10 OR price > 50;

-- NOT
SELECT * FROM products WHERE NOT (price > 20);

-- IN
SELECT * FROM products WHERE category IN ('Mixes', 'Toppings');

-- BETWEEN
SELECT * FROM products WHERE price BETWEEN 10 AND 20;

-- IS NULL
SELECT * FROM products WHERE description IS NULL;

-- IS NOT NULL
SELECT * FROM products WHERE description IS NOT NULL;
```

### Pattern Matching
```sql
-- LIKE (case-sensitive)
SELECT * FROM products WHERE name LIKE '%Ramen%';
SELECT * FROM products WHERE name LIKE 'Spicy%';   -- Starts with
SELECT * FROM products WHERE name LIKE '%Mix';     -- Ends with

-- ILIKE (case-insensitive)
SELECT * FROM products WHERE name ILIKE '%ramen%';

-- Wildcards
-- % = any characters
-- _ = single character
SELECT * FROM products WHERE name LIKE 'R_men';
```

---

## ORDER BY

```sql
-- Ascending (default)
SELECT * FROM products ORDER BY price;
SELECT * FROM products ORDER BY price ASC;

-- Descending
SELECT * FROM products ORDER BY price DESC;

-- Multiple columns
SELECT * FROM products ORDER BY category ASC, price DESC;

-- NULL handling
SELECT * FROM products ORDER BY description NULLS FIRST;
SELECT * FROM products ORDER BY description NULLS LAST;
```

---

## Aggregate Functions

```sql
-- Count rows
SELECT COUNT(*) FROM products;
SELECT COUNT(description) FROM products;  -- Non-NULL only

-- Sum
SELECT SUM(price) FROM products;

-- Average
SELECT AVG(price) FROM products;

-- Min/Max
SELECT MIN(price), MAX(price) FROM products;

-- Multiple aggregates
SELECT 
  COUNT(*) as total,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price
FROM products;
```

---

## GROUP BY

```sql
-- Group by single column
SELECT category, COUNT(*) 
FROM products 
GROUP BY category;

-- Group by multiple columns
SELECT category, brand, COUNT(*) 
FROM products 
GROUP BY category, brand;

-- With aggregates
SELECT 
  category,
  COUNT(*) as product_count,
  AVG(price) as avg_price,
  SUM(inventory) as total_inventory
FROM products
GROUP BY category;

-- HAVING (filter groups)
SELECT category, COUNT(*) 
FROM products 
GROUP BY category
HAVING COUNT(*) > 5;
```

---

## JOINs

### INNER JOIN
```sql
SELECT p.name, c.name as category
FROM products p
INNER JOIN categories c ON p.category_id = c.id;
```

### LEFT JOIN
```sql
SELECT p.name, c.name as category
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

### RIGHT JOIN
```sql
SELECT p.name, c.name as category
FROM products p
RIGHT JOIN categories c ON p.category_id = c.id;
```

### FULL OUTER JOIN
```sql
SELECT p.name, c.name as category
FROM products p
FULL OUTER JOIN categories c ON p.category_id = c.id;
```

### Multiple JOINs
```sql
SELECT 
  p.name,
  c.name as category,
  r.rating
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id;
```

---

## Subqueries

### In WHERE
```sql
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

SELECT * FROM products
WHERE category_id IN (
  SELECT id FROM categories WHERE name = 'Mixes'
);
```

### In SELECT
```sql
SELECT 
  name,
  price,
  (SELECT AVG(price) FROM products) as avg_price
FROM products;
```

### In FROM
```sql
SELECT * FROM (
  SELECT name, price FROM products WHERE price > 10
) AS expensive_products;
```

---

## Common Table Expressions (CTEs)

```sql
-- Single CTE
WITH expensive_products AS (
  SELECT * FROM products WHERE price > 20
)
SELECT * FROM expensive_products;

-- Multiple CTEs
WITH 
  expensive AS (SELECT * FROM products WHERE price > 20),
  cheap AS (SELECT * FROM products WHERE price < 10)
SELECT * FROM expensive
UNION ALL
SELECT * FROM cheap;

-- Recursive CTE
WITH RECURSIVE numbers AS (
  SELECT 1 as n
  UNION ALL
  SELECT n + 1 FROM numbers WHERE n < 10
)
SELECT * FROM numbers;
```

---

## Window Functions

```sql
-- ROW_NUMBER
SELECT 
  name,
  price,
  ROW_NUMBER() OVER (ORDER BY price DESC) as rank
FROM products;

-- RANK (with ties)
SELECT 
  name,
  price,
  RANK() OVER (ORDER BY price DESC) as rank
FROM products;

-- PARTITION BY
SELECT 
  name,
  category,
  price,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) as rank_in_category
FROM products;

-- LAG/LEAD
SELECT 
  name,
  price,
  LAG(price) OVER (ORDER BY created_at) as previous_price,
  LEAD(price) OVER (ORDER BY created_at) as next_price
FROM products;

-- Running total
SELECT 
  name,
  price,
  SUM(price) OVER (ORDER BY created_at) as running_total
FROM products;
```

---

## CASE Statements

```sql
-- Simple CASE
SELECT 
  name,
  price,
  CASE 
    WHEN price < 10 THEN 'Cheap'
    WHEN price < 20 THEN 'Medium'
    ELSE 'Expensive'
  END as price_category
FROM products;

-- CASE in WHERE
SELECT * FROM products
WHERE CASE 
  WHEN category = 'Mixes' THEN price > 10
  ELSE price > 5
END;
```

---

## String Functions

```sql
-- Concatenation
SELECT first_name || ' ' || last_name as full_name FROM users;
SELECT CONCAT(first_name, ' ', last_name) FROM users;

-- Upper/Lower case
SELECT UPPER(name) FROM products;
SELECT LOWER(name) FROM products;

-- Substring
SELECT SUBSTRING(name FROM 1 FOR 5) FROM products;

-- Length
SELECT LENGTH(name) FROM products;

-- Trim
SELECT TRIM(name) FROM products;

-- Replace
SELECT REPLACE(name, 'Ramen', 'Noodle') FROM products;
```

---

## Date/Time Functions

```sql
-- Current date/time
SELECT NOW();
SELECT CURRENT_DATE;
SELECT CURRENT_TIME;

-- Extract parts
SELECT EXTRACT(YEAR FROM created_at) FROM products;
SELECT EXTRACT(MONTH FROM created_at) FROM products;

-- Date arithmetic
SELECT created_at + INTERVAL '7 days' FROM products;
SELECT created_at - INTERVAL '1 month' FROM products;

-- Age
SELECT AGE(NOW(), created_at) FROM products;

-- Format
SELECT TO_CHAR(created_at, 'YYYY-MM-DD') FROM products;
```

---

## Indexes

```sql
-- Create index
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category_id);

-- Unique index
CREATE UNIQUE INDEX idx_products_slug ON products(slug);

-- Multi-column index
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Drop index
DROP INDEX idx_products_name;

-- List indexes
SELECT * FROM pg_indexes WHERE tablename = 'products';
```

---

## Constraints

```sql
-- Primary key
CREATE TABLE products (
  id UUID PRIMARY KEY
);

-- Foreign key
CREATE TABLE products (
  category_id UUID REFERENCES categories(id)
);

-- Unique
CREATE TABLE users (
  email TEXT UNIQUE
);

-- Not null
CREATE TABLE products (
  name TEXT NOT NULL
);

-- Check
CREATE TABLE products (
  price DECIMAL CHECK (price > 0)
);

-- Default
CREATE TABLE products (
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Transactions

```sql
-- Start transaction
BEGIN;

-- Execute queries
UPDATE products SET inventory = inventory - 1 WHERE id = 'uuid';
INSERT INTO orders (product_id) VALUES ('uuid');

-- Commit (save changes)
COMMIT;

-- Or rollback (undo changes)
ROLLBACK;
```

---

## Useful Queries

### Duplicate Detection
```sql
SELECT email, COUNT(*) 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Random Sample
```sql
SELECT * FROM products ORDER BY RANDOM() LIMIT 10;
```

### Pagination
```sql
SELECT * FROM products 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 40;  -- Page 3 (20 per page)
```

### Upsert (INSERT or UPDATE)
```sql
INSERT INTO products (id, name, price) 
VALUES ('uuid', 'Product', 15.99)
ON CONFLICT (id) 
DO UPDATE SET price = EXCLUDED.price;
```

### Copy Table
```sql
CREATE TABLE products_backup AS SELECT * FROM products;
```

---

## Performance Tips

1. **Use indexes** on frequently queried columns
2. **Avoid SELECT *** - specify columns you need
3. **Use LIMIT** when you don't need all results
4. **Use EXISTS** instead of COUNT(*) > 0
5. **Use EXPLAIN ANALYZE** to understand query performance
6. **Batch inserts** instead of individual INSERTs
7. **Use appropriate data types** (UUID vs TEXT, INTEGER vs BIGINT)

---

## Common Patterns

### Soft Delete
```sql
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP;
UPDATE products SET deleted_at = NOW() WHERE id = 'uuid';
SELECT * FROM products WHERE deleted_at IS NULL;
```

### Timestamps
```sql
CREATE TABLE products (
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Slugs
```sql
CREATE TABLE products (
  slug TEXT UNIQUE NOT NULL
);
CREATE INDEX idx_products_slug ON products(slug);
```

---

**Pro Tip**: Keep this reference handy while working through exercises! 📚
