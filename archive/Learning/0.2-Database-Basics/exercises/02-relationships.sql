-- 🏋️ Exercise 2: Relationships and JOINs
-- Learn how to connect tables and query related data
-- Estimated time: 90 minutes

-- =============================================================================
-- SETUP: Create Related Tables
-- =============================================================================

-- We'll build a blog with categories and tags
-- This demonstrates one-to-many and many-to-many relationships

-- Table 1: Categories (one-to-many with posts)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Posts (belongs to one category)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Tags (many-to-many with posts)
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 4: Post_Tags (junction table)
CREATE TABLE post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

-- =============================================================================
-- PART A: Insert Sample Data
-- =============================================================================

-- Insert categories
INSERT INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Tech news and tutorials'),
('Lifestyle', 'lifestyle', 'Life tips and stories'),
('Business', 'business', 'Business insights');

-- Insert posts with categories
INSERT INTO posts (title, content, author, category_id, published, view_count) VALUES
('Getting Started with SQL', 'SQL basics...', 'Alice', 
  (SELECT id FROM categories WHERE slug = 'technology'), true, 150),
('Work-Life Balance', 'Tips for balance...', 'Bob',
  (SELECT id FROM categories WHERE slug = 'lifestyle'), true, 200),
('Database Design', 'Design principles...', 'Alice',
  (SELECT id FROM categories WHERE slug = 'technology'), true, 300),
('Startup Tips', 'How to start...', 'Charlie',
  (SELECT id FROM categories WHERE slug = 'business'), false, 50);

-- Insert tags
INSERT INTO tags (name, slug) VALUES
('tutorial', 'tutorial'),
('beginner', 'beginner'),
('advanced', 'advanced'),
('productivity', 'productivity'),
('database', 'database');

-- Associate posts with tags
INSERT INTO post_tags (post_id, tag_id) VALUES
-- "Getting Started with SQL" has tags: tutorial, beginner, database
((SELECT id FROM posts WHERE title = 'Getting Started with SQL'),
 (SELECT id FROM tags WHERE slug = 'tutorial')),
((SELECT id FROM posts WHERE title = 'Getting Started with SQL'),
 (SELECT id FROM tags WHERE slug = 'beginner')),
((SELECT id FROM posts WHERE title = 'Getting Started with SQL'),
 (SELECT id FROM tags WHERE slug = 'database')),
-- "Database Design" has tags: advanced, database
((SELECT id FROM posts WHERE title = 'Database Design'),
 (SELECT id FROM tags WHERE slug = 'advanced')),
((SELECT id FROM posts WHERE title = 'Database Design'),
 (SELECT id FROM tags WHERE slug = 'database')),
-- "Work-Life Balance" has tags: productivity
((SELECT id FROM posts WHERE title = 'Work-Life Balance'),
 (SELECT id FROM tags WHERE slug = 'productivity'));

-- =============================================================================
-- PART B: INNER JOIN (One-to-Many)
-- =============================================================================

-- Exercise 2.1: Basic INNER JOIN
-- Goal: Get posts with their category names
-- TODO: Select post title and category name

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   c.name as category_name
-- FROM posts p
-- INNER JOIN categories c ON p.category_id = c.id;


-- Exercise 2.2: JOIN with WHERE
-- Goal: Filter joined data
-- TODO: Get all technology posts with category name

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   p.author,
--   c.name as category
-- FROM posts p
-- INNER JOIN categories c ON p.category_id = c.id
-- WHERE c.slug = 'technology';


-- Exercise 2.3: JOIN with Multiple Columns
-- Goal: Select more information from both tables
-- TODO: Get post title, author, content, category name, and view count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   p.author,
--   p.content,
--   p.view_count,
--   c.name as category
-- FROM posts p
-- INNER JOIN categories c ON p.category_id = c.id;


-- Exercise 2.4: JOIN with ORDER BY
-- Goal: Sort joined results
-- TODO: Get posts with categories, ordered by view count (highest first)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   c.name as category,
--   p.view_count
-- FROM posts p
-- INNER JOIN categories c ON p.category_id = c.id
-- ORDER BY p.view_count DESC;


-- =============================================================================
-- PART C: LEFT JOIN (Include Nulls)
-- =============================================================================

-- First, add a post without a category
INSERT INTO posts (title, content, author, published) 
VALUES ('Uncategorized Post', 'No category yet...', 'Dave', false);

-- Exercise 2.5: LEFT JOIN
-- Goal: Get all posts, even those without categories
-- TODO: Select all posts with their category names (show NULL for uncategorized)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   c.name as category
-- FROM posts p
-- LEFT JOIN categories c ON p.category_id = c.id;


-- Exercise 2.6: Find Posts Without Categories
-- Goal: Use LEFT JOIN to find missing relationships
-- TODO: Find all posts that don't have a category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT p.title, p.author
-- FROM posts p
-- LEFT JOIN categories c ON p.category_id = c.id
-- WHERE c.id IS NULL;


-- =============================================================================
-- PART D: Many-to-Many JOINs
-- =============================================================================

-- Exercise 2.7: Get Tags for a Post
-- Goal: Join through junction table
-- TODO: Get all tags for "Getting Started with SQL"

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT t.name as tag_name
-- FROM posts p
-- INNER JOIN post_tags pt ON p.id = pt.post_id
-- INNER JOIN tags t ON pt.tag_id = t.id
-- WHERE p.title = 'Getting Started with SQL';


