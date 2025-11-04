-- 🏋️ Exercise 3: Advanced SQL Queries
-- Learn subqueries, CTEs, window functions, and complex patterns
-- Estimated time: 60 minutes

-- =============================================================================
-- SETUP: Create Enhanced Blog Database
-- =============================================================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts with more fields
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments (for nested queries)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, slug) VALUES
('Technology', 'technology'),
('Lifestyle', 'lifestyle'),
('Business', 'business'),
('Travel', 'travel');

INSERT INTO posts (title, content, author, category_id, published, view_count, word_count, created_at) VALUES
('SQL Basics', 'Learn SQL...', 'Alice', 
  (SELECT id FROM categories WHERE slug = 'technology'), true, 500, 1200, NOW() - INTERVAL '10 days'),
('Advanced SQL', 'Master complex queries...', 'Alice',
  (SELECT id FROM categories WHERE slug = 'technology'), true, 800, 2500, NOW() - INTERVAL '5 days'),
('Work Tips', 'Productivity hacks...', 'Bob',
  (SELECT id FROM categories WHERE slug = 'lifestyle'), true, 300, 800, NOW() - INTERVAL '8 days'),
('Database Design', 'Schema patterns...', 'Charlie',
  (SELECT id FROM categories WHERE slug = 'technology'), true, 1200, 3000, NOW() - INTERVAL '3 days'),
('Travel Guide', 'Best destinations...', 'Bob',
  (SELECT id FROM categories WHERE slug = 'travel'), false, 50, 1500, NOW() - INTERVAL '1 day'),
('Startup Journey', 'Building a company...', 'Alice',
  (SELECT id FROM categories WHERE slug = 'business'), true, 600, 2000, NOW() - INTERVAL '7 days');

INSERT INTO comments (post_id, author, content) VALUES
((SELECT id FROM posts WHERE title = 'SQL Basics'), 'Dave', 'Great tutorial!'),
((SELECT id FROM posts WHERE title = 'SQL Basics'), 'Eve', 'Very helpful'),
((SELECT id FROM posts WHERE title = 'SQL Basics'), 'Frank', 'Thanks!'),
((SELECT id FROM posts WHERE title = 'Advanced SQL'), 'Dave', 'Mind blown!'),
((SELECT id FROM posts WHERE title = 'Work Tips'), 'Eve', 'Will try these'),
((SELECT id FROM posts WHERE title = 'Database Design'), 'Frank', 'Excellent post');

-- =============================================================================
-- PART A: Subqueries
-- =============================================================================

-- Exercise 3.1: Subquery in WHERE
-- Goal: Use a subquery to filter results
-- TODO: Find posts with above-average view count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, view_count
-- FROM posts
-- WHERE view_count > (SELECT AVG(view_count) FROM posts);


-- Exercise 3.2: Subquery with IN
-- Goal: Filter using a list from subquery
-- TODO: Find posts in categories that have more than 2 posts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author
-- FROM posts
-- WHERE category_id IN (
--   SELECT category_id
--   FROM posts
--   GROUP BY category_id
--   HAVING COUNT(*) > 2
-- );


-- Exercise 3.3: Correlated Subquery
-- Goal: Subquery that references outer query
-- TODO: Find posts that have more comments than average for their category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT p.title, p.category_id,
--   (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
-- FROM posts p
-- WHERE (
--   SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
-- ) > (
--   SELECT AVG(comment_count)
--   FROM (
--     SELECT COUNT(*) as comment_count
--     FROM comments c2
--     INNER JOIN posts p2 ON c2.post_id = p2.id
--     WHERE p2.category_id = p.category_id
--     GROUP BY c2.post_id
--   ) subq
-- );


-- Exercise 3.4: Subquery in SELECT
-- Goal: Add calculated columns using subqueries
-- TODO: Show each post with its comment count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   author,
--   (SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id) as comment_count
-- FROM posts;


-- Exercise 3.5: EXISTS
-- Goal: Check if related records exist
-- TODO: Find posts that have at least one comment

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author
-- FROM posts p
-- WHERE EXISTS (
--   SELECT 1 FROM comments c WHERE c.post_id = p.id
-- );


-- Exercise 3.6: NOT EXISTS
-- Goal: Find records without related data
-- TODO: Find posts with no comments

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT title, author
-- FROM posts p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM comments c WHERE c.post_id = p.id
-- );


