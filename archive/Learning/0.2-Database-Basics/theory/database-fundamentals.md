# 📚 Database Fundamentals

## What is a Database?

A database is a structured collection of data that persists beyond your application's runtime. Think of it as permanent storage for your app's state.

### Frontend State vs Database

**Frontend State (Temporary)**
```javascript
// This disappears when user closes browser
const [products, setProducts] = useState([
  { id: 1, name: 'Ramen Mix', price: 15.99 }
]);
```

**Database (Permanent)**
```sql
-- This data survives server restarts
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

## Why Use Databases?

1. **Persistence**: Data survives application restarts
2. **Concurrency**: Multiple users can access simultaneously
3. **Integrity**: Built-in validation and constraints
4. **Relationships**: Connect related data efficiently
5. **Querying**: Powerful search and filtering
6. **Scalability**: Handle millions of records

## SQL vs NoSQL

### SQL Databases (Relational)

**Like TypeScript**: Structured and strict

```typescript
// TypeScript interface
interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
}
```

```sql
-- SQL table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id)
);
```

**When to use SQL:**
- E-commerce (products, orders, users)
- Banking (transactions, accounts)
- CRM systems (customers, contacts)
- Any app with complex relationships

**Examples:** PostgreSQL, MySQL, SQLite

### NoSQL Databases (Document/Key-Value)

**Like JavaScript objects**: Flexible structure

```javascript
// NoSQL document
{
  id: 1,
  name: 'Ramen Mix',
  price: 15.99,
  category: { name: 'Mixes', icon: '🍜' },
  tags: ['spicy', 'vegetarian'],
  metadata: { organic: true }
}
```

**When to use NoSQL:**
- Rapid prototyping
- Flexible schemas
- Real-time applications
- Horizontal scaling needs

**Examples:** MongoDB, Firebase, DynamoDB

## Database Concepts

### Tables

Tables store data in rows and columns, like a spreadsheet.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Columns (Fields)

Each column has a specific data type:

- `TEXT` / `VARCHAR`: Strings
- `INTEGER`: Whole numbers
- `DECIMAL` / `NUMERIC`: Precise decimals (for money)
- `BOOLEAN`: true/false
- `TIMESTAMP`: Date and time
- `UUID`: Unique identifier
- `JSONB`: JSON data

### Rows (Records)

Each row is one entry in the table:

```sql
INSERT INTO users (email, name) VALUES
('alice@example.com', 'Alice Johnson');
```

### Primary Keys

Unique identifier for each row:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);
```

**Why UUID over INTEGER?**
- Globally unique (works across distributed systems)
- Can't guess next ID (more secure)
- No collision when merging databases

### Foreign Keys

Link tables together:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES users(id),
  title TEXT NOT NULL
);
```

This ensures `author_id` must be a valid user ID.

## Data Integrity

### Constraints

Rules that ensure data quality:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,                    -- Required
  price DECIMAL(10,2) CHECK (price > 0), -- Must be positive
  email TEXT UNIQUE,                     -- No duplicates
  inventory INTEGER DEFAULT 0            -- Default value
);
```

### NOT NULL

Field must have a value:

```sql
CREATE TABLE users (
  email TEXT NOT NULL  -- Can't be empty
);
```

### UNIQUE

No duplicate values allowed:

```sql
CREATE TABLE users (
  email TEXT UNIQUE  -- Each email used once
);
```

### CHECK

Custom validation:

```sql
CREATE TABLE reviews (
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);
```

### DEFAULT

Automatic value if not provided:

```sql
CREATE TABLE posts (
  created_at TIMESTAMP DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE
);
```

## Indexes

Speed up queries by creating lookup tables:

```sql
-- Slow without index
SELECT * FROM products WHERE slug = 'spicy-ramen';

-- Create index
CREATE INDEX idx_products_slug ON products(slug);

-- Now fast!
SELECT * FROM products WHERE slug = 'spicy-ramen';
```

**Frontend analogy:**
```javascript
// Array search (slow)
products.find(p => p.slug === 'spicy-ramen');

// Map lookup (fast)
const productsBySlug = new Map(products.map(p => [p.slug, p]));
productsBySlug.get('spicy-ramen');
```

## Transactions

Group multiple operations together - all succeed or all fail:

```sql
BEGIN;
  UPDATE products SET inventory = inventory - 1 WHERE id = 'product-1';
  INSERT INTO orders (product_id, quantity) VALUES ('product-1', 1);
COMMIT;
```

If anything fails, everything rolls back.

## ACID Properties

What makes databases reliable:

- **Atomicity**: All or nothing
- **Consistency**: Data stays valid
- **Isolation**: Concurrent operations don't interfere
- **Durability**: Committed data is permanent

## Common Patterns

### Timestamps

Track when records are created/updated:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Soft Deletes

Mark as deleted instead of actually deleting:

```sql
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP;

-- "Delete"
UPDATE posts SET deleted_at = NOW() WHERE id = 'post-1';

-- Query only active
SELECT * FROM posts WHERE deleted_at IS NULL;
```

### Slugs

Human-readable URLs:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL  -- 'spicy-ramen-mix'
);

-- URL: /products/spicy-ramen-mix
```

## Best Practices

1. **Use UUIDs for IDs** - Better for distributed systems
2. **Always add timestamps** - Track when data changes
3. **Use constraints** - Validate at database level
4. **Index frequently queried columns** - Speed up searches
5. **Normalize data** - Avoid duplication (see relationships guide)
6. **Use transactions** - Keep data consistent
7. **Name consistently** - `snake_case` for columns, plural for tables

## Next Steps

- Read [Relationships Guide](relationships-guide.md)
- Practice with [Exercise 1: Basic CRUD](../exercises/01-basic-crud.sql)
- Build your first schema

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.sqltutorial.org/)
- [Database Design Guide](https://www.postgresql.org/docs/current/ddl.html)
