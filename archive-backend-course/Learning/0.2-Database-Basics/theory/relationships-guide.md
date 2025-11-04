# 🔗 Database Relationships Guide

## Why Relationships Matter

Relationships connect related data across tables, avoiding duplication and maintaining data integrity.

**Bad (Duplicated Data):**
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title TEXT,
  author_name TEXT,
  author_email TEXT,
  author_bio TEXT
);
```

**Good (Normalized with Relationship):**
```sql
CREATE TABLE authors (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  bio TEXT
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title TEXT,
  author_id UUID REFERENCES authors(id)
);
```

## Types of Relationships

### 1. One-to-Many (Most Common)

One record relates to many records.

**Example: One category has many products**

```sql
-- Categories table (the "one")
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- Products table (the "many")
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id)
);
```

**Frontend Analogy:**
```javascript
const category = {
  id: 1,
  name: 'Ramen Mixes',
  products: [  // Array of related products
    { id: 1, name: 'Spicy Mix' },
    { id: 2, name: 'Classic Mix' }
  ]
};
```

**Query: Get all products in a category**
```sql
SELECT p.* 
FROM products p
WHERE p.category_id = 'category-uuid';
```

**Query: Get category with its products**
```sql
SELECT 
  c.name as category,
  p.name as product
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
WHERE c.id = 'category-uuid';
```

### 2. Many-to-Many

Many records relate to many other records. Requires a junction table.

**Example: Products can have multiple tags, tags can be on multiple products**

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

-- Junction table (connects products and tags)
CREATE TABLE product_tags (
  product_id UUID REFERENCES products(id),
  tag_id UUID REFERENCES tags(id),
  PRIMARY KEY (product_id, tag_id)
);
```

**Frontend Analogy:**
```javascript
const product = {
  id: 1,
  name: 'Spicy Mix',
  tags: ['spicy', 'vegetarian', 'gluten-free']
};

const tag = {
  id: 1,
  name: 'spicy',
  products: [1, 2, 5, 8]  // Multiple products
};
```

**Query: Get all tags for a product**
```sql
SELECT t.name
FROM tags t
INNER JOIN product_tags pt ON t.id = pt.tag_id
WHERE pt.product_id = 'product-uuid';
```

**Query: Get all products with a tag**
```sql
SELECT p.name
FROM products p
INNER JOIN product_tags pt ON p.id = pt.product_id
INNER JOIN tags t ON pt.tag_id = t.id
WHERE t.name = 'spicy';
```

### 3. One-to-One (Rare)

One record relates to exactly one other record.

**Example: User has one profile**

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  bio TEXT,
  avatar_url TEXT
);
```

**When to use:**
- Splitting large tables for performance
- Optional extended data
- Security (separate sensitive data)

## JOIN Operations

### INNER JOIN

Only returns rows where relationship exists in both tables.

```sql
-- Get posts with their authors (excludes posts without authors)
SELECT 
  p.title,
  a.name as author
FROM posts p
INNER JOIN authors a ON p.author_id = a.id;
```

**Frontend Analogy:**
```javascript
posts
  .filter(p => authors.some(a => a.id === p.authorId))
  .map(p => ({
    title: p.title,
    author: authors.find(a => a.id === p.authorId).name
  }));
```

### LEFT JOIN

Returns all rows from left table, with matching rows from right (or NULL).

```sql
-- Get all posts, with author if exists
SELECT 
  p.title,
  a.name as author
FROM posts p
LEFT JOIN authors a ON p.author_id = a.id;
```

**Use case:** Show all products, even those without categories.

### RIGHT JOIN

Returns all rows from right table, with matching rows from left (or NULL).

```sql
-- Get all authors, with their posts if any
SELECT 
  a.name,
  p.title
FROM posts p
RIGHT JOIN authors a ON p.author_id = a.id;
```

**Use case:** Show all categories, even empty ones.

### FULL OUTER JOIN

Returns all rows from both tables, with NULLs where no match.

```sql
-- Get all posts and all authors, matched where possible
SELECT 
  p.title,
  a.name
FROM posts p
FULL OUTER JOIN authors a ON p.author_id = a.id;
```

**Rarely used** - usually LEFT or RIGHT JOIN is clearer.

## Cascade Actions

What happens when you delete a parent record?

### ON DELETE CASCADE

Automatically delete child records:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE
);

-- Delete category → all its posts are deleted too
DELETE FROM categories WHERE id = 'category-uuid';
```

### ON DELETE SET NULL

Set foreign key to NULL:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Delete category → posts remain but category_id becomes NULL
DELETE FROM categories WHERE id = 'category-uuid';
```

### ON DELETE RESTRICT (Default)

Prevent deletion if child records exist:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT
);

-- Delete category → ERROR if posts exist
DELETE FROM categories WHERE id = 'category-uuid';
```

## Real-World Examples

### E-commerce Schema

```sql
-- One user has many orders
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  total DECIMAL(10,2) NOT NULL
);

-- One order has many items (one-to-many)
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL
);

-- Products and tags (many-to-many)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE product_tags (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

### Blog Schema

```sql
-- Authors and posts (one-to-many)
CREATE TABLE authors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES authors(id),
  title TEXT NOT NULL
);

-- Posts and comments (one-to-many)
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES authors(id),
  content TEXT NOT NULL
);

-- Nested comments (self-referencing)
ALTER TABLE comments 
ADD COLUMN parent_id UUID REFERENCES comments(id);
```

## Design Patterns

### Self-Referencing

Table references itself:

```sql
-- Comments can reply to other comments
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES comments(id),
  content TEXT NOT NULL
);

-- Get comment with its replies
SELECT 
  c1.content as comment,
  c2.content as reply
FROM comments c1
LEFT JOIN comments c2 ON c1.id = c2.parent_id;
```

### Polymorphic Relationships

One table relates to multiple tables:

```sql
-- Likes can be on posts OR comments
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  likeable_type TEXT NOT NULL,  -- 'post' or 'comment'
  likeable_id UUID NOT NULL
);
```

**Note:** This breaks referential integrity. Better to use separate tables:

```sql
CREATE TABLE post_likes (
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE comment_likes (
  user_id UUID REFERENCES users(id),
  comment_id UUID REFERENCES comments(id),
  PRIMARY KEY (user_id, comment_id)
);
```

## Best Practices

1. **Use foreign keys** - Enforce referential integrity
2. **Choose cascade actions carefully** - CASCADE for dependent data, RESTRICT for important data
3. **Index foreign keys** - Speed up JOIN queries
4. **Normalize data** - Avoid duplication
5. **Use junction tables** - For many-to-many relationships
6. **Name consistently** - `table_id` for foreign keys

## Common Mistakes

❌ **Storing arrays in columns**
```sql
-- Bad
CREATE TABLE posts (
  tags TEXT  -- 'spicy,vegetarian,gluten-free'
);
```

✅ **Use junction table**
```sql
-- Good
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id),
  tag_id UUID REFERENCES tags(id)
);
```

❌ **Duplicating data**
```sql
-- Bad
CREATE TABLE orders (
  user_email TEXT,
  user_name TEXT
);
```

✅ **Use foreign key**
```sql
-- Good
CREATE TABLE orders (
  user_id UUID REFERENCES users(id)
);
```

## Next Steps

- Practice with [Exercise 2: Relationships](../exercises/02-relationships.sql)
- Design your own schema
- Learn about [normalization](https://en.wikipedia.org/wiki/Database_normalization)

## Resources

- [PostgreSQL Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Database Normalization](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [JOIN Types Explained](https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/)
