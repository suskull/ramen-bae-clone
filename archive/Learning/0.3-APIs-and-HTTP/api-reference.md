# API Quick Reference

## HTTP Methods (CRUD Operations)

| Method | Purpose | SQL Equivalent | Example |
|--------|---------|----------------|---------|
| GET | Read/Retrieve | SELECT | Get products list |
| POST | Create | INSERT | Create new product |
| PUT | Replace entire resource | UPDATE (all fields) | Replace product |
| PATCH | Update partial resource | UPDATE (some fields) | Update price only |
| DELETE | Remove | DELETE | Delete product |

## HTTP Status Codes

### 2xx - Success
| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE (no data to return) |

### 4xx - Client Errors
| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid data format, missing required fields |
| 401 | Unauthorized | Not logged in, invalid token |
| 403 | Forbidden | Logged in but no permission |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed (valid format, invalid data) |

### 5xx - Server Errors
| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unexpected error, database error |
| 503 | Service Unavailable | Server is down, maintenance |

## Next.js API Route Structure

### Basic Route
```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ data: body }, { status: 201 });
}
```

### Dynamic Route
```typescript
// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  return NextResponse.json({ id });
}
```

### Nested Dynamic Route
```typescript
// app/api/products/[id]/reviews/[reviewId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  const { id, reviewId } = params;
  return NextResponse.json({ productId: id, reviewId });
}
```

## Request Handling

### Get Request Body
```typescript
const body = await request.json();
```

### Get Query Parameters
```typescript
const searchParams = request.nextUrl.searchParams;
const category = searchParams.get('category');
const page = searchParams.get('page') || '1';
```

### Get Headers
```typescript
const authHeader = request.headers.get('authorization');
const contentType = request.headers.get('content-type');
```

## Response Patterns

### Success Response
```typescript
return NextResponse.json({ 
  data: products,
  count: products.length 
});
```

### Error Response
```typescript
return NextResponse.json(
  { error: 'Product not found' },
  { status: 404 }
);
```

### With Custom Headers
```typescript
return NextResponse.json(
  { data: products },
  { 
    status: 200,
    headers: {
      'Cache-Control': 'max-age=60',
      'X-Total-Count': products.length.toString()
    }
  }
);
```

## REST URL Patterns

### Collections
```
GET    /api/products              # List all products
POST   /api/products              # Create new product
```

### Individual Resources
```
GET    /api/products/123          # Get product 123
PUT    /api/products/123          # Replace product 123
PATCH  /api/products/123          # Update product 123
DELETE /api/products/123          # Delete product 123
```

### Nested Resources
```
GET    /api/products/123/reviews  # Get reviews for product 123
POST   /api/products/123/reviews  # Add review to product 123
GET    /api/products/123/reviews/5 # Get specific review
```

### Query Parameters (Filtering)
```
GET /api/products?category=mixes
GET /api/products?minPrice=10&maxPrice=30
GET /api/products?page=2&limit=20
GET /api/products?sort=price&order=desc
```

## Validation with Zod

### Basic Schema
```typescript
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  inventory: z.number().int().min(0).default(0)
});

// Validate
try {
  const validData = productSchema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
}
```

### Common Validations
```typescript
z.string()              // String
z.string().email()      // Email format
z.string().url()        // URL format
z.string().uuid()       // UUID format
z.string().min(3)       // Min length
z.string().max(100)     // Max length
z.string().optional()   // Optional field

z.number()              // Number
z.number().int()        // Integer only
z.number().positive()   // > 0
z.number().min(1)       // >= 1
z.number().max(5)       // <= 5

z.boolean()             // Boolean
z.date()                // Date
z.array(z.string())     // Array of strings
z.enum(['draft', 'published']) // Enum
```

## Error Handling Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      throw new Error('Database error');
    }
    
    return NextResponse.json({ products: data });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing APIs

### Browser Console
```javascript
// GET
const res = await fetch('/api/products');
const data = await res.json();

// POST
const res = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test', price: 19.99 })
});

// With query params
const res = await fetch('/api/products?category=mixes&minPrice=10');
```

### curl
```bash
# GET
curl http://localhost:3000/api/products

# POST
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":19.99}'

# PUT
curl -X PUT http://localhost:3000/api/products/123 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":24.99}'

# DELETE
curl -X DELETE http://localhost:3000/api/products/123
```

## Common Patterns

### Pagination
```typescript
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '10');
const offset = (page - 1) * limit;

const { data, error, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);

return NextResponse.json({
  products: data,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil(count / limit)
  }
});
```

### Sorting
```typescript
const sort = searchParams.get('sort') || 'created_at';
const order = searchParams.get('order') || 'desc';

const { data } = await supabase
  .from('products')
  .select('*')
  .order(sort, { ascending: order === 'asc' });
```

### Filtering
```typescript
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

const { data } = await query;
```

## Best Practices

1. **Always validate input data**
2. **Use appropriate status codes**
3. **Handle errors gracefully**
4. **Return consistent response format**
5. **Use TypeScript for type safety**
6. **Log errors for debugging**
7. **Don't expose sensitive data**
8. **Use environment variables for secrets**
9. **Implement rate limiting for production**
10. **Document your API endpoints**
