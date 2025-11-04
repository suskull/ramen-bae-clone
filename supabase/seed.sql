-- Seed data for Ramen Bae e-commerce

-- Insert categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Mixes', 'mixes', '🍜'),
  ('Single Toppings', 'single-toppings', '🥚'),
  ('Bundles', 'bundles', '📦'),
  ('Seasoning and Sauce', 'seasoning-and-sauce', '🧂'),
  ('Merch', 'merch', '👕');

-- Insert sample products
INSERT INTO products (
  slug, name, description, price, compare_at_price, images, category_id, 
  tags, inventory, nutrition_facts, ingredients, allergens, features, accent_color
) VALUES
  -- Mixes
  (
    'ultimate-ramen-mix',
    'Ultimate Ramen Mix',
    'The perfect combination of all our best toppings in one convenient package. Elevate your instant ramen with crispy onions, sesame seeds, nori strips, and more!',
    24.99,
    29.99,
    '[
      {"url": "/products/ultimate-mix-1.jpg", "alt": "Ultimate Ramen Mix package", "type": "main"},
      {"url": "/products/ultimate-mix-2.jpg", "alt": "Ultimate Ramen Mix contents", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'mixes'),
    ARRAY['bestseller', 'value-pack'],
    150,
    '{"servings": 12, "calories": 45, "protein": "2g", "carbs": "6g", "fat": "2g", "sodium": "180mg"}'::jsonb,
    ARRAY['Dried Green Onions', 'Sesame Seeds', 'Nori Seaweed', 'Fried Garlic', 'Chili Flakes'],
    ARRAY['Sesame', 'Seaweed'],
    ARRAY['Whole Ingredients', 'Small Batch', 'Low Fat', 'Non-GMO'],
    '#fe90b8'
  ),
  (
    'spicy-lovers-mix',
    'Spicy Lover''s Mix',
    'For those who like it hot! A fiery blend of chili flakes, spicy sesame oil powder, and crispy garlic.',
    19.99,
    NULL,
    '[
      {"url": "/products/spicy-mix-1.jpg", "alt": "Spicy Lover''s Mix", "type": "main"},
      {"url": "/products/spicy-mix-2.jpg", "alt": "Spicy ingredients", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'mixes'),
    ARRAY['spicy', 'hot'],
    200,
    '{"servings": 10, "calories": 50, "protein": "1g", "carbs": "5g", "fat": "3g", "sodium": "200mg"}'::jsonb,
    ARRAY['Chili Flakes', 'Sesame Oil Powder', 'Fried Garlic', 'Szechuan Pepper'],
    ARRAY['Sesame'],
    ARRAY['Whole Ingredients', 'Small Batch', 'Non-GMO'],
    '#ff4100'
  ),
  
  -- Single Toppings
  (
    'crispy-garlic',
    'Crispy Garlic',
    'Premium fried garlic chips that add the perfect crunch and savory flavor to any bowl of ramen.',
    12.99,
    NULL,
    '[
      {"url": "/products/garlic-1.jpg", "alt": "Crispy Garlic jar", "type": "main"},
      {"url": "/products/garlic-2.jpg", "alt": "Garlic closeup", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'single-toppings'),
    ARRAY['bestseller', 'crunchy'],
    300,
    '{"servings": 20, "calories": 35, "protein": "1g", "carbs": "4g", "fat": "2g", "sodium": "120mg"}'::jsonb,
    ARRAY['Garlic', 'Palm Oil', 'Salt'],
    ARRAY[]::text[],
    ARRAY['Whole Ingredients', 'Small Batch', 'Non-GMO'],
    '#96da2f'
  ),
  (
    'sesame-seeds',
    'Toasted Sesame Seeds',
    'Perfectly toasted sesame seeds that add a nutty flavor and beautiful presentation to your ramen.',
    9.99,
    NULL,
    '[
      {"url": "/products/sesame-1.jpg", "alt": "Sesame Seeds jar", "type": "main"},
      {"url": "/products/sesame-2.jpg", "alt": "Sesame seeds closeup", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'single-toppings'),
    ARRAY['classic', 'nutty'],
    250,
    '{"servings": 25, "calories": 52, "protein": "2g", "carbs": "2g", "fat": "4g", "sodium": "1mg"}'::jsonb,
    ARRAY['Sesame Seeds'],
    ARRAY['Sesame'],
    ARRAY['Whole Ingredients', 'Low Fat', 'Non-GMO'],
    '#e47e4a'
  ),
  (
    'nori-strips',
    'Nori Seaweed Strips',
    'Crispy nori seaweed strips that add umami depth and authentic Japanese flavor.',
    11.99,
    NULL,
    '[
      {"url": "/products/nori-1.jpg", "alt": "Nori Strips package", "type": "main"},
      {"url": "/products/nori-2.jpg", "alt": "Nori strips closeup", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'single-toppings'),
    ARRAY['umami', 'authentic'],
    180,
    '{"servings": 15, "calories": 10, "protein": "1g", "carbs": "1g", "fat": "0g", "sodium": "50mg"}'::jsonb,
    ARRAY['Nori Seaweed'],
    ARRAY['Seaweed'],
    ARRAY['Whole Ingredients', 'Low Fat', 'Non-GMO'],
    '#F999BF'
  ),
  
  -- Bundles
  (
    'starter-bundle',
    'Ramen Starter Bundle',
    'Everything you need to start your ramen journey! Includes our Ultimate Mix, Crispy Garlic, and Sesame Seeds.',
    44.99,
    54.97,
    '[
      {"url": "/products/starter-bundle-1.jpg", "alt": "Starter Bundle", "type": "main"},
      {"url": "/products/starter-bundle-2.jpg", "alt": "Bundle contents", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'bundles'),
    ARRAY['bestseller', 'value-pack', 'bundle'],
    100,
    NULL,
    ARRAY['See individual products'],
    ARRAY['Sesame', 'Seaweed'],
    ARRAY['Whole Ingredients', 'Small Batch', 'Non-GMO'],
    '#fe90b8'
  ),
  
  -- Seasoning and Sauce
  (
    'umami-powder',
    'Umami Boost Powder',
    'Concentrated umami powder made from shiitake mushrooms and kombu. A little goes a long way!',
    14.99,
    NULL,
    '[
      {"url": "/products/umami-1.jpg", "alt": "Umami Powder jar", "type": "main"},
      {"url": "/products/umami-2.jpg", "alt": "Powder closeup", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'seasoning-and-sauce'),
    ARRAY['umami', 'concentrated'],
    220,
    '{"servings": 30, "calories": 15, "protein": "1g", "carbs": "3g", "fat": "0g", "sodium": "280mg"}'::jsonb,
    ARRAY['Shiitake Mushroom Powder', 'Kombu Powder', 'Sea Salt'],
    ARRAY['Mushroom'],
    ARRAY['Whole Ingredients', 'Small Batch', 'Low Fat'],
    '#96da2f'
  ),
  (
    'chili-oil',
    'Spicy Chili Oil',
    'House-made chili oil with Szechuan peppercorns for that perfect numbing heat.',
    16.99,
    NULL,
    '[
      {"url": "/products/chili-oil-1.jpg", "alt": "Chili Oil bottle", "type": "main"},
      {"url": "/products/chili-oil-2.jpg", "alt": "Oil pouring", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'seasoning-and-sauce'),
    ARRAY['spicy', 'hot', 'oil'],
    150,
    '{"servings": 20, "calories": 120, "protein": "0g", "carbs": "0g", "fat": "14g", "sodium": "0mg"}'::jsonb,
    ARRAY['Vegetable Oil', 'Chili Flakes', 'Szechuan Peppercorns', 'Garlic'],
    ARRAY[]::text[],
    ARRAY['Small Batch', 'Non-GMO'],
    '#ff4100'
  ),
  
  -- Merch
  (
    'ramen-bae-tshirt',
    'Ramen Bae T-Shirt',
    'Show your love for ramen with our signature pink t-shirt featuring the Ramen Bae logo.',
    29.99,
    NULL,
    '[
      {"url": "/products/tshirt-1.jpg", "alt": "Ramen Bae T-Shirt", "type": "main"},
      {"url": "/products/tshirt-2.jpg", "alt": "T-shirt back", "type": "hover"}
    ]'::jsonb,
    (SELECT id FROM categories WHERE slug = 'merch'),
    ARRAY['apparel', 'cotton'],
    50,
    NULL,
    ARRAY['100% Cotton', 'Screen Printed'],
    ARRAY[]::text[],
    ARRAY['Soft Cotton', 'Durable Print'],
    '#fe90b8'
  );

