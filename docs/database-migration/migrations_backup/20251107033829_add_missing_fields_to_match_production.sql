-- Add missing fields to match production schema

-- Ensure categories table has description field
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing categories with descriptions if they don't have them
UPDATE categories SET description = CASE 
  WHEN slug = 'mixes' THEN 'Premium dried ramen seasoning mixes'
  WHEN slug = 'single-toppings' THEN 'Individual dried toppings for customization'
  WHEN slug = 'bundles' THEN 'Complete ramen topping bundles'
  WHEN slug = 'seasoning-and-sauce' THEN 'Seasonings and sauces for flavor enhancement'
  WHEN slug = 'merch' THEN 'Ramen-themed merchandise and accessories'
  ELSE 'Premium ramen products'
END
WHERE description IS NULL OR description = '';

-- Add any other missing fields that production might have
-- (Add more ALTER TABLE statements here as needed)