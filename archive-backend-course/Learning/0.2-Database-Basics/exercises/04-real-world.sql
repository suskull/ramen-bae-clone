-- 🏋️ Exercise 4: Real-World Scenarios
-- Apply your SQL skills to practical e-commerce problems
-- Estimated time: 90 minutes

-- =============================================================================
-- SETUP: Ramen Bae E-commerce Database
-- =============================================================================

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  inventory INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (simplified - normally handled by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, slug, icon) VALUES
('Ramen Mixes', 'ramen-mixes', '🍜'),
('Single Toppings', 'single-toppings', '🥚'),
('Bundles', 'bundles', '📦');

INSERT INTO users (email, first_name, last_name) VALUES
('alice@example.com', 'Alice', 'Johnson'),
('bob@example.com', 'Bob', 'Smith'),
('charlie@example.com', 'Charlie', 'Brown');

INSERT INTO products (name, slug, description, price, compare_at_price, inventory, category_id, is_active) VALUES
('Spicy Ramen Mix', 'spicy-ramen-mix', 'Hot and delicious', 15.99, 19.99, 100, 
  (SELECT id FROM categories WHERE slug = 'ramen-mixes'), true),
('Classic Ramen Mix', 'classic-ramen-mix', 'Traditional flavor', 12.99, NULL, 150,
  (SELECT id FROM categories WHERE slug = 'ramen-mixes'), true),
('Soft Boiled Egg', 'soft-boiled-egg', 'Perfect topping', 2.99, NULL, 200,
  (SELECT id FROM categories WHERE slug = 'single-toppings'), true),
('Nori Sheets', 'nori-sheets', 'Seaweed sheets', 3.99, 4.99, 80,
  (SELECT id FROM categories WHERE slug = 'single-toppings'), true),
('Ultimate Bundle', 'ultimate-bundle', 'Everything you need', 49.99, 59.99, 30,
  (SELECT id FROM categories WHERE slug = 'bundles'), true),
('Starter Pack', 'starter-pack', 'Try our basics', 24.99, NULL, 50,
  (SELECT id FROM categories WHERE slug = 'bundles'), true);

-- Insert orders
INSERT INTO orders (user_id, status, subtotal, tax, shipping, total, created_at) VALUES
((SELECT id FROM users WHERE email = 'alice@example.com'), 'completed', 28.98, 2.32, 5.00, 36.30, NOW() - INTERVAL '10 days'),
((SELECT id FROM users WHERE email = 'alice@example.com'), 'completed', 52.98, 4.24, 5.00, 62.22, NOW() - INTERVAL '5 days'),
((SELECT id FROM users WHERE email = 'bob@example.com'), 'completed', 15.99, 1.28, 5.00, 22.27, NOW() - INTERVAL '8 days'),
((SELECT id FROM users WHERE email = 'charlie@example.com'), 'pending', 49.99, 4.00, 5.00, 58.99, NOW() - INTERVAL '1 day');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
-- Alice's first order
((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'alice@example.com') ORDER BY created_at LIMIT 1),
 (SELECT id FROM products WHERE slug = 'spicy-ramen-mix'), 1, 15.99),
((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'alice@example.com') ORDER BY created_at LIMIT 1),
 (SELECT id FROM products WHERE slug = 'classic-ramen-mix'), 1, 12.99),
-- Bob's order
((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE email = 'bob@example.com') LIMIT 1),
 (SELECT id FROM products WHERE slug = 'spicy-ramen-mix'), 1, 15.99);

-- Insert reviews
INSERT INTO reviews (product_id, user_id, rating, title, body, verified) VALUES
((SELECT id FROM products WHERE slug = 'spicy-ramen-mix'),
 (SELECT id FROM users WHERE email = 'alice@example.com'),
 5, 'Amazing!', 'Best ramen mix ever!', true),
((SELECT id FROM products WHERE slug = 'spicy-ramen-mix'),
 (SELECT id FROM users WHERE email = 'bob@example.com'),
 4, 'Great taste', 'Really spicy, love it', true),
