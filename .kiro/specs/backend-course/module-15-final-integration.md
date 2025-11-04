# Module 15: Final Project Integration (Bringing It All Together)

## Learning Objectives
- Apply all backend concepts in a real feature
- Build a complete order processing system
- Implement best practices throughout
- Deploy to production
- Monitor and optimize

## 15.1 Project Overview

### Building a Complete Order System

We'll build a production-ready order processing system that includes:
- Shopping cart management
- Order creation with transactions
- Payment processing (Stripe)
- Inventory management
- Email notifications
- Real-time updates
- Caching and optimization
- Monitoring and logging

**This brings together:**
- ✅ Database design (Module 2)
- ✅ API endpoints (Module 3)
- ✅ Authentication (Module 4)
- ✅ Supabase features (Module 5)
- ✅ Edge Functions (Module 6)
- ✅ Security (Module 8)
- ✅ Performance (Module 9)
- ✅ Testing (Module 10)
- ✅ Deployment (Module 11)
- ✅ Monitoring (Module 12)
- ✅ Advanced DB (Module 13)
- ✅ Caching (Module 14)

## 15.2 Database Schema

### Complete Schema Design

```sql
-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  inventory INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  images JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- RLS Policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
ON cart_items FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
```

## 15.3 Cart Management API

### Add to Cart

```typescript
// app/api/cart/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(10)
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Authentication
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Validation
    const body = await request.json();
    const { productId, quantity } = addToCartSchema.parse(body);
    
    // Check product exists and has inventory
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, inventory')
      .eq('id', productId)
      .single();
    
    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.inventory < quantity) {
      return NextResponse.json(
        { error: 'Insufficient inventory' },
        { status: 400 }
      );
    }
    
    // Add to cart (upsert to handle duplicates)
    const { data: cartItem, error: cartError } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        quantity
      }, {
        onConflict: 'user_id,product_id'
      })
      .select()
      .single();
    
    if (cartError) throw cartError;
    
    // Log success
    const duration = Date.now() - startTime;
    logger.info({
      event: 'cart_item_added',
      userId: user.id,
      productId,
      quantity,
      duration
    });
    
    return NextResponse.json({ cartItem }, { status: 201 });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error({
      error: error.message,
      endpoint: '/api/cart',
      duration
    });
    
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// Get cart
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ items: [] });
    }
    
    // Get cart with product details
    const { data: items } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          inventory,
          images
        )
      `)
      .eq('user_id', user.id);
    
    // Calculate totals
    const subtotal = items?.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0) || 0;
    
    return NextResponse.json({
      items,
      subtotal,
      itemCount: items?.length || 0
    });
    
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}
```

## 15.4 Order Processing Edge Function

### Complete Order Flow

```typescript
// supabase/functions/process-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

interface OrderRequest {
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  paymentMethodId: string;
}

serve(async (req) => {
  try {
    // 1. Authentication
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // 2. Parse request
    const { shippingAddress, paymentMethodId }: OrderRequest = await req.json();
    
    // 3. Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, inventory)
      `)
      .eq('user_id', user.id);
    
    if (cartError || !cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400 }
      );
    }
    
    // 4. Validate inventory and calculate totals
    let subtotal = 0;
    const validatedItems = [];
    
    for (const item of cartItems) {
      if (item.product.inventory < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Insufficient inventory for ${item.product.name}`
          }),
          { status: 400 }
        );
      }
      
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      
      validatedItems.push({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        total: itemTotal
      });
    }
    
    // 5. Calculate shipping and tax
    const shippingCost = subtotal >= 50 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;
    
    // 6. Process payment with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        userId: user.id,
        itemCount: validatedItems.length.toString()
      }
    });
    
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Payment failed' }),
        { status: 400 }
      );
    }
    
    // 7. Create order using database transaction
    const { data: orderData, error: orderError } = await supabase
      .rpc('create_order_transaction', {
        p_user_id: user.id,
        p_subtotal: subtotal,
        p_shipping_cost: shippingCost,
        p_tax: tax,
        p_total: total,
        p_shipping_address: shippingAddress,
        p_payment_intent_id: paymentIntent.id,
        p_items: validatedItems
      });
    
    if (orderError) {
      // Refund payment if order creation fails
      await stripe.refunds.create({
        payment_intent: paymentIntent.id
      });
      
      throw orderError;
    }
    
    // 8. Send confirmation email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@ramenbae.com',
        to: user.email,
        subject: `Order Confirmation #${orderData.order_id}`,
        html: generateOrderEmail(orderData, validatedItems, shippingAddress)
      })
    });
    
    // 9. Return success
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: orderData.order_id,
          total,
          items: validatedItems
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Order processing error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process order',
        message: error.message
      }),
      { status: 500 }
    );
  }
});

