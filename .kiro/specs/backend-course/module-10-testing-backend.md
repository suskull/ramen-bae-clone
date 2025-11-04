# Module 10: Testing Backend Code (Ensuring Reliability)

## Learning Objectives
- Understand different types of backend tests
- Write unit tests for business logic
- Test API endpoints
- Test database operations
- Implement integration tests

## 10.1 Testing Mindset

### Frontend vs Backend Testing

**Frontend Testing:**
```javascript
// Test UI components
test('button renders correctly', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

**Backend Testing:**
```javascript
// Test business logic and data
test('creates order correctly', async () => {
  const order = await createOrder({ items: [...] });
  expect(order.total).toBe(29.99);
  expect(order.status).toBe('confirmed');
});
```

**WHY**: Backend tests ensure data integrity and business logic correctness

## 10.2 Types of Tests

### Test Pyramid

```
        /\
       /  \  E2E Tests (Few)
      /____\
     /      \
    / Integr \  Integration Tests (Some)
   /__________\
  /            \
 /   Unit Tests \  Unit Tests (Many)
/________________\
```

**Unit Tests**: Test individual functions
**Integration Tests**: Test multiple components together
**E2E Tests**: Test entire user flows

## 10.3 Unit Testing

### Testing Business Logic

```typescript
// lib/pricing.ts
export function calculateDiscount(price: number, userTier: string): number {
  if (userTier === 'premium') {
    return price * 0.2; // 20% discount
  }
  if (userTier === 'standard' && price > 50) {
    return price * 0.1; // 10% discount
  }
  return 0;
}

export function calculateShipping(total: number, country: string): number {
  if (total >= 50) return 0; // Free shipping
  if (country === 'US') return 5.99;
  if (country === 'CA') return 7.99;
  return 12.99;
}
```

```typescript
// lib/pricing.test.ts
import { describe, test, expect } from 'vitest';
import { calculateDiscount, calculateShipping } from './pricing';

describe('calculateDiscount', () => {
  test('premium users get 20% discount', () => {
    expect(calculateDiscount(100, 'premium')).toBe(20);
  });
  
  test('standard users get 10% discount on orders over $50', () => {
    expect(calculateDiscount(60, 'standard')).toBe(6);
  });
  
  test('standard users get no discount on orders under $50', () => {
    expect(calculateDiscount(40, 'standard')).toBe(0);
  });
  
  test('free users get no discount', () => {
    expect(calculateDiscount(100, 'free')).toBe(0);
  });
});

describe('calculateShipping', () => {
  test('free shipping for orders over $50', () => {
    expect(calculateShipping(60, 'US')).toBe(0);
  });
  
  test('US shipping is $5.99', () => {
    expect(calculateShipping(30, 'US')).toBe(5.99);
  });
  
  test('Canada shipping is $7.99', () => {
    expect(calculateShipping(30, 'CA')).toBe(7.99);
  });
  
  test('international shipping is $12.99', () => {
    expect(calculateShipping(30, 'UK')).toBe(12.99);
  });
});
```

### Testing Validation

```typescript
// lib/validation.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(10000),
  inventory: z.number().int().min(0)
});

export function validateProduct(data: unknown) {
  return productSchema.safeParse(data);
}
```

```typescript
// lib/validation.test.ts
import { describe, test, expect } from 'vitest';
import { validateProduct } from './validation';

describe('validateProduct', () => {
  test('valid product passes validation', () => {
    const result = validateProduct({
      name: 'Ramen Mix',
      price: 15.99,
      inventory: 50
    });
    
    expect(result.success).toBe(true);
  });
  
  test('empty name fails validation', () => {
    const result = validateProduct({
      name: '',
      price: 15.99,
      inventory: 50
    });
    
    expect(result.success).toBe(false);
  });
  
  test('negative price fails validation', () => {
    const result = validateProduct({
      name: 'Ramen Mix',
      price: -10,
      inventory: 50
    });
    
    expect(result.success).toBe(false);
  });
  
  test('negative inventory fails validation', () => {
    const result = validateProduct({
      name: 'Ramen Mix',
      price: 15.99,
      inventory: -5
    });
    
    expect(result.success).toBe(false);
  });
});
```

## 10.4 Testing API Endpoints

### Setup Test Environment

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts']
  }
});
```

