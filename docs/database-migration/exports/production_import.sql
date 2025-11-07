-- ============================================================================
-- LOCAL DATABASE DATA EXPORT
-- Generated: 2025-11-07T04:27:55.912Z
-- ============================================================================
-- This file contains all data from your local database
-- Run this in production to sync data
-- ============================================================================

-- Disable triggers temporarily for faster import
SET session_replication_role = replica;

-- Data for categories
INSERT INTO categories (id, name, slug, description, icon, created_at, updated_at)
VALUES
('a3e2e9ba-2017-49fb-a602-8793595cceb3', 'Mixes', 'mixes', NULL, '🍜', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('05273835-89ee-491f-82c9-e4ae2b1d6b2c', 'Single Toppings', 'single-toppings', NULL, '🥚', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('6c96b9b6-c725-4888-86cd-0531da960a07', 'Bundles', 'bundles', NULL, '📦', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('e310a7f9-59ed-4511-be06-ca1024f1266e', 'Seasoning and Sauce', 'seasoning-and-sauce', NULL, '🧂', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('250ff765-9472-4ce4-8c53-8582acb5d40f', 'Merch', 'merch', NULL, '👕', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

-- Data for products
INSERT INTO products (id, slug, name, description, price, compare_at_price, images, category_id, tags, inventory, nutrition_facts, ingredients, allergens, features, accent_color, created_at, updated_at)
VALUES
('bfd96874-11c0-4e69-8177-623a0e8128c4', 'ultimate-ramen-mix', 'Ultimate Ramen Mix', 'The perfect combination of all our best toppings in one convenient package. Elevate your instant ramen with crispy onions, sesame seeds, nori strips, and more!', 24.99, 29.99, '[{"alt":"Ultimate Ramen Mix package","url":"/products/ultimate-mix-1.jpg","type":"main"},{"alt":"Ultimate Ramen Mix contents","url":"/products/ultimate-mix-2.jpg","type":"hover"}]'::jsonb, 'a3e2e9ba-2017-49fb-a602-8793595cceb3', ARRAY['bestseller','value-pack'], 150, '{"fat":"2g","carbs":"6g","sodium":"180mg","protein":"2g","calories":45,"servings":12}'::jsonb, ARRAY['Dried Green Onions','Sesame Seeds','Nori Seaweed','Fried Garlic','Chili Flakes'], ARRAY['Sesame','Seaweed'], ARRAY['Whole Ingredients','Small Batch','Low Fat','Non-GMO'], '#fe90b8', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('0fbf743a-2c24-46bc-9b98-8cf8f6fff8e7', 'spicy-lovers-mix', 'Spicy Lover''s Mix', 'For those who like it hot! A fiery blend of chili flakes, spicy sesame oil powder, and crispy garlic.', 19.99, NULL, '[{"alt":"Spicy Lover''s Mix","url":"/products/spicy-mix-1.jpg","type":"main"},{"alt":"Spicy ingredients","url":"/products/spicy-mix-2.jpg","type":"hover"}]'::jsonb, 'a3e2e9ba-2017-49fb-a602-8793595cceb3', ARRAY['spicy','hot'], 200, '{"fat":"3g","carbs":"5g","sodium":"200mg","protein":"1g","calories":50,"servings":10}'::jsonb, ARRAY['Chili Flakes','Sesame Oil Powder','Fried Garlic','Szechuan Pepper'], ARRAY['Sesame'], ARRAY['Whole Ingredients','Small Batch','Non-GMO'], '#ff4100', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('3e6c3f15-789c-4299-bda1-88e45f6d6c18', 'crispy-garlic', 'Crispy Garlic', 'Premium fried garlic chips that add the perfect crunch and savory flavor to any bowl of ramen.', 12.99, NULL, '[{"alt":"Crispy Garlic jar","url":"/products/garlic-1.jpg","type":"main"},{"alt":"Garlic closeup","url":"/products/garlic-2.jpg","type":"hover"}]'::jsonb, '05273835-89ee-491f-82c9-e4ae2b1d6b2c', ARRAY['bestseller','crunchy'], 300, '{"fat":"2g","carbs":"4g","sodium":"120mg","protein":"1g","calories":35,"servings":20}'::jsonb, ARRAY['Garlic','Palm Oil','Salt'], '{}', ARRAY['Whole Ingredients','Small Batch','Non-GMO'], '#96da2f', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('2da7f0cc-71d7-4443-8560-80ba49f5afb4', 'sesame-seeds', 'Toasted Sesame Seeds', 'Perfectly toasted sesame seeds that add a nutty flavor and beautiful presentation to your ramen.', 9.99, NULL, '[{"alt":"Sesame Seeds jar","url":"/products/sesame-1.jpg","type":"main"},{"alt":"Sesame seeds closeup","url":"/products/sesame-2.jpg","type":"hover"}]'::jsonb, '05273835-89ee-491f-82c9-e4ae2b1d6b2c', ARRAY['classic','nutty'], 250, '{"fat":"4g","carbs":"2g","sodium":"1mg","protein":"2g","calories":52,"servings":25}'::jsonb, ARRAY['Sesame Seeds'], ARRAY['Sesame'], ARRAY['Whole Ingredients','Low Fat','Non-GMO'], '#e47e4a', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('8c21b33b-9d15-45d8-85a8-9e3c98761a3e', 'nori-strips', 'Nori Seaweed Strips', 'Crispy nori seaweed strips that add umami depth and authentic Japanese flavor.', 11.99, NULL, '[{"alt":"Nori Strips package","url":"/products/nori-1.jpg","type":"main"},{"alt":"Nori strips closeup","url":"/products/nori-2.jpg","type":"hover"}]'::jsonb, '05273835-89ee-491f-82c9-e4ae2b1d6b2c', ARRAY['umami','authentic'], 180, '{"fat":"0g","carbs":"1g","sodium":"50mg","protein":"1g","calories":10,"servings":15}'::jsonb, ARRAY['Nori Seaweed'], ARRAY['Seaweed'], ARRAY['Whole Ingredients','Low Fat','Non-GMO'], '#F999BF', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('88bea880-535b-4d62-bc13-d03f5a08600f', 'starter-bundle', 'Ramen Starter Bundle', 'Everything you need to start your ramen journey! Includes our Ultimate Mix, Crispy Garlic, and Sesame Seeds.', 44.99, 54.97, '[{"alt":"Starter Bundle","url":"/products/starter-bundle-1.jpg","type":"main"},{"alt":"Bundle contents","url":"/products/starter-bundle-2.jpg","type":"hover"}]'::jsonb, '6c96b9b6-c725-4888-86cd-0531da960a07', ARRAY['bestseller','value-pack','bundle'], 100, NULL, ARRAY['See individual products'], ARRAY['Sesame','Seaweed'], ARRAY['Whole Ingredients','Small Batch','Non-GMO'], '#fe90b8', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('233b3b53-c046-498c-8625-dcb629db1e22', 'umami-powder', 'Umami Boost Powder', 'Concentrated umami powder made from shiitake mushrooms and kombu. A little goes a long way!', 14.99, NULL, '[{"alt":"Umami Powder jar","url":"/products/umami-1.jpg","type":"main"},{"alt":"Powder closeup","url":"/products/umami-2.jpg","type":"hover"}]'::jsonb, 'e310a7f9-59ed-4511-be06-ca1024f1266e', ARRAY['umami','concentrated'], 220, '{"fat":"0g","carbs":"3g","sodium":"280mg","protein":"1g","calories":15,"servings":30}'::jsonb, ARRAY['Shiitake Mushroom Powder','Kombu Powder','Sea Salt'], ARRAY['Mushroom'], ARRAY['Whole Ingredients','Small Batch','Low Fat'], '#96da2f', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('16a66a12-3971-4524-b303-634f3bc7f5ce', 'chili-oil', 'Spicy Chili Oil', 'House-made chili oil with Szechuan peppercorns for that perfect numbing heat.', 16.99, NULL, '[{"alt":"Chili Oil bottle","url":"/products/chili-oil-1.jpg","type":"main"},{"alt":"Oil pouring","url":"/products/chili-oil-2.jpg","type":"hover"}]'::jsonb, 'e310a7f9-59ed-4511-be06-ca1024f1266e', ARRAY['spicy','hot','oil'], 150, '{"fat":"14g","carbs":"0g","sodium":"0mg","protein":"0g","calories":120,"servings":20}'::jsonb, ARRAY['Vegetable Oil','Chili Flakes','Szechuan Peppercorns','Garlic'], '{}', ARRAY['Small Batch','Non-GMO'], '#ff4100', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00'),
('9330a409-c15f-4836-90dc-0ab9568a2c6d', 'ramen-bae-tshirt', 'Ramen Bae T-Shirt', 'Show your love for ramen with our signature pink t-shirt featuring the Ramen Bae logo.', 29.99, NULL, '[{"alt":"Ramen Bae T-Shirt","url":"/products/tshirt-1.jpg","type":"main"},{"alt":"T-shirt back","url":"/products/tshirt-2.jpg","type":"hover"}]'::jsonb, '250ff765-9472-4ce4-8c53-8582acb5d40f', ARRAY['apparel','cotton'], 50, NULL, ARRAY['100% Cotton','Screen Printed'], '{}', ARRAY['Soft Cotton','Durable Print'], '#fe90b8', '2025-11-07T04:06:38.159873+00:00', '2025-11-07T04:06:38.159873+00:00')
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  images = EXCLUDED.images,
  category_id = EXCLUDED.category_id,
  tags = EXCLUDED.tags,
  inventory = EXCLUDED.inventory,
  nutrition_facts = EXCLUDED.nutrition_facts,
  ingredients = EXCLUDED.ingredients,
  allergens = EXCLUDED.allergens,
  features = EXCLUDED.features,
  accent_color = EXCLUDED.accent_color,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

-- Data for reviews
INSERT INTO reviews (id, product_id, user_id, user_name, rating, title, body, verified, media, helpful, created_at)
VALUES
('f259f8d9-b33d-4717-b5a7-b32025344aa9', 'bfd96874-11c0-4e69-8177-623a0e8128c4', NULL, 'Sarah M.', 5, 'Game changer for instant ramen!', 'I never knew instant ramen could taste this good! The mix of toppings adds so much flavor and texture. Highly recommend!', true, '{}', 24, '2025-11-07T04:06:38.159873+00:00'),
('7d1ea949-1cb8-485d-b6ca-7b9cc897848d', 'bfd96874-11c0-4e69-8177-623a0e8128c4', NULL, 'Mike T.', 5, 'Worth every penny', 'Been buying this for months now. The quality is consistent and it makes my lunch breaks so much better.', true, '{}', 18, '2025-11-07T04:06:38.159873+00:00'),
('f1b1e65b-3cf9-420f-98e7-5978d1038ebb', 'bfd96874-11c0-4e69-8177-623a0e8128c4', NULL, 'Jessica L.', 4, 'Great but wish it was bigger', 'Love the product but I go through it so fast! Would love to see a larger size option.', true, '{}', 12, '2025-11-07T04:06:38.159873+00:00'),
('9589bc2c-6f41-47ad-911a-d2a6b0947150', '3e6c3f15-789c-4299-bda1-88e45f6d6c18', NULL, 'David K.', 5, 'Best garlic chips ever', 'These are so addictive! I put them on everything, not just ramen. The crunch is perfect.', true, '{}', 31, '2025-11-07T04:06:38.159873+00:00'),
('6db123e6-f7dd-4821-9602-7fb259ca7de5', '3e6c3f15-789c-4299-bda1-88e45f6d6c18', NULL, 'Emily R.', 5, 'Can''t live without these', 'I''ve tried other brands but nothing compares to the quality and flavor of these garlic chips.', true, '{}', 15, '2025-11-07T04:06:38.159873+00:00'),
('753d31f9-2074-4a54-96cf-69775b237692', '0fbf743a-2c24-46bc-9b98-8cf8f6fff8e7', NULL, 'Alex P.', 5, 'Perfect heat level', 'As someone who loves spicy food, this hits the spot perfectly. Not too mild, not too extreme.', true, '{}', 22, '2025-11-07T04:06:38.159873+00:00'),
('e6371143-2fb5-4fda-b62f-98c5be119d35', '88bea880-535b-4d62-bc13-d03f5a08600f', NULL, 'Rachel W.', 5, 'Perfect gift!', 'Bought this as a gift for my brother who loves ramen. He was thrilled! Great value too.', true, '{}', 19, '2025-11-07T04:06:38.159873+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  user_id = EXCLUDED.user_id,
  user_name = EXCLUDED.user_name,
  rating = EXCLUDED.rating,
  title = EXCLUDED.title,
  body = EXCLUDED.body,
  verified = EXCLUDED.verified,
  media = EXCLUDED.media,
  helpful = EXCLUDED.helpful,
  created_at = EXCLUDED.created_at;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================================================
-- Import complete!
-- ============================================================================
