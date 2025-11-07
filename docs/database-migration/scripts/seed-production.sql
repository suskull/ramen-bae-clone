-- Seed Production Database with Categories and Products
-- Run this against your production Supabase database

-- First, clear existing data (optional - be careful!)
-- DELETE FROM products;
-- DELETE FROM categories;

-- Insert Categories (with icons like local)
INSERT INTO categories (id, name, slug, icon, created_at, updated_at) VALUES
('335527d5-800e-4fd0-9b9d-7831e4434ca7', 'Mixes', 'mixes', '🍜', NOW(), NOW()),
('0aaba0d2-1752-4ab9-8d6a-66e16f04216e', 'Single Toppings', 'single-toppings', '🥚', NOW(), NOW()),
('67686cae-62ad-4854-980b-9063ae144fd0', 'Bundles', 'bundles', '📦', NOW(), NOW()),
('0543bdc6-8773-44f9-8189-a2f8cc35dd26', 'Seasoning and Sauce', 'seasoning-and-sauce', '🧂', NOW(), NOW()),
('8a5e4af3-6f0c-4089-aeaa-18f229a2a2ab', 'Merch', 'merch', '👕', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  icon = EXCLUDED.icon,
  updated_at = NOW();

-- Insert Products with SVG images
INSERT INTO products (id, slug, name, description, price, compare_at_price, images, category_id, tags, inventory, ingredients, allergens, features, accent_color, created_at, updated_at) VALUES
-- Mixes Category
('prod-1', 'ultimate-ramen-mix', 'Ultimate Ramen Mix', 'The perfect blend of dried toppings for the ultimate ramen experience', 1299, 1599, '[{"url": "/products/ultimate-mix-1.svg", "alt": "Ultimate Ramen Mix package", "type": "main"}, {"url": "/products/ultimate-mix-2.svg", "alt": "Ultimate Ramen Mix contents", "type": "hover"}]'::json, '335527d5-800e-4fd0-9b9d-7831e4434ca7', ARRAY['mix', 'popular', 'bestseller'], 50, ARRAY['dried seaweed', 'sesame seeds', 'green onions', 'bamboo shoots'], ARRAY['sesame'], ARRAY['premium ingredients', 'ready to use', 'long shelf life'], '#fe90b8', NOW(), NOW()),

('prod-2', 'spicy-lovers-mix', 'Spicy Lover''s Mix', 'For those who like it hot! A fiery blend of spicy dried toppings', 1199, NULL, '[{"url": "/products/spicy-mix-1.svg", "alt": "Spicy Lover''s Mix package", "type": "main"}, {"url": "/products/spicy-mix-2.svg", "alt": "Spicy Lover''s Mix contents", "type": "hover"}]'::json, '335527d5-800e-4fd0-9b9d-7831e4434ca7', ARRAY['spicy', 'hot', 'mix'], 30, ARRAY['chili flakes', 'dried garlic', 'sesame seeds', 'nori'], ARRAY['sesame'], ARRAY['extra spicy', 'premium quality'], '#ff4444', NOW(), NOW()),

-- Single Toppings Category  
('prod-3', 'crispy-garlic', 'Crispy Garlic', 'Premium dried garlic chips for that perfect crunch and flavor', 899, NULL, '[{"url": "/products/garlic-1.svg", "alt": "Crispy Garlic package", "type": "main"}, {"url": "/products/garlic-2.svg", "alt": "Crispy Garlic close-up", "type": "hover"}]'::json, '0aaba0d2-1752-4ab9-8d6a-66e16f04216e', ARRAY['garlic', 'crispy', 'single'], 75, ARRAY['garlic', 'vegetable oil'], ARRAY[], ARRAY['crispy texture', 'intense flavor'], '#96da2f', NOW(), NOW()),

('prod-4', 'soft-boiled-egg', 'Soft Boiled Egg', 'Perfectly seasoned dried egg for authentic ramen taste', 799, 999, '[{"url": "/products/sesame-1.svg", "alt": "Soft Boiled Egg package", "type": "main"}, {"url": "/products/sesame-2.svg", "alt": "Soft Boiled Egg prepared", "type": "hover"}]'::json, '0aaba0d2-1752-4ab9-8d6a-66e16f04216e', ARRAY['egg', 'protein', 'traditional'], 40, ARRAY['dried egg', 'salt', 'seasoning'], ARRAY['egg'], ARRAY['high protein', 'authentic taste'], '#ffd700', NOW(), NOW()),

('prod-5', 'nori-sheets', 'Nori Sheets', 'Premium dried seaweed sheets, cut and ready to use', 699, NULL, '[{"url": "/products/nori-1.svg", "alt": "Nori Sheets package", "type": "main"}, {"url": "/products/nori-2.svg", "alt": "Nori Sheets detail", "type": "hover"}]'::json, '0aaba0d2-1752-4ab9-8d6a-66e16f04216e', ARRAY['nori', 'seaweed', 'umami'], 60, ARRAY['dried seaweed'], ARRAY[], ARRAY['rich in minerals', 'umami flavor'], '#2d5a27', NOW(), NOW()),

-- Bundles Category
('prod-6', 'starter-bundle', 'Starter Bundle', 'Everything you need to get started with premium ramen toppings', 2499, 2999, '[{"url": "/products/starter-bundle-1.svg", "alt": "Starter Bundle package", "type": "main"}, {"url": "/products/starter-bundle-2.svg", "alt": "Starter Bundle contents", "type": "hover"}]'::json, '67686cae-62ad-4854-980b-9063ae144fd0', ARRAY['bundle', 'starter', 'value'], 25, ARRAY['mixed toppings', 'seasoning', 'nori'], ARRAY['sesame', 'egg'], ARRAY['complete set', 'great value', 'beginner friendly'], '#8b5cf6', NOW(), NOW()),

-- Seasoning and Sauce Category
('prod-7', 'umami-seasoning', 'Umami Seasoning', 'Concentrated umami powder to enhance any ramen bowl', 1099, NULL, '[{"url": "/products/umami-1.svg", "alt": "Umami Seasoning package", "type": "main"}, {"url": "/products/umami-2.svg", "alt": "Umami Seasoning powder", "type": "hover"}]'::json, '0543bdc6-8773-44f9-8189-a2f8cc35dd26', ARRAY['umami', 'seasoning', 'flavor enhancer'], 45, ARRAY['mushroom extract', 'kelp powder', 'yeast extract'], ARRAY[], ARRAY['intense umami', 'small amount needed'], '#8b4513', NOW(), NOW()),

('prod-8', 'chili-oil', 'Chili Oil', 'Aromatic chili oil with crispy bits for the perfect heat', 1399, NULL, '[{"url": "/products/chili-oil-1.svg", "alt": "Chili Oil bottle", "type": "main"}, {"url": "/products/chili-oil-2.svg", "alt": "Chili Oil pour", "type": "hover"}]'::json, '0543bdc6-8773-44f9-8189-a2f8cc35dd26', ARRAY['chili', 'oil', 'spicy'], 35, ARRAY['chili peppers', 'vegetable oil', 'garlic', 'spices'], ARRAY[], ARRAY['handcrafted', 'perfect heat level'], '#dc2626', NOW(), NOW()),

-- Merch Category
('prod-9', 'ramen-tee', 'Ramen Lover Tee', 'Show your love for ramen with this comfortable cotton tee', 2499, NULL, '[{"url": "/products/tshirt-1.svg", "alt": "Ramen Lover Tee front", "type": "main"}, {"url": "/products/tshirt-2.svg", "alt": "Ramen Lover Tee back", "type": "hover"}]'::json, '8a5e4af3-6f0c-4089-aeaa-18f229a2a2ab', ARRAY['apparel', 'cotton', 'ramen'], 100, ARRAY[], ARRAY[], ARRAY['100% cotton', 'comfortable fit', 'unique design'], '#000000', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  updated_at = NOW();