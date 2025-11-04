# Exercise 02: Database-Backed APIs

Build real APIs that interact with your database using Supabase.

## Learning Objectives

- Connect APIs to database
- Implement GET endpoints with filtering
- Handle database errors
- Return proper status codes
- Use TypeScript for type safety

## Prerequisites

- Completed Exercise 01
- Database set up from Module 2
- Supabase client configured
- Products table exists

## Part 1: Simple GET Endpoint (15 minutes)

### Task 1.1: Get All Products

Create an API to fetch all products from database.

**File**: `app/api/products/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createClient();
    
    // Query database
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Handle database error
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      products,
      count: products.length
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
const response = await fetch('/api/products');
const { products, count } = await response.json();
console.log(`Found ${count} products:`, products);
```

### Task 1.2: Get Single Product

Create an API to fetch a specific product by ID.

**File**: `app/api/products/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Query for specific product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();
    
    // Handle not found
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
// Get first product ID
const { products } = await fetch('/api/products').then(r => r.json());
const firstId = products[0].id;

// Fetch specific product
const response = await fetch(`/api/products/${firstId}`);
const { product } = await response.json();
console.log('Product:', product);

// Try non-existent ID
const notFound = await fetch('/api/products/00000000-0000-0000-0000-000000000000');
console.log('Status:', notFound.status); // 404
```

## Part 2: Filtering and Searching (20 minutes)

### Task 2.1: Filter by Category

Add category filtering to products endpoint.

**Update**: `app/api/products/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const category = searchParams.get('category');
    
    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply category filter if provided
    if (category) {
      query = query.eq('category_id', category);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      products,
      count: products.length,
      filters: { category }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
// All products
fetch('/api/products').then(r => r.json()).then(console.log);

// Filtered by category
fetch('/api/products?category=CATEGORY_ID_HERE')
  .then(r => r.json())
  .then(console.log);
```

### Task 2.2: Price Range Filter

Add minimum and maximum price filters.

**Update**: `app/api/products/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get all filter parameters
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query = query.gte('price', min);
      }
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query = query.lte('price', max);
      }
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      products,
      count: products.length,
      filters: {
        category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
// Products between $10 and $20
fetch('/api/products?minPrice=10&maxPrice=20')
  .then(r => r.json())
  .then(data => {
    console.log(`Found ${data.count} products`);
    console.log('Filters:', data.filters);
    console.log('Products:', data.products);
  });

// Combine filters
fetch('/api/products?category=CATEGORY_ID&minPrice=5&maxPrice=15')
  .then(r => r.json())
  .then(console.log);
```

### Task 2.3: Search by Name

Add text search functionality.

**Update**: `app/api/products/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get all parameters
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (category) {
      query = query.eq('category_id', category);
    }
    
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        query = query.gte('price', min);
      }
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        query = query.lte('price', max);
      }
    }
    
    // Text search (case-insensitive)
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    const { data: products, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      products,
      count: products.length,
      filters: {
        category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        search
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
// Search for "ramen"
fetch('/api/products?search=ramen')
  .then(r => r.json())
  .then(console.log);

// Search with filters
fetch('/api/products?search=tonkotsu&minPrice=10')
  .then(r => r.json())
  .then(console.log);
```

## Part 3: Pagination (15 minutes)

### Task 3.1: Add Pagination

Implement page-based pagination.

**Update**: `app/api/products/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get filters
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    
    // Build query with count
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (category) query = query.eq('category_id', category);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (search) query = query.ilike('name', `%${search}%`);
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: products, error, count } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { category, minPrice, maxPrice, search }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Test it**:
```javascript
// First page
fetch('/api/products?page=1&limit=5')
  .then(r => r.json())
  .then(data => {
    console.log('Page:', data.pagination.page);
    console.log('Total:', data.pagination.total);
    console.log('Total Pages:', data.pagination.totalPages);
    console.log('Products:', data.products.length);
  });

// Second page
fetch('/api/products?page=2&limit=5')
  .then(r => r.json())
  .then(console.log);
```

## Part 4: Related Data (15 minutes)

### Task 4.1: Include Category Information

Fetch products with their category details.

**Update**: `app/api/products/route.ts`

```typescript
// In the query, change select to include category
let query = supabase
  .from('products')
  .select(`
    *,
    category:categories(
      id,
      name,
      slug
    )
  `, { count: 'exact' })
  .order('created_at', { ascending: false });
```

**Test it**:
```javascript
fetch('/api/products')
  .then(r => r.json())
  .then(data => {
    console.log('Product with category:', data.products[0]);
    // Should include category object
  });
```

### Task 4.2: Product with Reviews Count

**Update**: `app/api/products/[id]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Fetch product with category and reviews count
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        ),
        reviews:reviews(count)
      `)
      .eq('id', params.id)
      .single();
    
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Transform reviews count
    const reviewCount = product.reviews?.[0]?.count || 0;
    
    return NextResponse.json({
      product: {
        ...product,
        reviewCount,
        reviews: undefined // Remove the reviews array
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Challenges

### Challenge 1: Sorting
Add sorting capability to products API.

**Requirements**:
- Support `sort` parameter (name, price, created_at)
- Support `order` parameter (asc, desc)
- Default to created_at desc

### Challenge 2: Categories API
Create a complete categories API.

**Requirements**:
- GET `/api/categories` - List all categories
- GET `/api/categories/[id]` - Get single category
- Include product count for each category

### Challenge 3: Low Stock Alert
Create an API that returns products with low inventory.

**Requirements**:
- GET `/api/products/low-stock`
- Accept `threshold` parameter (default 10)
- Return products where inventory < threshold
- Sort by inventory ascending

## Key Takeaways

- Use Supabase client to query database
- Build queries dynamically based on parameters
- Handle database errors gracefully
- Return 404 for not found resources
- Use proper status codes
- Include pagination for large datasets
- Fetch related data efficiently

## Next Exercise

Continue to `03-crud-operations.md` to implement POST, PUT, PATCH, and DELETE!
