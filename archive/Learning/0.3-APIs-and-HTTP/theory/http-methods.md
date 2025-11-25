# HTTP Methods: The Verbs of APIs

HTTP methods tell the server what action you want to perform. Think of them as verbs in a sentence.

## The Big Four: CRUD Operations

| HTTP Method | CRUD | SQL | Array Method | Purpose |
|-------------|------|-----|--------------|---------|
| **GET** | Read | SELECT | .find(), .filter() | Retrieve data |
| **POST** | Create | INSERT | .push() | Create new data |
| **PUT/PATCH** | Update | UPDATE | .map() | Modify existing data |
| **DELETE** | Delete | DELETE | .filter() | Remove data |

## GET - Retrieve Data

**Purpose**: Read/retrieve data without modifying it

**Characteristics**:
- Safe (doesn't change data)
- Idempotent (calling multiple times has same effect)
- Can be cached
- Parameters in URL (query string)

### Examples

```javascript
// Get all products
GET /api/products

// Get specific product
GET /api/products/123

// Get with filters (query parameters)
GET /api/products?category=mixes&minPrice=10

// Get nested resource
GET /api/products/123/reviews
```

### Implementation

```typescript
// app/api/products/route.ts
export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ products });
}
```

### Frontend Usage

```javascript
// Simple GET
const response = await fetch('/api/products');
const { products } = await response.json();

// GET with query parameters
const response = await fetch('/api/products?category=mixes&sort=price');
const { products } = await response.json();
```

### Array Analogy

```javascript
// Like finding items in an array
const products = [
  { id: 1, name: 'Ramen A', price: 10 },
  { id: 2, name: 'Ramen B', price: 15 }
];

// GET /api/products
products; // Get all

// GET /api/products/1
products.find(p => p.id === 1); // Get one

// GET /api/products?minPrice=12
products.filter(p => p.price >= 12); // Get filtered
```

## POST - Create New Data

**Purpose**: Create a new resource

**Characteristics**:
- Not safe (changes data)
- Not idempotent (calling twice creates two resources)
- Data in request body
- Returns created resource

### Examples

```javascript
// Create new product
POST /api/products
Body: { name: "New Ramen", price: 12.99 }

// Create nested resource
POST /api/products/123/reviews
Body: { rating: 5, body: "Amazing!" }
```

### Implementation

```typescript
// app/api/products/route.ts
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category_id: z.string().uuid(),
  inventory: z.number().int().min(0).default(0)
});

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validatedData = productSchema.parse(body);
    
    // 2. Create in database
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
    
    // 3. Return created resource with 201 status
    return NextResponse.json({ product }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
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

### Frontend Usage

```javascript
const newProduct = {
  name: "Tonkotsu Ramen",
  price: 12.99,
  category_id: "abc-123",
  inventory: 50
};

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newProduct)
});

const { product } = await response.json();
console.log('Created:', product);
```

### Array Analogy

```javascript
// Like pushing to an array
const products = [];

// POST /api/products
products.push({ id: 1, name: 'New Ramen', price: 12.99 });
```

## PUT - Replace Entire Resource

**Purpose**: Replace an entire resource

**Characteristics**:
- Not safe (changes data)
- Idempotent (calling multiple times has same effect)
- Replaces ALL fields
- Data in request body

### Examples

```javascript
// Replace entire product
PUT /api/products/123
Body: {
  name: "Updated Ramen",
  price: 14.99,
  category_id: "abc-123",
  inventory: 30,
  description: "Delicious ramen"
}
// ALL fields must be provided
```

### Implementation

```typescript
// app/api/products/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);
    
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Frontend Usage

```javascript
const updatedProduct = {
  name: "Updated Tonkotsu Ramen",
  price: 14.99,
  category_id: "abc-123",
  inventory: 30,
  description: "Rich pork bone broth"
};

const response = await fetch('/api/products/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(updatedProduct)
});
```

## PATCH - Update Partial Resource

**Purpose**: Update only specific fields

**Characteristics**:
- Not safe (changes data)
- Idempotent (calling multiple times has same effect)
- Updates ONLY provided fields
- Data in request body

### Examples

```javascript
// Update only price
PATCH /api/products/123
Body: { price: 14.99 }

// Update multiple fields
PATCH /api/products/123
Body: { price: 14.99, inventory: 25 }
```

### Implementation