((SELECT id FROM products WHERE slug = 'classic-ramen-mix'),
 (SELECT id FROM users WHERE email = 'alice@example.com'),
 5, 'Classic flavor', 'Just like traditional ramen', true);

-- Insert cart items
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
((SELECT id FROM users WHERE email = 'charlie@example.com'),
 (SELECT id FROM products WHERE slug = 'soft-boiled-egg'), 2),
((SELECT id FROM users WHERE email = 'charlie@example.com'),
 (SELECT id FROM products WHERE slug = 'nori-sheets'), 1);

-- =============================================================================
-- SCENARIO 1: Product Catalog Management
-- =============================================================================

-- Exercise 4.1: Active Products with Stock
-- Goal: Get products ready to sell
-- TODO: Find all active products with inventory > 0, show name, price, stock

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT name, price, inventory
-- FROM products
-- WHERE is_active = true AND inventory > 0
-- ORDER BY name;


-- Exercise 4.2: Products on Sale
-- Goal: Find discounted items
-- TODO: Show products where compare_at_price exists and is higher than price

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   name,
--   price,
--   compare_at_price,
--   ROUND(((compare_at_price - price) / compare_at_price * 100), 0) as discount_percent
-- FROM products
-- WHERE compare_at_price IS NOT NULL AND compare_at_price > price
-- ORDER BY discount_percent DESC;


-- Exercise 4.3: Low Stock Alert
-- Goal: Identify products that need restocking
-- TODO: Find products with inventory < 50

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT name, inventory, category_id
-- FROM products
-- WHERE inventory < 50
-- ORDER BY inventory ASC;


-- Exercise 4.4: Product Performance
-- Goal: Analyze which products sell best
-- TODO: Show products with total quantity sold and revenue

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.name,
--   COUNT(oi.id) as times_ordered,
--   SUM(oi.quantity) as total_quantity_sold,
--   SUM(oi.quantity * oi.price_at_purchase) as total_revenue
-- FROM products p
-- LEFT JOIN order_items oi ON p.id = oi.product_id
-- GROUP BY p.id, p.name
-- ORDER BY total_revenue DESC NULLS LAST;


-- =============================================================================
-- SCENARIO 2: Customer Analytics
-- =============================================================================

-- Exercise 4.5: Customer Lifetime Value
-- Goal: Calculate total spent per customer
-- TODO: Show each customer with their total order value

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   u.email,
--   u.first_name,
--   u.last_name,
--   COUNT(o.id) as order_count,
--   COALESCE(SUM(o.total), 0) as lifetime_value
-- FROM users u
-- LEFT JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.email, u.first_name, u.last_name
-- ORDER BY lifetime_value DESC;


-- Exercise 4.6: Customer Segmentation
-- Goal: Categorize customers by spending
-- TODO: Label customers as 'VIP', 'Regular', or 'New'

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH customer_spending AS (
--   SELECT 
--     u.id,
--     u.email,
--     COALESCE(SUM(o.total), 0) as total_spent,
--     COUNT(o.id) as order_count
--   FROM users u
--   LEFT JOIN orders o ON u.id = o.user_id
--   GROUP BY u.id, u.email
-- )
-- SELECT 
--   email,
--   total_spent,
--   order_count,
--   CASE 
--     WHEN total_spent > 100 THEN 'VIP'
--     WHEN order_count > 0 THEN 'Regular'
--     ELSE 'New'
--   END as segment
-- FROM customer_spending
-- ORDER BY total_spent DESC;


-- Exercise 4.7: Repeat Customers
-- Goal: Find customers who ordered multiple times
-- TODO: Show customers with 2+ orders

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   u.email,
--   COUNT(o.id) as order_count,
--   MIN(o.created_at) as first_order,
--   MAX(o.created_at) as last_order
-- FROM users u
-- INNER JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.email
-- HAVING COUNT(o.id) >= 2
-- ORDER BY order_count DESC;