```typescript
// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test database
const supabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!
);

beforeAll(async () => {
  // Setup test database
  await supabase.from('products').delete().neq('id', '');
});

afterEach(async () => {
  // Clean up after each test
  await supabase.from('products').delete().neq('id', '');
});

afterAll(async () => {
  // Cleanup
});
```

### Testing GET Endpoints

```typescript
// app/api/products/route.test.ts
import { describe, test, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/products', () => {
  test('returns list of products', async () => {
    // Create test data
    await createTestProduct({ name: 'Test Product', price: 19.99 });
    
    // Make request
    const request = new Request('http://localhost:3000/api/products');
    const response = await GET(request);
    
    // Assert
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe('Test Product');
  });
  
  test('returns empty array when no products', async () => {
    const request = new Request('http://localhost:3000/api/products');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.products).toHaveLength(0);
  });
  
  test('filters by category', async () => {
    await createTestProduct({ name: 'Mix', categoryId: 'cat1' });
    await createTestProduct({ name: 'Topping', categoryId: 'cat2' });
    
    const request = new Request('http://localhost:3000/api/products?category=cat1');
    const response = await GET(request);
    
    const data = await response.json();
    expect(data.products).toHaveLength(1);
    expect(data.products[0].name).toBe('Mix');
  });
});
```

### Testing POST Endpoints

```typescript
// app/api/products/route.test.ts
describe('POST /api/products', () => {
  test('creates product with valid data', async () => {
    const productData = {
      name: 'New Product',
      price: 24.99,
      categoryId: 'cat1',
      inventory: 100
    };
    
    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data.product.name).toBe('New Product');
    expect(data.product.price).toBe(24.99);
  });
  
  test('returns 400 for invalid data', async () => {
    const invalidData = {
      name: '', // Empty name
      price: -10 // Negative price
    };
    
    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify(invalidData)
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
  
  test('requires authentication', async () => {
    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' })
      // No auth header
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(401);
  });
});
```

## 10.5 Testing Database Operations

### Mocking vs Real Database

```typescript
// Option 1: Mock database (fast, isolated)
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [{ id: 1, name: 'Test' }],
        error: null
      }))
    }))
  }
}));

// Option 2: Real test database (slower, more realistic)
// Use separate test database
const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL!,
  process.env.TEST_SUPABASE_KEY!
);
```

### Testing CRUD Operations

```typescript
// lib/products.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { createProduct, getProduct, updateProduct, deleteProduct } from './products';

describe('Product CRUD', () => {
  let productId: string;
  
  beforeEach(async () => {
    // Clean slate for each test
    await cleanupTestData();
  });
  
  test('createProduct creates a new product', async () => {
    const product = await createProduct({
      name: 'Test Product',
      price: 19.99,
      inventory: 50
    });
    
    expect(product.id).toBeDefined();
    expect(product.name).toBe('Test Product');
    
    productId = product.id;
  });
  
  test('getProduct retrieves existing product', async () => {
    const created = await createProduct({ name: 'Test', price: 10 });
    const retrieved = await getProduct(created.id);
    
    expect(retrieved).toEqual(created);
  });
  
  test('updateProduct modifies existing product', async () => {
    const created = await createProduct({ name: 'Original', price: 10 });
    const updated = await updateProduct(created.id, { name: 'Updated' });
    
    expect(updated.name).toBe('Updated');
    expect(updated.price).toBe(10); // Unchanged
  });
  
  test('deleteProduct removes product', async () => {
    const created = await createProduct({ name: 'Test', price: 10 });
    await deleteProduct(created.id);
    
    const retrieved = await getProduct(created.id);
    expect(retrieved).toBeNull();
  });
});
```

## 10.6 Integration Tests

### Testing Complete Flows

```typescript
// tests/integration/checkout.test.ts
import { describe, test, expect } from 'vitest';

describe('Checkout Flow', () => {
  test('complete order process', async () => {
    // 1. Create user
    const user = await createTestUser();
    
    // 2. Add products to cart
    await addToCart(user.id, { productId: 'prod1', quantity: 2 });
    await addToCart(user.id, { productId: 'prod2', quantity: 1 });
    
    // 3. Get cart
    const cart = await getCart(user.id);
    expect(cart.items).toHaveLength(2);
    
    // 4. Process order
    const order = await processOrder(user.id, {
      paymentMethod: 'test_card',
      shippingAddress: testAddress
    });
    
    expect(order.status).toBe('confirmed');
    expect(order.total).toBeGreaterThan(0);
    
    // 5. Verify cart is empty
    const emptyCart = await getCart(user.id);
    expect(emptyCart.items).toHaveLength(0);
    
    // 6. Verify inventory updated
    const product = await getProduct('prod1');
    expect(product.inventory).toBeLessThan(initialInventory);
  });
});
```

