-- 🏋️ Exercise 1: Basic SQL Queries (CRUD Operations)
-- Learn fundamental CREATE, READ, UPDATE, DELETE operations
-- Estimated time: 60 minutes

-- =============================================================================
-- SETUP: Create Your First Table
-- =============================================================================

-- Let's build a simple blog system to practice SQL
-- First, create a posts table

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verify table was created
SELECT * FROM posts;

-- =============================================================================
-- PART A: INSERT (Creating Data)
-- =============================================================================

-- Exercise 1.1: Simple INSERT
-- Goal: Add your first blog post
-- TODO: Insert a post with title "My First Post", content "Hello Database!", author "Your Name"

-- YOUR CODE HERE:


-- SOLUTION (don't peek!):
-- INSERT INTO posts (title, content, author, published) 
-- VALUES ('My First Post', 'Hello Database!', 'Your Name', true);


-- Exercise 1.2: Multiple INSERTs
-- Goal: Add multiple posts at once
-- TODO: Insert 3 posts in one statement

-- YOUR CODE HERE:


-- SOLUTION:
-- INSERT INTO posts (title, content, author, published) VALUES
-- ('Getting Started with SQL', 'SQL is powerful...', 'Alice', true),
-- ('Database Design Tips', 'Good design matters...', 'Bob', false),
-- ('Advanced Queries', 'Learn complex patterns...', 'Alice', true);


-- Exercise 1.3: INSERT with Defaults
-- Goal: Let database fill in default values
-- TODO: Insert a post without specifying published or view_count

-- YOUR CODE HERE:


-- SOLUTION:
-- INSERT INTO posts (title, content, author) 
-- VALUES ('Draft Post', 'Work in progress...', 'Charlie');


-- =============================================================================
-- PART B: SELECT (Reading Data)
-- =============================================================================

-- Exercise 1.4: Select All
-- Goal: Retrieve all posts
-- TODO: Get all columns from all posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT * FROM posts;


-- Exercise 1.5: Select Specific Columns
-- Goal: Get only what you need (better performance!)
-- TODO: Get only title and author from all posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author FROM posts;


-- Exercise 1.6: WHERE Clause - Equality
-- Goal: Filter data based on conditions
-- TODO: Find all posts by 'Alice'

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT * FROM posts WHERE author = 'Alice';


-- Exercise 1.7: WHERE Clause - Boolean
-- Goal: Filter by true/false values
-- TODO: Find all published posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author, published FROM posts WHERE published = true;


-- Exercise 1.8: WHERE Clause - Comparison
-- Goal: Use comparison operators
-- TODO: Find posts with more than 100 views

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, view_count FROM posts WHERE view_count > 100;


-- Exercise 1.9: WHERE with AND
-- Goal: Combine multiple conditions
-- TODO: Find published posts by 'Alice'

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT * FROM posts WHERE author = 'Alice' AND published = true;


-- Exercise 1.10: WHERE with OR
-- Goal: Match any condition
-- TODO: Find posts by 'Alice' OR 'Bob'

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author FROM posts WHERE author = 'Alice' OR author = 'Bob';


-- Exercise 1.11: LIKE Pattern Matching
-- Goal: Search text with wildcards
-- TODO: Find posts with 'SQL' in the title

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title FROM posts WHERE title LIKE '%SQL%';


-- Exercise 1.12: ILIKE (Case-Insensitive)
-- Goal: Search without worrying about case
-- TODO: Find posts with 'database' in title (any case)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title FROM posts WHERE title ILIKE '%database%';


-- Exercise 1.13: ORDER BY
-- Goal: Sort results
-- TODO: Get all posts ordered by created_at (newest first)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, created_at FROM posts ORDER BY created_at DESC;


-- Exercise 1.14: ORDER BY Multiple Columns
-- Goal: Sort by multiple criteria
-- TODO: Order by author (A-Z), then by created_at (newest first)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT author, title, created_at 
-- FROM posts 
-- ORDER BY author ASC, created_at DESC;


-- Exercise 1.15: LIMIT
-- Goal: Get only a specific number of results
-- TODO: Get the 5 most recent posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, created_at FROM posts ORDER BY created_at DESC LIMIT 5;


-- Exercise 1.16: OFFSET (Pagination)
-- Goal: Skip results for pagination
-- TODO: Get posts 6-10 (skip first 5)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title FROM posts ORDER BY created_at DESC LIMIT 5 OFFSET 5;


-- =============================================================================
-- PART C: UPDATE (Modifying Data)
-- =============================================================================

-- Exercise 1.17: Simple UPDATE
-- Goal: Modify existing data
-- TODO: Publish a draft post (set published = true for a specific post)

-- YOUR CODE HERE:


-- SOLUTION:
-- UPDATE posts 
-- SET published = true 
-- WHERE title = 'Draft Post';


-- Exercise 1.18: UPDATE Multiple Columns
-- Goal: Change multiple fields at once
-- TODO: Update a post's title AND content

-- YOUR CODE HERE:


-- SOLUTION:
-- UPDATE posts 
-- SET title = 'Updated Title', 
--     content = 'Updated content here...',
--     updated_at = NOW()
-- WHERE author = 'Charlie';


-- Exercise 1.19: UPDATE with Calculation
-- Goal: Modify values based on current value
-- TODO: Increment view_count by 1 for a specific post

-- YOUR CODE HERE:


-- SOLUTION:
-- UPDATE posts 
-- SET view_count = view_count + 1 
-- WHERE title = 'My First Post';


-- Exercise 1.20: UPDATE Multiple Rows
-- Goal: Update many records at once
-- TODO: Publish all posts by 'Alice'

-- YOUR CODE HERE:


-- SOLUTION:
-- UPDATE posts 
-- SET published = true 
-- WHERE author = 'Alice';


-- Exercise 1.21: UPDATE with RETURNING
-- Goal: See what was updated
-- TODO: Update a post and return the updated row

-- YOUR CODE HERE:


-- SOLUTION:
-- UPDATE posts 
-- SET view_count = view_count + 10 
-- WHERE author = 'Bob'
-- RETURNING *;


-- =============================================================================
-- PART D: DELETE (Removing Data)
-- =============================================================================

-- Exercise 1.22: DELETE Specific Row
-- Goal: Remove one record
-- TODO: Delete a post by title

-- YOUR CODE HERE:


-- SOLUTION:
-- DELETE FROM posts WHERE title = 'Draft Post';


-- Exercise 1.23: DELETE with Condition
-- Goal: Remove multiple records
-- TODO: Delete all unpublished posts

-- YOUR CODE HERE:


-- SOLUTION:
-- DELETE FROM posts WHERE published = false;


-- Exercise 1.24: DELETE with RETURNING
-- Goal: See what was deleted
-- TODO: Delete a post and return its data

-- YOUR CODE HERE:


-- SOLUTION:
-- DELETE FROM posts 
-- WHERE author = 'Charlie'
-- RETURNING *;


-- =============================================================================
-- PART E: Aggregate Functions
-- =============================================================================

-- Exercise 1.25: COUNT
-- Goal: Count rows
-- TODO: Count total number of posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT COUNT(*) as total_posts FROM posts;


-- Exercise 1.26: COUNT with WHERE
-- Goal: Count filtered results
-- TODO: Count published posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT COUNT(*) as published_count FROM posts WHERE published = true;


-- Exercise 1.27: AVG (Average)
-- Goal: Calculate average
-- TODO: Find average view count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT AVG(view_count) as avg_views FROM posts;


-- Exercise 1.28: MAX and MIN
-- Goal: Find highest and lowest values
-- TODO: Find highest and lowest view counts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   MAX(view_count) as highest_views,
--   MIN(view_count) as lowest_views
-- FROM posts;


-- Exercise 1.29: SUM
-- Goal: Add up values
-- TODO: Calculate total views across all posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT SUM(view_count) as total_views FROM posts;


-- =============================================================================
-- PART F: GROUP BY
-- =============================================================================

-- Exercise 1.30: GROUP BY
-- Goal: Group and aggregate data
-- TODO: Count posts per author

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT author, COUNT(*) as post_count 
-- FROM posts 
-- GROUP BY author;


-- Exercise 1.31: GROUP BY with Multiple Aggregates
-- Goal: Calculate multiple stats per group
-- TODO: For each author, show post count and total views

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   author,
--   COUNT(*) as post_count,
--   SUM(view_count) as total_views,
--   AVG(view_count) as avg_views
-- FROM posts
-- GROUP BY author;


-- Exercise 1.32: HAVING
-- Goal: Filter grouped results
-- TODO: Find authors with more than 2 posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT author, COUNT(*) as post_count 
-- FROM posts 
-- GROUP BY author
-- HAVING COUNT(*) > 2;


-- =============================================================================
-- 🎯 CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Find the most viewed post
-- YOUR CODE HERE:


-- Challenge 2: Find authors who have both published and unpublished posts
-- YOUR CODE HERE:


-- Challenge 3: Calculate what percentage of posts are published
-- YOUR CODE HERE:


-- Challenge 4: Find the most prolific author (most posts)
-- YOUR CODE HERE:


-- Challenge 5: Get posts created in the last 7 days
-- YOUR CODE HERE:


-- =============================================================================
-- 🧹 CLEANUP (Optional)
-- =============================================================================

-- Uncomment to drop the table when done
-- DROP TABLE posts;

-- =============================================================================
-- ✅ COMPLETION CHECKLIST
-- =============================================================================
-- [ ] Created posts table
-- [ ] Inserted data with INSERT
-- [ ] Retrieved data with SELECT
-- [ ] Filtered with WHERE
-- [ ] Sorted with ORDER BY
-- [ ] Limited results with LIMIT
-- [ ] Updated data with UPDATE
-- [ ] Deleted data with DELETE
-- [ ] Used aggregate functions (COUNT, AVG, SUM, MAX, MIN)
-- [ ] Grouped data with GROUP BY
-- [ ] Filtered groups with HAVING
-- [ ] Completed all challenge exercises

-- 🎉 Congratulations! You've mastered basic SQL CRUD operations!
-- Next: Exercise 2 - Relationships and JOINs
