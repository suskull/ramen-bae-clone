INSERT INTO categories (id, name, slug, description, icon, created_at, updated_at) VALUES
('a3e2e9ba-2017-49fb-a602-8793595cceb3', 'Mixes', 'mixes', NULL, '🍜', '2025-11-07 04:06:38.159873+00', '2025-11-07 04:06:38.159873+00'),
('05273835-89ee-491f-82c9-e4ae2b1d6b2c', 'Single Toppings', 'single-toppings', NULL, '🥚', '2025-11-07 04:06:38.159873+00', '2025-11-07 04:06:38.159873+00'),
('6c96b9b6-c725-4888-86cd-0531da960a07', 'Bundles', 'bundles', NULL, '📦', '2025-11-07 04:06:38.159873+00', '2025-11-07 04:06:38.159873+00'),
('e310a7f9-59ed-4511-be06-ca1024f1266e', 'Seasoning and Sauce', 'seasoning-and-sauce', NULL, '🧂', '2025-11-07 04:06:38.159873+00', '2025-11-07 04:06:38.159873+00'),
('250ff765-9472-4ce4-8c53-8582acb5d40f', 'Merch', 'merch', NULL, '👕', '2025-11-07 04:06:38.159873+00', '2025-11-07 04:06:38.159873+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  updated_at = EXCLUDED.updated_at;
