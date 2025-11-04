# Module 2: Database Basics - Practice Exercises

## 🎯 How to Use This Guide

Each exercise builds on the previous one. Start from Exercise 1 and work your way through. Solutions are provided at the end, but try to solve them yourself first!

**Setup Required:**
- Supabase account (free tier)
- Access to Supabase SQL Editor

---

## 📚 Exercise Set 1: Basic SQL Operations (CRUD)

### Exercise 1.1: Create Your First Table

**Scenario**: You're building a blog. Create a `posts` table.

**Requirements:**
- `id` (UUID, primary key)
- `title` (text, required)
- `content` (text, required)
- `author` (text, required)
- `published` (boolean, default false)
- `created_at` (timestamp)

**Your Task**: Write the SQL to create this table.

```sql
-- Write your CREATE TABLE statement here


```

**Hint**: Look at the products table example in Module 2.4

---

### Exercise 1.2: Insert Data

**Task**: Add 3 blog posts to your table.

```sql
-- Insert 3 posts here


```

**Challenge**: Try inserting a post without a title. What happens?

---

### Exercise 1.3: Read Data

Write queries to:

1. Get all published posts
2. Get all posts by a specific author
3. Get the 5 most recent posts
4. Count how many posts are published vs unpublished

```sql
-- Query 1: All published posts


-- Query 2: Posts by specific author


-- Query 3: 5 most recent posts


-- Query 4: Count published vs unpublished


```

---

### Exercise 1.4: Update Data

**Tasks:**
1. Publish a post (set published = true)
2. Update the title of a specific post
3. Update all unpublished posts to add "[DRAFT]" prefix to their titles

```sql
-- Task 1: Publish a post


-- Task 2: Update title


-- Task 3: Add [DRAFT] prefix


```

---

### Exercise 1.5: Delete Data

**Tasks:**
1. Delete a specific post by ID
2. Delete all unpublished posts older than 30 days

```sql
-- Task 1: Delete by ID


-- Task 2: Delete old drafts


```

---

## 📚 Exercise Set 2: Relationships & Joins

### Exercise 2.1: One-to-Many Relationship

**Scenario**: Add categories to your blog.

**Your Task**: 
1. Create a `categories` table
2. Add a foreign key to `posts` table
3. Insert some categories
4. Update posts to belong to categories

```sql
-- Step 1: Create categories table


-- Step 2: Add category_id to posts


-- Step 3: Insert categories


-- Step 4: Update posts with categories


```

---

### Exercise 2.2: Basic Joins

Write queries to:

1. Get all posts with their category names
2. Get all posts in the "Technology" category
3. Count how many posts are in each category

```sql
-- Query 1: Posts with category names


-- Query 2: Posts in Technology category


-- Query 3: Count posts per category


```

---

### Exercise 2.3: Many-to-Many Relationship

**Scenario**: Posts can have multiple tags, and tags can be on multiple posts.

**Your Task**:
1. Create a `tags` table
2. Create a `post_tags` junction table
3. Insert some tags
4. Associate posts with tags

```sql
-- Step 1: Create tags table


-- Step 2: Create junction table


-- Step 3: Insert tags


-- Step 4: Associate posts with tags


```

---

### Exercise 2.4: Complex Joins

Write queries to:

1. Get all tags for a specific post
2. Get all posts that have a specific tag
3. Find posts that have both "javascript" AND "tutorial" tags
4. Get the most popular tags (tags with most posts)

```sql
-- Query 1: Tags for a post


-- Query 2: Posts with a tag


-- Query 3: Posts with multiple specific tags


-- Query 4: Most popular tags


```

---

## 📚 Exercise Set 3: Database Design Challenges

### Exercise 3.1: E-commerce Order System

**Scenario**: Design a database for an order system.

**Requirements:**
- Customers can place orders
- Orders contain multiple products
- Track order status (pending, shipped, delivered)
- Track product inventory
- Calculate order totals

**Your Task**: Design the schema (tables and relationships)

```sql
-- Design your schema here
-- Think about: customers, orders, products, order_items


```

**Questions to consider:**
- How do you prevent overselling (inventory management)?
- How do you calculate order totals?
- What happens when a product is deleted?

---

### Exercise 3.2: Social Media Platform

**Scenario**: Design a simple social media database.

**Requirements:**
- Users can create posts
- Users can follow other users
- Users can like posts
- Users can comment on posts
- Comments can be nested (replies to comments)

**Your Task**: Design the schema

```sql
-- Design your schema here


```

**Bonus Challenge**: Write a query to get a user's feed (posts from people they follow)

---

### Exercise 3.3: Course Management System

**Scenario**: Design a database for an online learning platform.

**Requirements:**
- Courses have multiple modules
- Modules have multiple lessons
- Students can enroll in courses
- Track student progress (completed lessons)
- Instructors can teach multiple courses
- Courses can have multiple instructors

**Your Task**: Design the schema

```sql
-- Design your schema here


```

---

## 📚 Exercise Set 4: Advanced SQL Techniques

### Exercise 4.1: Aggregations and Analytics

Using your blog database, write queries to:

1. Calculate average post length (character count)
2. Find the most prolific author (most posts)
3. Get monthly post counts for the last 6 months
4. Find categories with average post length > 1000 characters

```sql
-- Query 1: Average post length


-- Query 2: Most prolific author


-- Query 3: Monthly post counts


-- Query 4: Categories with long posts


```

---

### Exercise 4.2: Subqueries