function generateOrderEmail(order: any, items: any[], address: any): string {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${item.total.toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
    <h1>Thank you for your order!</h1>
    <p>Order #${order.order_id}</p>
    
    <h2>Items</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <h2>Shipping Address</h2>
    <p>
      ${address.name}<br>
      ${address.line1}<br>
      ${address.city}, ${address.state} ${address.postal_code}<br>
      ${address.country}
    </p>
    
    <h2>Order Summary</h2>
    <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
    <p>Shipping: $${order.shipping_cost.toFixed(2)}</p>
    <p>Tax: $${order.tax.toFixed(2)}</p>
    <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
  `;
}
```

### Database Transaction Function

```sql
-- Create order with transaction
CREATE OR REPLACE FUNCTION create_order_transaction(
  p_user_id UUID,
  p_subtotal DECIMAL,
  p_shipping_cost DECIMAL,
  p_tax DECIMAL,
  p_total DECIMAL,
  p_shipping_address JSONB,
  p_payment_intent_id TEXT,
  p_items JSONB
) RETURNS JSON AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Create order
  INSERT INTO orders (
    user_id,
    status,
    subtotal,
    shipping_cost,
    tax,
    total,
    shipping_address,
    payment_intent_id
  ) VALUES (
    p_user_id,
    'confirmed',
    p_subtotal,
    p_shipping_cost,
    p_tax,
    p_total,
    p_shipping_address,
    p_payment_intent_id
  ) RETURNING id INTO v_order_id;
  
  -- Create order items and update inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Create order item
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'productId')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::DECIMAL
    );
    
    -- Update inventory
    UPDATE products
    SET inventory = inventory - (v_item->>'quantity')::INTEGER
    WHERE id = (v_item->>'productId')::UUID;
  END LOOP;
  
  -- Clear cart
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  -- Return order info
  RETURN json_build_object(
    'order_id', v_order_id,
    'subtotal', p_subtotal,
    'shipping_cost', p_shipping_cost,
    'tax', p_tax,
    'total', p_total
  );
END;
$$ LANGUAGE plpgsql;
```

## 15.5 Frontend Integration

### Checkout Component

```typescript
// components/checkout-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: 'Customer Name',
            email: 'customer@example.com'
          }
        }
      });
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      // Process order
      const { data, error: orderError } = await supabase.functions.invoke('process-order', {
        body: {
          shippingAddress: {
            name: 'John Doe',
            line1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postal_code: '94102',
            country: 'US'
          },
          paymentMethodId: paymentMethod.id
        }
      });
      
      if (orderError) throw orderError;
      
      // Redirect to confirmation
      router.push(`/order-confirmation/${data.order.id}`);
      
    } catch (err: any) {
      setError(err.message || 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {error && (
        <div className="error">{error}</div>
      )}
      
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
```

## 15.6 Testing

### Integration Tests

```typescript
// tests/integration/order-flow.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { createTestUser, createTestProduct, cleanupTestData } from '../helpers';

describe('Order Flow', () => {
  beforeEach(async () => {
    await cleanupTestData();
  });
  
  test('complete order process', async () => {
    // 1. Create test user and products
    const user = await createTestUser();
    const product1 = await createTestProduct({ price: 15.99, inventory: 100 });
    const product2 = await createTestProduct({ price: 24.99, inventory: 50 });
    
    // 2. Add to cart
    await addToCart(user.id, product1.id, 2);
    await addToCart(user.id, product2.id, 1);
    
    // 3. Get cart
    const cart = await getCart(user.id);
    expect(cart.items).toHaveLength(2);
    expect(cart.subtotal).toBe(56.97); // (15.99 * 2) + 24.99
    
    // 4. Process order
    const order = await processOrder(user.id, {
      shippingAddress: testAddress,
      paymentMethodId: 'pm_test_card'
    });
    
    expect(order.status).toBe('confirmed');
    expect(order.total).toBeGreaterThan(56.97); // Includes shipping and tax
    
    // 5. Verify cart is empty
    const emptyCart = await getCart(user.id);
    expect(emptyCart.items).toHaveLength(0);
    
    // 6. Verify inventory updated
    const updatedProduct1 = await getProduct(product1.id);
    expect(updatedProduct1.inventory).toBe(98); // 100 - 2
    
    // 7. Verify order items created
    const orderItems = await getOrderItems(order.id);
    expect(orderItems).toHaveLength(2);
  });
});
```

## 15.7 Deployment

### Production Checklist

```bash
# 1. Run tests
npm test

# 2. Build application
npm run build

# 3. Run database migrations
npm run migrate

# 4. Deploy to Vercel
vercel --prod

# 5. Deploy Edge Functions
supabase functions deploy process-order

# 6. Warm cache
curl https://your-app.vercel.app/api/warm-cache

# 7. Verify health check
curl https://your-app.vercel.app/api/health

# 8. Monitor logs
vercel logs --follow
```

## 15.8 Monitoring Dashboard

### Key Metrics to Track

```typescript
// Dashboard showing:
// - Orders per hour
// - Revenue per day
// - Average order value
// - Cart abandonment rate
// - API response times
// - Error rates
// - Cache hit rates
// - Database query times
```

## 15.9 Key Takeaways

You've now built a complete, production-ready order processing system that includes:

✅ **Database**: Proper schema with relationships and constraints
✅ **APIs**: RESTful endpoints with validation
✅ **Authentication**: Secure user authentication
✅ **Transactions**: Atomic operations for data consistency
✅ **Payments**: Stripe integration
✅ **Security**: Input validation, RLS policies, error handling
✅ **Performance**: Caching, query optimization
✅ **Testing**: Unit and integration tests
✅ **Deployment**: CI/CD pipeline
✅ **Monitoring**: Logging, error tracking, metrics

## 15.10 Next Steps

### Continue Learning

1. **Add more features**:
   - Order tracking
   - Refunds and returns
   - Subscription products
   - Loyalty program

2. **Optimize further**:
   - Implement GraphQL
   - Add more caching layers
   - Optimize database queries
   - Implement rate limiting

3. **Scale up**:
   - Handle high traffic
   - Implement queue systems
   - Add load balancing
   - Database replication

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Congratulations! 🎉

You've completed the Backend Fundamentals Course! You now have the knowledge and skills to build production-ready backend systems. Keep practicing, keep building, and keep learning!
