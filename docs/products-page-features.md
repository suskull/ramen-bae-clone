# Products Page Features

## Overview
The products listing page (`/products`) supports both **infinite scroll** and **pagination** modes, allowing users to browse products in their preferred way.

## Features

### 1. Dual View Modes

#### Infinite Scroll (Default)
- Products load automatically as you scroll down
- Smooth, continuous browsing experience
- Shows "Loading..." indicator when fetching more products
- Displays "You've reached the end" message when all products are loaded
- URL parameter: `?view=infinite`

#### Pagination
- Traditional page-based navigation
- Shows page numbers with smart ellipsis (1 ... 4 5 6 ... 10)
- Previous/Next buttons
- Page number in URL for bookmarking (`?page=2`)
- Shows result count (e.g., "Showing 13-24 of 57 products")
- URL parameter: `?view=pagination`

### 2. View Mode Toggle
- Button in the header to switch between modes
- Preserves category filter when switching
- Resets to first page/top when switching modes
- Mode preference stored in URL

### 3. Category Filtering
- Filter by: Mixes, Single Toppings, Bundles, Seasoning and Sauce, Merch
- "All Products" option to show everything
- Works seamlessly with both view modes
- Category stored in URL (`?category=mixes`)

### 4. Performance Features
- React Query caching (5-minute stale time)
- Optimized API queries with limit/offset
- Skeleton loading states
- Intersection Observer for efficient infinite scroll

## Usage

### Default (Infinite Scroll)
```
/products
/products?category=mixes
```

### Pagination Mode
```
/products?view=pagination
/products?view=pagination&category=single-toppings&page=2
```

## Technical Implementation

### Files
- `src/app/products/page.tsx` - Main products page with mode switching
- `src/components/product/ProductGrid.tsx` - Pagination grid component
- `src/components/product/InfiniteProductGrid.tsx` - Infinite scroll grid component
- `src/hooks/useProducts.ts` - Pagination data hook
- `src/hooks/useInfiniteProducts.ts` - Infinite scroll data hook
- `src/components/ui/pagination.tsx` - Pagination UI component

### API
- Endpoint: `/api/products`
- Parameters:
  - `category` - Filter by category slug
  - `limit` - Products per page (default: 20)
  - `offset` - Starting position for pagination
- Returns: `{ products, total, limit, offset }`

## Testing

### Seed Data
Run the seed script to generate 50+ test products:
```bash
# Step 1: Seed products
npx tsx scripts/seed-more-products.ts

# Step 2: Generate product images and update database
node scripts/create-missing-images.js
```

This creates diverse products across all categories for testing pagination and infinite scroll.

### What the Scripts Do

**seed-more-products.ts**
- Generates 48 additional products with random data
- Distributes products across all categories
- Creates varied pricing, tags, and features
- Inserts products into Supabase database

**create-missing-images.js**
- Fetches all products from Supabase
- Generates SVG placeholder images for each product
- Creates both main and hover images
- Updates product records with correct image paths
- Uses category-specific colors for visual variety