Write queries using subqueries:

1. Find posts longer than the average post length
2. Find authors who have written more than 5 posts
3. Find categories that have no posts
4. Find the second most recent post

```sql
-- Query 1: Posts longer than average


-- Query 2: Prolific authors


-- Query 3: Empty categories


-- Query 4: Second most recent post


```

---

### Exercise 4.3: Window Functions

**Advanced**: Use window functions to:

1. Rank posts by length within each category
2. Calculate running total of posts per author
3. Find the previous and next post for each post (by date)

```sql
-- Query 1: Rank posts by length


-- Query 2: Running total


-- Query 3: Previous and next post


```

---

## 📚 Exercise Set 5: Real-World Scenarios

### Exercise 5.1: Ramen Bae - Product Variants

**Scenario**: Add product variants to Ramen Bae (e.g., different sizes, flavors).

**Requirements:**
- A product can have multiple variants
- Each variant has its own price and inventory
- Variants have attributes (size: small/large, spice: mild/hot)

**Your Task**: Design and implement the schema

```sql
-- Design your schema here


```

---

### Exercise 5.2: Ramen Bae - Order History

**Scenario**: Implement order history for Ramen Bae.

**Requirements:**
- Users can view past orders
- Orders show products, quantities, and prices at time of purchase
- Track order status and shipping info
- Calculate order totals with tax and shipping

**Your Task**: 
1. Design the schema
2. Write a query to get a user's order history
3. Write a query to calculate monthly revenue

```sql
-- Schema


-- Query: User's order history


-- Query: Monthly revenue


```

---

### Exercise 5.3: Ramen Bae - Product Recommendations

**Scenario**: Implement "Customers also bought" feature.

**Requirements:**
- Track which products are frequently bought together
- Show recommendations based on current cart

**Your Task**:
1. Design how to track this data
2. Write a query to find products frequently bought with a specific product

```sql
-- Schema


-- Query: Products bought together


```

---

## 📚 Exercise Set 6: Performance & Optimization

### Exercise 6.1: Identify Slow Queries

**Scenario**: Your blog is slow. Analyze these queries:

```sql
-- Query A
SELECT * FROM posts WHERE author = 'John Doe';

-- Query B
SELECT p.*, c.name as category_name
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE p.published = true
ORDER BY p.created_at DESC;

-- Query C
SELECT author, COUNT(*) as post_count
FROM posts
GROUP BY author
HAVING COUNT(*) > 10;
```

**Your Task**: 
1. Identify which columns should be indexed
2. Create the appropriate indexes
3. Explain why each index helps

```sql
-- Create indexes here


```

---

### Exercise 6.2: Query Optimization

**Scenario**: Optimize this slow query:

```sql
SELECT p.*
FROM posts p
WHERE p.id IN (
  SELECT post_id FROM post_tags WHERE tag_id IN (
    SELECT id FROM tags WHERE name IN ('javascript', 'tutorial')
  )
);
```

**Your Task**: Rewrite using JOINs for better performance

```sql
-- Optimized query here


```

---

## 📚 Exercise Set 7: Data Integrity & Constraints

### Exercise 7.1: Add Constraints

**Scenario**: Improve data quality for your blog.

**Your Task**: Add constraints to ensure:
1. Post titles are at least 5 characters
2. Author names are at least 2 characters
3. Published posts must have content
4. Created_at cannot be in the future

```sql
-- Add constraints here


```

---

### Exercise 7.2: Cascading Deletes

**Scenario**: When a category is deleted, what should happen to its posts?

**Your Task**: 
1. Implement CASCADE delete
2. Implement SET NULL
3. Implement RESTRICT (prevent deletion)

Test each approach and explain when to use each.

```sql
-- Implement different cascade strategies


```

---

## 📚 Exercise Set 8: Practical Supabase Integration

### Exercise 8.1: Row Level Security (RLS)

**Scenario**: Implement security for your blog.

**Your Task**: Create RLS policies so:
1. Anyone can read published posts
2. Only authenticated users can create posts
3. Users can only edit their own posts
4. Only post authors can delete their posts

```sql
-- Enable RLS


-- Create policies


```

---

### Exercise 8.2: Database Functions

**Scenario**: Create a function to publish a post and update its timestamp.

**Your Task**: Create a PostgreSQL function

```sql
-- Create function here


```

---

### Exercise 8.3: Triggers

**Scenario**: Automatically update `updated_at` timestamp when a post is modified.

**Your Task**: Create a trigger

```sql
-- Create trigger here


```

---

## 🎓 Bonus Challenges

### Challenge 1: Full-Text Search

Implement full-text search for blog posts (search in title and content).

```sql
-- Implement full-text search


```

---

### Challenge 2: Soft Deletes

Implement soft deletes for posts (mark as deleted instead of actually deleting).

```sql
-- Implement soft deletes


```

---

### Challenge 3: Audit Trail

Create an audit trail that tracks all changes to posts (who changed what and when).

```sql
-- Implement audit trail


```

---

## 📖 Learning Path Recommendations

**Beginner**: Complete Exercise Sets 1-3
**Intermediate**: Complete Exercise Sets 4-6  
**Advanced**: Complete Exercise Sets 7-8 + Bonus Challenges

---

## 🔗 Additional Resources

- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQL Zoo](https://sqlzoo.net/) - Interactive SQL exercises
- [Supabase SQL Editor](https://supabase.com/docs/guides/database)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl.html)

---