## 10.7 Testing Edge Functions

```typescript
// supabase/functions/process-order/test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('process-order validates cart items', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/process-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      cartItems: [],
      shippingAddress: {},
      paymentMethodId: 'pm_test'
    })
  });
  
  const data = await response.json();
  assertEquals(response.status, 400);
  assertEquals(data.error, 'Cart is empty');
});

Deno.test('process-order creates order successfully', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/process-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      cartItems: [{ productId: 'test-prod', quantity: 1 }],
      shippingAddress: testAddress,
      paymentMethodId: 'pm_test'
    })
  });
  
  const data = await response.json();
  assertEquals(response.status, 200);
  assertEquals(data.success, true);
});
```

## 10.8 Test Helpers and Utilities

```typescript
// tests/helpers.ts
export async function createTestUser(overrides = {}) {
  const { data: { user } } = await supabase.auth.signUp({
    email: `test-${Date.now()}@example.com`,
    password: 'test-password',
    ...overrides
  });
  return user;
}

export async function createTestProduct(overrides = {}) {
  const { data } = await supabase
    .from('products')
    .insert({
      name: 'Test Product',
      price: 19.99,
      inventory: 100,
      ...overrides
    })
    .select()
    .single();
  return data;
}

export async function cleanupTestData() {
  await supabase.from('cart_items').delete().neq('id', '');
  await supabase.from('orders').delete().neq('id', '');
  await supabase.from('products').delete().neq('id', '');
}

export function mockStripe() {
  return {
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test',
        status: 'succeeded'
      })
    }
  };
}
```

## 10.9 Testing Best Practices

### 1. Test Isolation

```typescript
// ❌ BAD: Tests depend on each other
test('create product', async () => {
  product = await createProduct({ name: 'Test' });
});

test('update product', async () => {
  await updateProduct(product.id, { name: 'Updated' }); // Depends on previous test
});

// ✅ GOOD: Each test is independent
test('create product', async () => {
  const product = await createProduct({ name: 'Test' });
  expect(product.name).toBe('Test');
});

test('update product', async () => {
  const product = await createProduct({ name: 'Test' });
  const updated = await updateProduct(product.id, { name: 'Updated' });
  expect(updated.name).toBe('Updated');
});
```

### 2. Descriptive Test Names

```typescript
// ❌ BAD: Vague names
test('it works', () => {});
test('test 1', () => {});

// ✅ GOOD: Descriptive names
test('creates product with valid data', () => {});
test('returns 400 when price is negative', () => {});
test('requires authentication for POST requests', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
test('calculates order total correctly', async () => {
  // Arrange: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 }
  ];
  
  // Act: Execute the function
  const total = calculateTotal(items);
  
  // Assert: Verify the result
  expect(total).toBe(35);
});
```

## 10.10 Coverage and CI/CD

### Test Coverage

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

```bash
# Run tests with coverage
npm run test:coverage

# Output:
# File            | % Stmts | % Branch | % Funcs | % Lines
# ----------------|---------|----------|---------|--------
# All files       |   85.2  |   78.4   |   90.1  |   84.8
# lib/pricing.ts  |   100   |   100    |   100   |   100
# lib/products.ts |   75.5  |   66.7   |   80.0  |   74.2
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          TEST_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          TEST_SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 10.11 Key Takeaways

- **Unit tests** test individual functions in isolation
- **Integration tests** test multiple components together
- **Test isolation** ensures tests don't affect each other
- **Descriptive names** make tests self-documenting
- **AAA pattern** (Arrange-Act-Assert) structures tests clearly
- **Test coverage** measures how much code is tested
- **CI/CD** runs tests automatically on every commit

## Next Module Preview

In Module 11, we'll learn about Deployment Strategies - how to get your application from development to production!
