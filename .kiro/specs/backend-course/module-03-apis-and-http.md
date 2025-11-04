# Module 3: APIs and HTTP (Think: Function Calls Over the Internet)

## Learning Objectives
- Understand what APIs are and why we need them
- Learn HTTP methods and status codes
- Understand REST API design principles
- Build your first API endpoint
- Relate API concepts to frontend function calls

## 3.1 What is an API?

### Frontend Function Call vs API Call

**Frontend Function (Same Computer):**
```javascript
// Function definition
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Function call
const total = calculateTotal(cartItems); // Instant response
```

**API Call (Different Computer):**
```javascript
// API call - function runs on server
const response = await fetch('/api/cart/total', {
  method: 'POST',
  body: JSON.stringify({ items: cartItems })
});
const { total } = await response.json(); // Takes time (network)
```

**WHY**: API = Application Programming Interface = A way for programs to talk to each other

**Frontend analogy**: Like calling a function, but:
- The function runs on a different computer
- It takes longer (network latency)
- It can fail (network issues)
- It needs authentication (security)

## 3.2 HTTP: The Language of the Web

### HTTP Methods (Like Function Types)

**Frontend analogy - Array methods:**
```javascript
const products = [];

// GET = Read (like .find() or .filter())
products.find(p => p.id === 1);

// POST = Create (like .push())
products.push(newProduct);

// PUT/PATCH = Update (like .map())
products.map(p => p.id === 1 ? updatedProduct : p);

// DELETE = Remove (like .filter())
products.filter(p => p.id !== 1);
```

**HTTP Methods:**
```javascript
// GET - Retrieve data (Read)
fetch('/api/products/1') // Get product with id 1

// POST - Create new data (Create)
fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify({ name: 'New Product', price: 19.99 })
})

// PUT - Replace entire resource (Update)
fetch('/api/products/1', {
  method: 'PUT',
  body: JSON.stringify({ name: 'Updated Product', price: 24.99 })
})

// PATCH - Update partial resource (Partial Update)
fetch('/api/products/1', {
  method: 'PATCH',
  body: JSON.stringify({ price: 24.99 }) // Only update price
})

// DELETE - Remove data (Delete)
fetch('/api/products/1', {
  method: 'DELETE'
})
```

### HTTP Status Codes (Like Function Return Values)

**Frontend analogy - Error handling:**
```javascript
function getProduct(id) {
  if (!id) throw new Error('ID required'); // 400 Bad Request
  
  const product = products.find(p => p.id === id);
  if (!product) throw new Error('Not found'); // 404 Not Found
  
  if (!user.isAuthenticated) throw new Error('Unauthorized'); // 401 Unauthorized
  
  return product; // 200 OK
}
```

**HTTP Status Codes:**
```javascript
// 2xx - Success
200 OK              // Request succeeded
201 Created         // New resource created
204 No Content      // Success but no data to return

// 4xx - Client Errors (User's fault)
400 Bad Request     // Invalid data sent
401 Unauthorized    // Not logged in
403 Forbidden       // Logged in but no permission
404 Not Found       // Resource doesn't exist
422 Unprocessable   // Validation failed

// 5xx - Server Errors (Our fault)
500 Internal Error  // Something broke on server
503 Service Unavailable // Server is down
```

## 3.3 REST API Design Principles

### Resource-Based URLs (Like File Paths)

**Frontend analogy - Component hierarchy:**
```javascript
<App>
  <Products>           {/* /products */}
    <Product id={1}>   {/* /products/1 */}
      <Reviews>        {/* /products/1/reviews */}
        <Review id={5}> {/* /products/1/reviews/5 */}
```

**REST API URLs:**
```javascript
// Collections (plural nouns)
GET    /api/products              // Get all products
POST   /api/products              // Create new product

// Individual resources
GET    /api/products/1            // Get product 1
PUT    /api/products/1            // Update product 1
DELETE /api/products/1            // Delete product 1

// Nested resources
GET    /api/products/1/reviews    // Get reviews for product 1
POST   /api/products/1/reviews    // Add review to product 1
GET    /api/products/1/reviews/5  // Get specific review
```