```typescript
// app/api/products/[id]/route.ts
const partialProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  price: z.number().positive().optional(),
  inventory: z.number().int().min(0).optional(),
  description: z.string().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = partialProductSchema.parse(body);
    
    // Only update provided fields
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Frontend Usage

```javascript
// Update only price
const response = await fetch('/api/products/123', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ price: 14.99 })
});
```

### Array Analogy

```javascript
// Like updating specific properties
const products = [
  { id: 1, name: 'Ramen A', price: 10, inventory: 50 }
];

// PUT - Replace entire object
products = products.map(p => 
  p.id === 1 
    ? { id: 1, name: 'New Name', price: 15, inventory: 30 } 
    : p
);

// PATCH - Update only some properties
products = products.map(p => 
  p.id === 1 
    ? { ...p, price: 15 } // Keep other fields
    : p
);
```

## DELETE - Remove Resource

**Purpose**: Delete a resource

**Characteristics**:
- Not safe (changes data)
- Idempotent (deleting twice has same effect as once)
- Usually no request body
- Often returns 204 No Content

### Examples

```javascript
// Delete product
DELETE /api/products/123

// Delete nested resource
DELETE /api/products/123/reviews/5
```

### Implementation

```typescript
// app/api/products/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check if exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', params.id)
      .single();
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Delete
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }
    
    // Return 204 No Content (or 200 with message)
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Frontend Usage

```javascript
const response = await fetch('/api/products/123', {
  method: 'DELETE'
});

if (response.ok) {
  console.log('Product deleted');
}
```

### Array Analogy

```javascript
// Like filtering out an item
const products = [
  { id: 1, name: 'Ramen A' },
  { id: 2, name: 'Ramen B' }
];

// DELETE /api/products/1
products = products.filter(p => p.id !== 1);
```

## Method Comparison

### Idempotency

**Idempotent** = Calling multiple times has same effect as calling once

```javascript
// GET - Idempotent
GET /api/products/123  // Returns same product
GET /api/products/123  // Returns same product
GET /api/products/123  // Returns same product

// POST - NOT Idempotent
POST /api/products { name: "Ramen" }  // Creates product 1
POST /api/products { name: "Ramen" }  // Creates product 2
POST /api/products { name: "Ramen" }  // Creates product 3

// PUT - Idempotent
PUT /api/products/123 { name: "Updated" }  // Updates product
PUT /api/products/123 { name: "Updated" }  // Same result
PUT /api/products/123 { name: "Updated" }  // Same result

// DELETE - Idempotent
DELETE /api/products/123  // Deletes product
DELETE /api/products/123  // Already deleted (same state)
DELETE /api/products/123  // Already deleted (same state)
```

### Safety

**Safe** = Doesn't modify data

```javascript
// Safe methods
GET /api/products      // ✅ Only reads data

// Unsafe methods
POST /api/products     // ❌ Creates data
PUT /api/products/123  // ❌ Modifies data
PATCH /api/products/123 // ❌ Modifies data
DELETE /api/products/123 // ❌ Removes data
```

## Best Practices

### 1. Use Correct Method
```javascript
// ✅ GOOD
GET /api/products           // Read
POST /api/products          // Create
PATCH /api/products/123     // Update
DELETE /api/products/123    // Delete

// ❌ BAD
GET /api/products/create    // Don't use GET to create
POST /api/products/123/delete // Don't use POST to delete
```

### 2. Return Appropriate Status
```javascript
// GET - 200 OK or 404 Not Found
// POST - 201 Created
// PUT/PATCH - 200 OK or 404 Not Found
// DELETE - 204 No Content or 200 OK
```

### 3. Validate Input
```javascript
// Always validate POST, PUT, PATCH data
const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive()
});

const validatedData = schema.parse(body);
```

### 4. Handle Errors
```javascript
try {
  // Operation
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}
```

## Quick Reference

```javascript
// GET - Read (Safe, Idempotent)
GET /api/products
GET /api/products/123

// POST - Create (Unsafe, Not Idempotent)
POST /api/products
Body: { name: "New", price: 10 }

// PUT - Replace (Unsafe, Idempotent)
PUT /api/products/123
Body: { name: "Updated", price: 15, ... } // All fields

// PATCH - Update (Unsafe, Idempotent)
PATCH /api/products/123
Body: { price: 15 } // Only changed fields

// DELETE - Remove (Unsafe, Idempotent)
DELETE /api/products/123
```

## Next Steps

Now that you understand HTTP methods, learn about:
- Status codes (how to communicate results)
- REST API design patterns
- Building complete CRUD APIs
- Error handling strategies

Continue to `status-codes.md`!
