# Module 2: Database Basics - Exercise Solutions

## 📚 Exercise Set 1: Basic SQL Operations (CRUD)

### Solution 1.1: Create Your First Table

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Points:**
- `NOT NULL` ensures required fields
- `DEFAULT` provides automatic values
- `UUID` is better than integers for distributed systems

---

### Solution 1.2: Insert Data

```sql
INSERT INTO posts (title, content, author, published) VALUES
('Getting Started with SQL', 'SQL is a powerful language for managing data...', 'Alice Johnson', true),
('Understanding Databases', 'Databases are essential for modern applications...', 'Bob Smith', false),
('Advanced Query Techniques', 'Learn how to write complex queries...', 'Alice Johnson', true);
```

**Challenge Answer:**
```sql
-- This will fail with an error
INSERT INTO posts (content, author) VALUES
('Some content', 'Charlie');
-- ERROR: null value in column "title" violates not-null constraint
```

---

### Solution 1.3: Read Data

```sql
-- Query 1: All published posts
SELECT * FROM posts WHERE published = true;

-- Query 2: Posts by specific author
SELECT * FROM posts WHERE author = 'Alice Johnson';

-- Query 3: 5 most recent posts
SELECT * FROM posts 
ORDER BY created_at DESC 
LIMIT 5;

-- Query 4: Count published vs unpublished
SELECT 
  published,
  COUNT(*) as count
FROM posts
GROUP BY published;
```

