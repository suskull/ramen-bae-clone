# Quick Start: Testing Backend

Write your first tests in 10 minutes!

## Setup (2 minutes)

### Install Vitest

```bash
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
```

### Configure Vitest

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**File**: `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### Add Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

## Step 1: Unit Tests (3 minutes)

### Test a Utility Function

**File**: `lib/utils.ts`

```typescript
export function calculateTotal(items: { price: number; quantity: number }[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**File**: `lib/utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal, formatPrice, isValidEmail } from './utils';

describe('calculateTotal', () => {
  it('should calculate total for single item', () => {
    const items = [{ price: 10, quantity: 2 }];
    expect(calculateTotal(items)).toBe(20);
  });

  it('should calculate total for multiple items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});

describe('formatPrice', () => {
  it('should format price with 2 decimals', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(10.99)).toBe('$10.99');
  });
});

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });
});
```

### Run Tests

```bash
npm test
```

## Step 2: API Route Tests (3 minutes)

### Test API Endpoint

**File**: `app/api/products/route.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        data: [
          { id: '1', name: 'Product 1', price: 10 },
          { id: '2', name: 'Product 2', price: 20 },
        ],
        error: null,
      }),
    }),
  }),
}));

describe('GET /api/products', () => {
  it('should return products', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toHaveLength(2);
    expect(data.products[0]).toHaveProperty('name');
  });
});
```

## Step 3: Integration Tests (2 minutes)

### Test Complete Flow

**File**: `tests/integration/cart.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for testing
);

describe('Cart Integration', () => {
  const testUserId = 'test-user-id';
  const testProductId = 'test-product-id';

  beforeEach(async () => {
    // Clean up test data
    await supabase.from('cart_items').delete().eq('user_id', testUserId);
  });

  it('should add item to cart', async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        quantity: 2,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
    expect(data.quantity).toBe(2);
  });

  it('should update cart item quantity', async () => {
    // Add item
    const { data: item } = await supabase
      .from('cart_items')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        quantity: 1,
      })
      .select()
      .single();

    // Update quantity
    const { data: updated } = await supabase
      .from('cart_items')
      .update({ quantity: 3 })
      .eq('id', item.id)
      .select()
      .single();

    expect(updated.quantity).toBe(3);
  });

  it('should remove item from cart', async () => {
    // Add item
    const { data: item } = await supabase
      .from('cart_items')
      .insert({
        user_id: testUserId,
        product_id: testProductId,
        quantity: 1,
      })
      .select()
      .single();

    // Remove item
    await supabase.from('cart_items').delete().eq('id', item.id);

    // Verify removed
    const { data: items } = await supabase
      .from('cart_items')
      .select('*')
      .eq('id', item.id);

    expect(items).toHaveLength(0);
  });
});
```

## Step 4: Component Tests (2 minutes)

### Test React Component

**File**: `components/product-card.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from './product-card';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 19.99,
    image_url: 'https://example.com/image.jpg',
  };

  it('should render product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render formatted price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockProduct.image_url);
  });
});
```

## Common Testing Patterns

### Mocking Supabase

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1', name: 'Test' },
            error: null,
          })),
        })),
      })),
    })),
  }),
}));
```

### Testing Async Functions

```typescript
it('should fetch data', async () => {
  const data = await fetchProducts();
  expect(data).toBeDefined();
  expect(data.length).toBeGreaterThan(0);
});
```

### Testing Error Cases

```typescript
it('should handle errors', async () => {
  // Mock error
  vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
      from: () => ({
        select: () => ({
          data: null,
          error: { message: 'Database error' },
        }),
      }),
    }),
  }));

  const { error } = await fetchProducts();
  expect(error).toBeDefined();
  expect(error.message).toBe('Database error');
});
```

### Testing with User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('should handle button click', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  const button = screen.getByText('Click me');
  fireEvent.click(button);

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Test Organization

```
tests/
├── unit/              # Unit tests
│   ├── utils.test.ts
│   └── helpers.test.ts
├── integration/       # Integration tests
│   ├── cart.test.ts
│   └── orders.test.ts
├── api/              # API tests
│   └── products.test.ts
└── components/       # Component tests
    └── product-card.test.tsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests once (CI)
npm run test:run

# Run specific test file
npm test -- utils.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Testing Checklist

- [ ] Unit tests for utility functions
- [ ] API route tests
- [ ] Database integration tests
- [ ] Component tests
- [ ] Error case tests
- [ ] Edge case tests
- [ ] Mock external dependencies
- [ ] Test coverage > 80%

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

Let's write reliable code! ✅