-- =============================================================================
-- SCENARIO 3: Order Management
-- =============================================================================

-- Exercise 4.8: Order Details
-- Goal: Get complete order information
-- TODO: Show order with customer info and all items

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   o.id as order_id,
--   u.email,
--   o.status,
--   o.total,
--   o.created_at,
--   p.name as product_name,
--   oi.quantity,
--   oi.price_at_purchase
-- FROM orders o
-- JOIN users u ON o.user_id = u.id
-- JOIN order_items oi ON o.id = oi.order_id
-- JOIN products p ON oi.product_id = p.id
-- ORDER BY o.created_at DESC, p.name;


-- Exercise 4.9: Pending Orders
-- Goal: Find orders that need processing
-- TODO: Show pending orders with customer and item count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   o.id,
--   u.email,
--   o.total,
--   COUNT(oi.id) as item_count,
--   o.created_at
-- FROM orders o
-- JOIN users u ON o.user_id = u.id
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.status = 'pending'
-- GROUP BY o.id, u.email, o.total, o.created_at
-- ORDER BY o.created_at;


-- Exercise 4.10: Revenue by Time Period
-- Goal: Calculate daily/weekly/monthly revenue
-- TODO: Show revenue per day for last 30 days

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   DATE(created_at) as order_date,
--   COUNT(id) as order_count,
--   SUM(total) as daily_revenue
-- FROM orders
-- WHERE created_at >= NOW() - INTERVAL '30 days'
--   AND status = 'completed'
-- GROUP BY DATE(created_at)
-- ORDER BY order_date DESC;


-- =============================================================================
-- SCENARIO 4: Reviews and Ratings
-- =============================================================================

-- Exercise 4.11: Product Ratings
-- Goal: Calculate average rating per product
-- TODO: Show products with avg rating and review count

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.name,
--   COUNT(r.id) as review_count,
--   ROUND(AVG(r.rating), 2) as avg_rating,
--   COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_count
-- FROM products p
-- LEFT JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name
-- ORDER BY avg_rating DESC NULLS LAST;


-- Exercise 4.12: Top Rated Products
-- Goal: Find best products by rating
-- TODO: Show products with 4+ stars and at least 2 reviews

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.name,
--   COUNT(r.id) as review_count,
--   ROUND(AVG(r.rating), 2) as avg_rating
-- FROM products p
-- INNER JOIN reviews r ON p.id = r.product_id
-- GROUP BY p.id, p.name
-- HAVING AVG(r.rating) >= 4 AND COUNT(r.id) >= 2
-- ORDER BY avg_rating DESC, review_count DESC;


-- Exercise 4.13: Recent Reviews
-- Goal: Show latest customer feedback
-- TODO: Get 10 most recent reviews with product and user info

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   p.name as product,
--   u.first_name,
--   r.rating,
--   r.title,
--   r.body,
--   r.created_at
-- FROM reviews r
-- JOIN products p ON r.product_id = p.id
-- JOIN users u ON r.user_id = u.id
-- ORDER BY r.created_at DESC
-- LIMIT 10;


-- =============================================================================
-- SCENARIO 5: Shopping Cart
-- =============================================================================

-- Exercise 4.14: User's Cart
-- Goal: Get cart contents with pricing
-- TODO: Show cart items with current prices and subtotal

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   u.email,
--   p.name,
--   p.price,
--   ci.quantity,
--   (p.price * ci.quantity) as line_total
-- FROM cart_items ci
-- JOIN users u ON ci.user_id = u.id
-- JOIN products p ON ci.product_id = p.id
-- ORDER BY u.email, p.name;


-- Exercise 4.15: Cart Value
-- Goal: Calculate total cart value per user
-- TODO: Show each user's cart total

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   u.email,
--   COUNT(ci.id) as item_count,
--   SUM(ci.quantity) as total_quantity,
--   SUM(p.price * ci.quantity) as cart_total
-- FROM users u
-- LEFT JOIN cart_items ci ON u.id = ci.user_id
-- LEFT JOIN products p ON ci.product_id = p.id
-- GROUP BY u.id, u.email
-- HAVING COUNT(ci.id) > 0;