-- Insert sample reviews
INSERT INTO reviews (product_id, user_name, rating, title, body, verified, helpful) VALUES
  (
    (SELECT id FROM products WHERE slug = 'ultimate-ramen-mix'),
    'Sarah M.',
    5,
    'Game changer for instant ramen!',
    'I never knew instant ramen could taste this good! The mix of toppings adds so much flavor and texture. Highly recommend!',
    true,
    24
  ),
  (
    (SELECT id FROM products WHERE slug = 'ultimate-ramen-mix'),
    'Mike T.',
    5,
    'Worth every penny',
    'Been buying this for months now. The quality is consistent and it makes my lunch breaks so much better.',
    true,
    18
  ),
  (
    (SELECT id FROM products WHERE slug = 'ultimate-ramen-mix'),
    'Jessica L.',
    4,
    'Great but wish it was bigger',
    'Love the product but I go through it so fast! Would love to see a larger size option.',
    true,
    12
  ),
  (
    (SELECT id FROM products WHERE slug = 'crispy-garlic'),
    'David K.',
    5,
    'Best garlic chips ever',
    'These are so addictive! I put them on everything, not just ramen. The crunch is perfect.',
    true,
    31
  ),
  (
    (SELECT id FROM products WHERE slug = 'crispy-garlic'),
    'Emily R.',
    5,
    'Can''t live without these',
    'I''ve tried other brands but nothing compares to the quality and flavor of these garlic chips.',
    true,
    15
  ),
  (
    (SELECT id FROM products WHERE slug = 'spicy-lovers-mix'),
    'Alex P.',
    5,
    'Perfect heat level',
    'As someone who loves spicy food, this hits the spot perfectly. Not too mild, not too extreme.',
    true,
    22
  ),
  (
    (SELECT id FROM products WHERE slug = 'starter-bundle'),
    'Rachel W.',
    5,
    'Perfect gift!',
    'Bought this as a gift for my brother who loves ramen. He was thrilled! Great value too.',
    true,
    19
  );

-- Update review stats (this would normally be done via triggers or functions)
-- For now, we'll leave it as the application will calculate these dynamically