-- =============================================================================
-- PART B: Common Table Expressions (CTEs)
-- =============================================================================

-- Exercise 3.7: Simple CTE
-- Goal: Create a named temporary result set
-- TODO: Use CTE to find popular posts (view_count > 500)

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH popular_posts AS (
--   SELECT title, author, view_count
--   FROM posts
--   WHERE view_count > 500
-- )
-- SELECT * FROM popular_posts
-- ORDER BY view_count DESC;


-- Exercise 3.8: Multiple CTEs
-- Goal: Chain multiple CTEs together
-- TODO: Find authors who write popular posts in technology

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH tech_category AS (
--   SELECT id FROM categories WHERE slug = 'technology'
-- ),
-- popular_tech_posts AS (
--   SELECT author, title, view_count
--   FROM posts
--   WHERE category_id IN (SELECT id FROM tech_category)
--     AND view_count > 500
-- )
-- SELECT DISTINCT author
-- FROM popular_tech_posts;


-- Exercise 3.9: CTE with Aggregation
-- Goal: Use CTE to simplify complex aggregations
-- TODO: Find categories with average word count > 1500

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH category_stats AS (
--   SELECT 
--     c.name,
--     AVG(p.word_count) as avg_words,
--     COUNT(p.id) as post_count
--   FROM categories c
--   LEFT JOIN posts p ON c.id = p.category_id
--   GROUP BY c.id, c.name
-- )
-- SELECT name, avg_words, post_count
-- FROM category_stats
-- WHERE avg_words > 1500;


-- Exercise 3.10: Recursive CTE (Advanced)
-- Goal: Generate a series of numbers
-- TODO: Generate numbers 1 to 10

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH RECURSIVE numbers AS (
--   SELECT 1 as n
--   UNION ALL
--   SELECT n + 1 FROM numbers WHERE n < 10
-- )
-- SELECT * FROM numbers;


-- =============================================================================
-- PART C: Window Functions
-- =============================================================================

-- Exercise 3.11: ROW_NUMBER()
-- Goal: Assign row numbers to results
-- TODO: Rank posts by view count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   view_count,
--   ROW_NUMBER() OVER (ORDER BY view_count DESC) as rank
-- FROM posts;


-- Exercise 3.12: RANK() and DENSE_RANK()
-- Goal: Understand ranking with ties
-- TODO: Rank posts by view count, showing ties

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   view_count,
--   RANK() OVER (ORDER BY view_count DESC) as rank,
--   DENSE_RANK() OVER (ORDER BY view_count DESC) as dense_rank
-- FROM posts;


-- Exercise 3.13: PARTITION BY
-- Goal: Rank within groups
-- TODO: Rank posts by view count within each category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   c.name as category,
--   p.view_count,
--   RANK() OVER (PARTITION BY p.category_id ORDER BY p.view_count DESC) as rank_in_category
-- FROM posts p
-- JOIN categories c ON p.category_id = c.id;


-- Exercise 3.14: Running Total
-- Goal: Calculate cumulative sum
-- TODO: Show running total of views over time

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   created_at,
--   view_count,
--   SUM(view_count) OVER (ORDER BY created_at) as running_total
-- FROM posts
-- ORDER BY created_at;


-- Exercise 3.15: LAG and LEAD
-- Goal: Access previous/next row values
-- TODO: Show each post with the previous post's view count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   view_count,
--   LAG(view_count) OVER (ORDER BY created_at) as previous_views,
--   LEAD(view_count) OVER (ORDER BY created_at) as next_views
-- FROM posts
-- ORDER BY created_at;


-- Exercise 3.16: Moving Average
-- Goal: Calculate rolling average
-- TODO: Calculate 3-post moving average of view counts

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   view_count,
--   AVG(view_count) OVER (
--     ORDER BY created_at 
--     ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
--   ) as moving_avg
-- FROM posts
-- ORDER BY created_at;


-- =============================================================================
-- PART D: Advanced Patterns
-- =============================================================================