**WHY REST**: Predictable, consistent, easy to understand

## 3.4 Building Your First API Endpoint

### Next.js API Routes (App Router)

**File structure:**
```
app/
  api/
    products/
      route.ts           // /api/products
      [id]/
        route.ts         // /api/products/[id]
```

**Simple GET endpoint:**
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Get database client
    const supabase = createClient();
    
    // 2. Query database
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 3. Handle errors
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
    
    // 4. Return success response
    return NextResponse.json({ products }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Frontend analogy:**
```javascript
// Like a function that returns data
async function getProducts() {
  try {
    const products = await database.query('SELECT * FROM products');
    return { success: true, products };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### POST Endpoint with Validation

```typescript
// app/api/products/route.ts
import { z } from 'zod';

// Define validation schema (like TypeScript interface but runtime)
const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category_id: z.string().uuid(),
  inventory: z.number().int().min(0).default(0)
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate data
    const validatedData = productSchema.parse(body);
    
    // 3. Insert into database
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }
    
    // 4. Return created resource
    return NextResponse.json({ product }, { status: 201 });
    
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Frontend analogy:**
```javascript
// Like a function with parameter validation
function createProduct(data) {
  // Validate
  if (!data.name || data.name.length === 0) {
    throw new Error('Name is required');
  }
  if (data.price <= 0) {
    throw new Error('Price must be positive');
  }
  
  // Process
  const product = database.insert(data);
  return product;
}
```

## 3.5 Dynamic Routes (URL Parameters)

### Path Parameters

```typescript
// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  const supabase = createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ product });
}
```

**Frontend analogy:**
```javascript
// Like a function with parameters
function getProduct(id) {
  return products.find(p => p.id === id);
}
```

### Query Parameters

```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  // Get query parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  // Build query
  const supabase = createClient();
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category_id', category);
  }
  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }
  
  const { data: products, error } = await query;
  
  return NextResponse.json({ products });
}
```

**Usage:**
```javascript
// Frontend call
fetch('/api/products?category=mixes&minPrice=10&maxPrice=30')
```

**Frontend analogy:**
```javascript
// Like a function with optional parameters
function getProducts({ category, minPrice, maxPrice } = {}) {
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }
  
  return filtered;
}
```

## 3.6 Error Handling Best Practices

### Consistent Error Response Format

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Centralized error handler
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Usage:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('products').select('*');
    
    if (error) {
      throw new ApiError(500, 'Failed to fetch products', error);
    }
    
    return NextResponse.json({ products: data });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 3.7 Practical Exercise: Build a Review API

**Your task**: Create API endpoints for product reviews

**Requirements:**
1. GET `/api/products/[id]/reviews` - Get all reviews for a product
2. POST `/api/products/[id]/reviews` - Create a new review
3. Validate review data (rating 1-5, body required)
4. Return appropriate status codes

**Solution:**
```typescript
// app/api/products/[id]/reviews/route.ts
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10).max(1000)
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, user:auth.users(email)')
      .eq('product_id', params.id)
      .order('created_at', { ascending: false });
    
    if (error) throw new ApiError(500, 'Failed to fetch reviews');
    
    return NextResponse.json({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new ApiError(401, 'Authentication required');
    }
    
    // Validate request body
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);
    
    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        ...validatedData,
        product_id: params.id,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw new ApiError(500, 'Failed to create review');
    
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

## 3.8 Key Takeaways

- **APIs are like functions** that run on a different computer
- **HTTP methods** map to CRUD operations (GET=Read, POST=Create, etc.)
- **Status codes** communicate success or failure type
- **REST principles** make APIs predictable and consistent
- **Validation is crucial** - never trust client data
- **Error handling** should be consistent and informative

## Next Module Preview

In Module 4, we'll learn about Authentication - think of it as "user state management" but secure and persistent across sessions!