-- Exercise 2.8: Get Posts for a Tag
-- Goal: Reverse many-to-many query
-- TODO: Get all posts with the "database" tag

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT p.title, p.author
-- FROM tags t
-- INNER JOIN post_tags pt ON t.id = pt.tag_id
-- INNER JOIN posts p ON pt.post_id = p.id
-- WHERE t.slug = 'database';


-- Exercise 2.9: Posts with Category AND Tags
-- Goal: Join multiple tables
-- TODO: Get post title, category name, and all tag names

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   c.name as category,
--   t.name as tag
-- FROM posts p
-- LEFT JOIN categories c ON p.category_id = c.id
-- LEFT JOIN post_tags pt ON p.id = pt.post_id
-- LEFT JOIN tags t ON pt.tag_id = t.id
-- ORDER BY p.title, t.name;


-- =============================================================================
-- PART E: Aggregate with JOINs
-- =============================================================================

-- Exercise 2.10: Count Posts per Category
-- Goal: Combine JOIN with GROUP BY
-- TODO: Count how many posts are in each category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   c.name as category,
--   COUNT(p.id) as post_count
-- FROM categories c
-- LEFT JOIN posts p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- ORDER BY post_count DESC;


-- Exercise 2.11: Count Tags per Post
-- Goal: Aggregate many-to-many relationships
-- TODO: Show each post with its tag count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   COUNT(pt.tag_id) as tag_count
-- FROM posts p
-- LEFT JOIN post_tags pt ON p.id = pt.post_id
-- GROUP BY p.id, p.title
-- ORDER BY tag_count DESC;


-- Exercise 2.12: Average Views per Category
-- Goal: Calculate aggregates across relationships
-- TODO: Find average view count for each category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   c.name as category,
--   AVG(p.view_count) as avg_views,
--   COUNT(p.id) as post_count
-- FROM categories c
-- LEFT JOIN posts p ON c.id = p.category_id
-- GROUP BY c.id, c.name;


-- Exercise 2.13: Most Popular Tags
-- Goal: Find tags used most often
-- TODO: List tags with their usage count, ordered by popularity

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   t.name as tag,
--   COUNT(pt.post_id) as usage_count
-- FROM tags t
-- LEFT JOIN post_tags pt ON t.id = pt.tag_id
-- GROUP BY t.id, t.name
-- ORDER BY usage_count DESC;


-- =============================================================================
-- PART F: Complex Queries
-- =============================================================================

-- Exercise 2.14: Posts with Multiple Tags
-- Goal: Find posts that have more than one tag
-- TODO: List posts with 2 or more tags

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   COUNT(pt.tag_id) as tag_count
-- FROM posts p
-- INNER JOIN post_tags pt ON p.id = pt.post_id
-- GROUP BY p.id, p.title
-- HAVING COUNT(pt.tag_id) >= 2;


-- Exercise 2.15: Category with Most Views
-- Goal: Find which category has highest total views
-- TODO: Show category name and total views, ordered by total

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   c.name as category,
--   SUM(p.view_count) as total_views
-- FROM categories c
-- INNER JOIN posts p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- ORDER BY total_views DESC
-- LIMIT 1;


-- Exercise 2.16: Authors and Their Categories
-- Goal: See which categories each author writes in
-- TODO: List authors with categories they've written in

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT DISTINCT
--   p.author,
--   c.name as category
-- FROM posts p
-- INNER JOIN categories c ON p.category_id = c.id
-- ORDER BY p.author, c.name;


-- Exercise 2.17: Find Posts with Specific Tag Combination
-- Goal: Complex many-to-many filtering
-- TODO: Find posts that have BOTH "database" AND "tutorial" tags

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT p.title
-- FROM posts p
-- WHERE EXISTS (
--   SELECT 1 FROM post_tags pt
--   INNER JOIN tags t ON pt.tag_id = t.id
--   WHERE pt.post_id = p.id AND t.slug = 'database'
-- )
-- AND EXISTS (
--   SELECT 1 FROM post_tags pt
--   INNER JOIN tags t ON pt.tag_id = t.id
--   WHERE pt.post_id = p.id AND t.slug = 'tutorial'
-- );


-- =============================================================================
-- 🎯 CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Create a complete post view
-- Show: title, author, category, all tags (comma-separated), view count
-- YOUR CODE HERE:


-- Challenge 2: Find empty categories (no posts)
-- YOUR CODE HERE:


-- Challenge 3: Find the most prolific author in each category
-- YOUR CODE HERE:


-- Challenge 4: Find tags that are never used together
-- YOUR CODE HERE:


-- Challenge 5: Create a "related posts" query
-- Given a post, find other posts with similar tags
-- YOUR CODE HERE:


-- =============================================================================
-- 🧹 CLEANUP (Optional)
-- =============================================================================

-- Uncomment to drop tables when done
-- DROP TABLE post_tags;
-- DROP TABLE tags;
-- DROP TABLE posts;
-- DROP TABLE categories;

-- =============================================================================
-- ✅ COMPLETION CHECKLIST
-- =============================================================================
-- [ ] Created tables with foreign keys
-- [ ] Inserted related data
-- [ ] Performed INNER JOINs
-- [ ] Used LEFT JOINs to find missing data
-- [ ] Queried many-to-many relationships
-- [ ] Combined JOINs with aggregates
-- [ ] Used GROUP BY with joined tables
-- [ ] Filtered grouped results with HAVING
-- [ ] Completed all challenge exercises

-- 🎉 Congratulations! You've mastered database relationships!
-- Next: Exercise 3 - Advanced Queries