-- Exercise 3.17: CASE Statement
-- Goal: Create conditional logic in queries
-- TODO: Categorize posts by view count (low/medium/high)

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   title,
--   view_count,
--   CASE 
--     WHEN view_count < 300 THEN 'Low'
--     WHEN view_count < 700 THEN 'Medium'
--     ELSE 'High'
--   END as popularity
-- FROM posts;


-- Exercise 3.18: COALESCE
-- Goal: Handle NULL values
-- TODO: Show posts with category name, or 'Uncategorized' if NULL

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   COALESCE(c.name, 'Uncategorized') as category
-- FROM posts p
-- LEFT JOIN categories c ON p.category_id = c.id;


-- Exercise 3.19: String Aggregation
-- Goal: Combine multiple rows into one
-- TODO: For each post, show all commenters as comma-separated list

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.title,
--   STRING_AGG(c.author, ', ' ORDER BY c.created_at) as commenters
-- FROM posts p
-- LEFT JOIN comments c ON p.id = c.post_id
-- GROUP BY p.id, p.title;


-- Exercise 3.20: JSONB Aggregation
-- Goal: Create JSON from query results
-- TODO: Create JSON array of posts per category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   c.name as category,
--   JSONB_AGG(
--     JSONB_BUILD_OBJECT(
--       'title', p.title,
--       'author', p.author,
--       'views', p.view_count
--     )
--   ) as posts
-- FROM categories c
-- LEFT JOIN posts p ON c.id = p.category_id
-- GROUP BY c.id, c.name;


-- =============================================================================
-- PART E: Performance Queries
-- =============================================================================

-- Exercise 3.21: EXPLAIN
-- Goal: Understand query execution
-- TODO: Analyze the execution plan of a complex query

-- YOUR CODE HERE:


-- SOLUTION:
-- EXPLAIN ANALYZE
-- SELECT p.title, c.name, COUNT(co.id) as comment_count
-- FROM posts p
-- JOIN categories c ON p.category_id = c.id
-- LEFT JOIN comments co ON p.id = co.post_id
-- GROUP BY p.id, p.title, c.name;


-- Exercise 3.22: Create Index
-- Goal: Improve query performance
-- TODO: Create index on frequently queried columns

-- YOUR CODE HERE:


-- SOLUTION:
-- CREATE INDEX idx_posts_category ON posts(category_id);
-- CREATE INDEX idx_posts_published ON posts(published);
-- CREATE INDEX idx_posts_views ON posts(view_count DESC);
-- CREATE INDEX idx_comments_post ON comments(post_id);


-- =============================================================================
-- 🎯 CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Find the top 3 posts per category by view count
-- YOUR CODE HERE:


-- Challenge 2: Calculate engagement rate (comments per view) for each post
-- YOUR CODE HERE:


-- Challenge 3: Find authors who have written in at least 3 different categories
-- YOUR CODE HERE:


-- Challenge 4: Create a leaderboard showing authors ranked by total views
-- Include: rank, author, total views, post count, avg views per post
-- YOUR CODE HERE:


-- Challenge 5: Find posts published in the same week as another post by the same author
-- YOUR CODE HERE:


-- Challenge 6: Calculate the percentage of total views each post represents
-- YOUR CODE HERE:


-- Challenge 7: Find the longest gap between posts for each author
-- YOUR CODE HERE:


-- =============================================================================
-- 🧹 CLEANUP (Optional)
-- =============================================================================

-- Uncomment to drop tables when done
-- DROP TABLE comments;
-- DROP TABLE posts;
-- DROP TABLE categories;

-- =============================================================================
-- ✅ COMPLETION CHECKLIST
-- =============================================================================
-- [ ] Used subqueries in WHERE, SELECT, and FROM
-- [ ] Practiced EXISTS and NOT EXISTS
-- [ ] Created and used CTEs
-- [ ] Used window functions (ROW_NUMBER, RANK, LAG, LEAD)
-- [ ] Calculated running totals and moving averages
-- [ ] Used PARTITION BY for grouped calculations
-- [ ] Applied CASE statements for conditional logic
-- [ ] Aggregated strings and JSON
-- [ ] Analyzed query performance with EXPLAIN
-- [ ] Created indexes for optimization
-- [ ] Completed all challenge exercises

-- 🎉 Congratulations! You've mastered advanced SQL queries!
-- Next: Exercise 4 - Real-World Scenarios