-- Exercise 4.16: Abandoned Carts
-- Goal: Find carts that haven't converted to orders
-- TODO: Show users with cart items but no recent orders

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   u.email,
--   COUNT(ci.id) as cart_items,
--   MAX(ci.created_at) as last_cart_update,
--   MAX(o.created_at) as last_order
-- FROM users u
-- INNER JOIN cart_items ci ON u.id = ci.user_id
-- LEFT JOIN orders o ON u.id = o.user_id
-- GROUP BY u.id, u.email
-- HAVING MAX(o.created_at) IS NULL 
--    OR MAX(ci.created_at) > MAX(o.created_at);


-- =============================================================================
-- SCENARIO 6: Inventory Management
-- =============================================================================

-- Exercise 4.17: Inventory Value
-- Goal: Calculate total inventory worth
-- TODO: Show total value of stock per category

-- YOUR CODE HERE:


-- SOLUTION:
-- SELECT 
--   c.name as category,
--   COUNT(p.id) as product_count,
--   SUM(p.inventory) as total_units,
--   SUM(p.inventory * p.price) as inventory_value
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- GROUP BY c.id, c.name
-- ORDER BY inventory_value DESC NULLS LAST;


-- Exercise 4.18: Stock Movement
-- Goal: Track how fast products sell
-- TODO: Calculate days of inventory remaining (assuming constant sales)

-- YOUR CODE HERE:


-- SOLUTION:
-- WITH sales_rate AS (
--   SELECT 
--     p.id,
--     p.name,
--     p.inventory,
--     COALESCE(SUM(oi.quantity), 0) as total_sold,
--     COUNT(DISTINCT DATE(o.created_at)) as days_selling
--   FROM products p
--   LEFT JOIN order_items oi ON p.id = oi.product_id
--   LEFT JOIN orders o ON oi.order_id = o.id
--   WHERE o.created_at >= NOW() - INTERVAL '30 days'
--   GROUP BY p.id, p.name, p.inventory
-- )
-- SELECT 
--   name,
--   inventory,
--   total_sold,
--   CASE 
--     WHEN total_sold = 0 THEN NULL
--     ELSE ROUND(inventory / (total_sold::DECIMAL / NULLIF(days_selling, 0)), 0)
--   END as days_of_stock_remaining
-- FROM sales_rate
-- ORDER BY days_of_stock_remaining ASC NULLS LAST;


-- =============================================================================
-- 🎯 CHALLENGE EXERCISES
-- =============================================================================

-- Challenge 1: Customer Cohort Analysis
-- Group customers by signup month and track their spending over time
-- YOUR CODE HERE:


-- Challenge 2: Product Recommendation Engine
-- Find products frequently bought together (market basket analysis)
-- YOUR CODE HERE:


-- Challenge 3: Revenue Forecast
-- Calculate month-over-month growth rate and project next month
-- YOUR CODE HERE:


-- Challenge 4: Customer Churn Detection
-- Find customers who haven't ordered in 60+ days but were previously active
-- YOUR CODE HERE:


-- Challenge 5: Inventory Optimization
-- Identify slow-moving products (low sales, high inventory)
-- YOUR CODE HERE:


-- Challenge 6: Dynamic Pricing Analysis
-- Compare sales velocity at different price points
-- YOUR CODE HERE:


-- =============================================================================
-- ✅ COMPLETION CHECKLIST
-- =============================================================================
-- [ ] Queried product catalog with filters
-- [ ] Calculated customer lifetime value
-- [ ] Analyzed order details and revenue
-- [ ] Aggregated product ratings
-- [ ] Managed shopping cart data
-- [ ] Tracked inventory and stock levels
-- [ ] Completed all challenge exercises
-- [ ] Applied SQL to real business problems

-- 🎉 Congratulations! You're ready to build real e-commerce features!
-- You've completed Module 2: Database Basics!
