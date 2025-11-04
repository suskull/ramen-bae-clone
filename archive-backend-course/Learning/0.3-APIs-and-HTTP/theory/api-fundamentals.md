# API Fundamentals: Functions Over the Internet

## What is an API?

**API = Application Programming Interface**

Think of it as a way for programs to talk to each other, just like functions in your code.

### Frontend Function vs API Call

**Same Computer (Frontend Function):**
```javascript
// Function definition
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Function call - instant response
const total = calculateTotal(cartItems);
console.log(total); // 49.99
```

**Different Computer (API Call):**
```javascript
// API call - function runs on server
const response = await fetch('/api/cart/total', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ items: cartItems })
});

const { total } = await response.json();
console.log(total); // 49.99 (but took longer)
```

### Key Differences

| Aspect | Frontend Function | API Call |
|--------|------------------|----------|
| **Location** | Same computer | Different computer |
| **Speed** | Instant (microseconds) | Slower (milliseconds to seconds) |
| **Reliability** | Always works | Can fail (network issues) |
| **Security** | Code is visible | Server code is hidden |
| **Data Access** | Limited to browser | Access to database |

## Why Do We Need APIs?

### 1. Security
```javascript
// ❌ BAD: Database credentials in frontend
const products = await database.query('SELECT * FROM products');
// Anyone can see your database password in the browser!

// ✅ GOOD: API hides database access
const response = await fetch('/api/products');
const { products } = await response.json();
// Database credentials stay on server
```

### 2. Data Access
```javascript
// Frontend can't directly access database
// API provides controlled access

// Frontend requests data
fetch('/api/products')

// Server (API) handles database
const { data } = await supabase.from('products').select('*');
```

### 3. Business Logic
```javascript
// Complex calculations on server
// POST /api/orders/calculate-shipping
{
  items: [...],
  destination: "New York",
  weight: 5.2
}

// Server calculates shipping cost considering:
// - Distance
// - Weight
// - Carrier rates
// - Promotions
// - Tax rules

// Returns simple result
{
  shippingCost: 12.99,
  estimatedDays: 3
}
```

### 4. Multiple Clients
```
                    ┌─────────────┐
                    │   Database  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │   API       │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴────┐      ┌──────┴──────┐    ┌─────┴─────┐
   │ Web App │      │ Mobile App  │    │ Desktop   │
   └─────────┘      └─────────────┘    └───────────┘
```

Same API serves web, mobile, and desktop apps!

## How APIs Work: The Request-Response Cycle

```
1. Client makes request
   ↓
2. Request travels over internet
   ↓
3. Server receives request
   ↓
4. Server processes (database, calculations, etc.)
   ↓
5. Server sends response
   ↓
6. Response travels over internet
   ↓
7. Client receives response
```

### Example Flow

```javascript
// 1. Frontend makes request
const response = await fetch('/api/products/123');

// 2-3. Server receives and processes
export async function GET(request, { params }) {
  // 4. Query database
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();
  
  // 5. Send response
  return NextResponse.json({ product: data });
}

// 6-7. Frontend receives response
const { product } = await response.json();
console.log(product.name);
```

## API Analogy: Restaurant

Think of an API like a restaurant:

| Restaurant | API |
|------------|-----|
| **Menu** | API documentation (what you can order) |
| **Waiter** | API endpoint (takes your order) |
| **Kitchen** | Server/Database (prepares your order) |
| **Your order** | Request (what you want) |
| **Your food** | Response (what you get back) |

```javascript
// You (customer) order from menu
fetch('/api/products') // "I'll have the products, please"

// Waiter takes order to kitchen
// Kitchen prepares food (queries database)
// Waiter brings food back

// You receive your order
const { products } = await response.json();
```

## Types of APIs

### 1. REST API (What we're learning)
- Uses HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- Stateless (each request is independent)

```javascript
GET    /api/products      // Get all products
POST   /api/products      // Create product
GET    /api/products/123  // Get specific product
PUT    /api/products/123  // Update product
DELETE /api/products/123  // Delete product
```

### 2. GraphQL (Alternative)
- Single endpoint
- Client specifies exactly what data it needs

```javascript
// One request, get exactly what you need
query {
  product(id: 123) {
    name
    price
    reviews {
      rating
      body
    }
  }
}
```

### 3. WebSocket (Real-time)
- Persistent connection
- Server can push data to client

```javascript
// Chat application
const socket = new WebSocket('ws://api.example.com/chat');
socket.onmessage = (event) => {
  console.log('New message:', event.data);
};
```

## REST API Principles

### 1. Resource-Based
Everything is a "resource" (noun, not verb)

```javascript
// ✅ GOOD: Resource-based
GET /api/products
GET /api/users
GET /api/orders

// ❌ BAD: Action-based
GET /api/getProducts
GET /api/fetchUsers
GET /api/retrieveOrders
```

### 2. HTTP Methods for Actions
Use HTTP methods to indicate action

```javascript
// ✅ GOOD: Method indicates action
GET    /api/products  // Read
POST   /api/products  // Create
PUT    /api/products/123  // Update
DELETE /api/products/123  // Delete

// ❌ BAD: Action in URL
GET /api/products/create
GET /api/products/update/123
GET /api/products/delete/123
```

### 3. Stateless
Each request contains all information needed

```javascript
// ✅ GOOD: Request includes auth token
fetch('/api/products', {
  headers: {
    'Authorization': 'Bearer token123'
  }
});

// ❌ BAD: Relying on server to remember
// "Remember me from last request?"
fetch('/api/products');
```

### 4. Predictable Structure
Follow consistent patterns

```javascript
// Collections (plural)
/api/products
/api/categories
/api/users

// Individual items
/api/products/123
/api/categories/5
/api/users/abc

// Nested resources
/api/products/123/reviews
/api/users/abc/orders
```

## API Response Format

### Successful Response
```json
{
  "product": {
    "id": "123",
    "name": "Tonkotsu Ramen",
    "price": 12.99,
    "inventory": 50
  }
}
```

### Error Response
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "productId": "123"
  }
}
```

### List Response
```json
{
  "products": [
    { "id": "1", "name": "Product 1" },
    { "id": "2", "name": "Product 2" }
  ],
  "count": 2,
  "page": 1,
  "totalPages": 5
}
```

## Frontend Integration

### Using fetch
```javascript
// GET request
async function getProducts() {
  try {
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const { products } = await response.json();
    return products;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// POST request
async function createProduct(productData) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    const { product } = await response.json();
    return product;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

### Using in React Component
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const { products } = await response.json();
        setProducts(products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

## Key Takeaways

1. **APIs are like functions** that run on a different computer
2. **They provide security** by hiding database credentials
3. **They enable data access** from multiple clients
4. **REST uses HTTP methods** for different operations
5. **URLs represent resources**, not actions
6. **Each request is independent** (stateless)
7. **Responses are typically JSON** format
8. **Error handling is crucial** for good UX

## Next Steps

Now that you understand what APIs are, let's learn about:
- HTTP methods in detail
- Status codes
- Building your first API endpoint
- Error handling
- Validation

Continue to `http-methods.md` to dive deeper!
