# Product Seeding and Image Generation Workflow

## Overview
This document describes the workflow for seeding products and generating placeholder images for the Ramen Bae e-commerce site.

## Quick Start

### Option 1: Run Combined Script (Recommended)
```bash
./scripts/seed-and-generate-images.sh
```

### Option 2: Run Steps Manually
```bash
# Step 1: Seed products
npx tsx scripts/seed-more-products.ts

# Step 2: Generate images
node scripts/create-missing-images.js
```

## What Each Script Does

### 1. seed-more-products.ts
**Purpose**: Generates and inserts test products into the database

**Features**:
- Creates 48 diverse products with randomized data
- Distributes products across all 5 categories:
  - Mixes (🍜)
  - Single Toppings (🥚)
  - Bundles (📦)
  - Seasoning and Sauce (🧂)
  - Merch (👕)
- Generates realistic product data:
  - Random prices ($9.99 - $39.99)
  - Varied inventory levels (50-350 units)
  - Different tags (bestseller, new, spicy, etc.)
  - Nutrition facts
  - Features and allergens
- Uses category-specific accent colors

**Output**:
```
Fetching categories...
Found 5 categories
Inserting 48 products...
✅ Successfully inserted 48 products!

📸 Run the following command to generate product images:
node scripts/create-missing-images.js
```

### 2. create-missing-images.js
**Purpose**: Generates SVG placeholder images and updates product records

**Features**:
- Fetches all products from Supabase
- Creates two images per product:
  - Main image (`{slug}-1.svg`)
  - Hover image (`{slug}-2.svg` with visual indicator)
- Uses product-specific colors from accent_color field
- Handles long product names with text wrapping
- Updates database with correct image paths
- Skips existing images (idempotent)

**Output**:
```
Fetching products from Supabase...
Found 57 products
✅ Created: /path/to/public/products/product-name-1.svg
✅ Created: /path/to/public/products/product-name-2.svg
...
Updating 57 products with new image paths...
✅ Updated product {id}
...
✨ Done! All product images created and database updated.
```

## Image Generation Details

### SVG Format
- Size: 400x400px
- Background: Semi-transparent color fill
- Border: Dashed stroke in accent color
- Text: Product name (auto-wrapped for long names)
- Hover indicator: Small circle in top-right corner

### Color Scheme
Images use category-specific colors:
- **Mixes**: Pink (#fe90b8)
- **Single Toppings**: Green (#96da2f)
- **Bundles**: Light Pink (#FFB6C1)
- **Seasoning and Sauce**: Orange-Red (#ff4100)
- **Merch**: Sky Blue (#87CEEB)

### File Structure
```
public/
└── products/
    ├── ultimate-ramen-mix-1.svg
    ├── ultimate-ramen-mix-2.svg
    ├── premium-green-onions-1.svg
    ├── premium-green-onions-2.svg
    └── ... (114 total files for 57 products)
```

## Database Updates

The image generation script updates the `products` table:

**Before**:
```json
{
  "images": []
}
```

**After**:
```json
{
  "images": [
    {
      "url": "/products/product-slug-1.svg",
      "alt": "Product Name main",
      "type": "main"
    },
    {
      "url": "/products/product-slug-2.svg",
      "alt": "Product Name hover",
      "type": "hover"
    }
  ]
}
```

## Environment Requirements

Both scripts require:
- `.env.local` file with Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- Node.js and pnpm installed
- Supabase database with categories already seeded

## Troubleshooting

### "supabaseKey is required" Error
- Ensure `.env.local` exists and contains `SUPABASE_SERVICE_ROLE_KEY`
- Check that the key is not commented out

### Images Not Showing
1. Verify images were created: `ls public/products/`
2. Check database was updated: Query products table for `images` field
3. Restart dev server to clear cache

### Products Not Seeding
- Ensure categories exist in database first
- Check Supabase connection and credentials
- Verify you have write permissions

## Integration with Products Page

The generated products and images work seamlessly with:
- **Infinite Scroll**: Loads products as you scroll
- **Pagination**: Traditional page-based navigation
- **Category Filtering**: Filter by product category
- **Product Cards**: Display with hover effects

Visit `/products` to see the results!

## Cleanup

To remove seeded products and start fresh:
```sql
-- Delete all products except original ones
DELETE FROM products 
WHERE created_at > '2025-11-07 08:00:00';
```

Then remove generated images:
```bash
rm public/products/*-1.svg public/products/*-2.svg
```

## Future Enhancements

Potential improvements:
- Add more realistic product descriptions
- Generate product variations (sizes, colors)
- Create product relationships (related products)
- Add more diverse nutrition facts
- Generate review data for products
