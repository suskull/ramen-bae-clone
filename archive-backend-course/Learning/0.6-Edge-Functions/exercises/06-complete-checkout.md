# Exercise 06: Complete Checkout Flow

Build a production-ready checkout function that coordinates payment, database, and email operations.

## Learning Objectives

- Combine multiple operations in one function
- Implement transaction-like behavior
- Handle complex error scenarios
- Coordinate multiple services
- Implement rollback logic
- Build production-ready functions
- Handle race conditions

## Prerequisites

- Completed Exercises 01-05
- Understanding of transactions
- Knowledge of error handling
- Familiarity with all previous concepts

## Estimated Time

45 minutes

## Part 1: Database Setup (5 minutes)

### Task 1.1: Create Orders Table

```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  payment_id TEXT,
  payment_status TEXT,
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies
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

## Part 2: Create Checkout Function (20 minutes)

### Task 2.1: Create Function

```bash
supabase functions new process-checkout
```

### Task 2.2: Write Complete Checkout Logic

**File**: `supabase/functions/process-checkout/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  items: Array<{ productId: string; quantity: number }>;
  paymentMethodId: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let orderId: string | null = null;
  let paymentIntentId: string | null = null;

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const checkoutData: CheckoutRequest = await req.json();
    const { items, paymentMethodId, shippingAddress } = checkoutData;

    // Validate input
    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    if (!paymentMethodId || !shippingAddress) {
      throw new Error('Missing required fields');
    }

    console.log('Step 1: Validating cart items...');

    // Fetch product details and validate inventory
    const productIds = items.map(item => item.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, inventory')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    // Validate inventory
    for (const item of items) {
      const product = products?.find(p => p.id === item.productId);
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }
    }

    // Calculate total
    const total = items.reduce((sum, item) => {
      const product = products?.find(p => p.id === item.productId);
      return sum + (product!.price * item.quantity);
    }, 0);

    console.log('Step 2: Creating order...');

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
        shipping_address: shippingAddress,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    orderId = order.id;

    // Create order items
    const orderItems = items.map(item => {
      const product = products?.find(p => p.id === item.productId);
      return {
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: product!.price,
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('Step 3: Processing payment...');

    // Process payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        orderId: orderId!,
        userId: user.id,
      },
    });

    paymentIntentId = paymentIntent.id;

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment failed');
    }

    console.log('Step 4: Updating inventory...');

    // Update inventory
    for (const item of items) {
      const { error: inventoryError } = await supabase.rpc('decrement_inventory', {
        product_id: item.productId,
        quantity: item.quantity,
      });

      if (inventoryError) {
        console.error('Inventory update failed:', inventoryError);
        // Continue anyway - we'll handle this in reconciliation
      }
    }

    console.log('Step 5: Updating order status...');

    // Update order with payment info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_id: paymentIntentId,
        payment_status: 'paid',
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Order update failed:', updateError);
    }

    console.log('Step 6: Sending confirmation email...');

    // Send confirmation email
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject: `Order Confirmation #${orderId}`,
          template: 'order-confirmation',
          templateData: {
            name: shippingAddress.name,
            orderId,
            total,
            items: orderItems,
          },
        },
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order if email fails
    }

    console.log('Checkout completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        paymentIntentId,
        total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout failed:', error);

    // Rollback: Cancel order if created
    if (orderId) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    // Rollback: Refund payment if processed
    if (paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        });
      } catch (refundError) {
        console.error('Refund failed:', refundError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

### Task 2.3: Create Inventory Function

```sql
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET inventory = inventory - quantity
  WHERE id = product_id
  AND inventory >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Task 2.4: Deploy Function

```bash
supabase functions deploy process-checkout
```

## Part 3: Frontend Integration (10 minutes)

### Task 3.1: Create Checkout Component

**File**: `components/checkout-form.tsx`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function CheckoutForm({ cartItems }: { cartItems: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: checkoutError } = await supabase.functions.invoke(
        'process-checkout',
        {
          body: {
            items: cartItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
            })),
            paymentMethodId: 'pm_card_visa', // Use real payment method
            shippingAddress,
          },
        }
      );

      if (checkoutError) throw checkoutError;

      setSuccess(true);
      console.log('Order created:', data.orderId);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Order Confirmed!
        </h2>
        <p>Check your email for confirmation details.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-4">
      <h2 className="text-2xl font-bold">Shipping Address</h2>
      
      {/* Address fields */}
      <input
        type="text"
        placeholder="Full Name"
        value={shippingAddress.name}
        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      
      {/* More fields... */}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Complete Purchase'}
      </button>
    </form>
  );
}
```

## Part 4: Testing (5 minutes)

### Task 4.1: Test Complete Flow

1. Add items to cart
2. Fill shipping address
3. Submit checkout
4. Verify order created
5. Check payment processed
6. Confirm inventory updated
7. Verify email sent

### Task 4.2: Test Error Scenarios

- Insufficient inventory
- Payment failure
- Invalid address
- Network errors

## Part 5: Monitoring (5 minutes)

### Task 5.1: Add Monitoring

```typescript
// Log each step
console.log('Step X: Description...');

// Track timing
const startTime = Date.now();
// ... operation ...
console.log(`Step completed in ${Date.now() - startTime}ms`);

// Log errors with context
console.error('Error in step X:', error, { orderId, userId });
```

## Challenges

### Challenge 1: Idempotency
Add idempotency key support to prevent duplicate orders.

### Challenge 2: Partial Fulfillment
Handle cases where only some items are available.

### Challenge 3: Discount Codes
Add support for applying discount codes.

### Challenge 4: Multiple Payment Methods
Support multiple payment methods (card, PayPal, etc.).

### Challenge 5: Order Tracking
Add order tracking and status updates.

## Key Takeaways

- Coordinate multiple services in one function
- Implement proper error handling and rollback
- Validate all inputs thoroughly
- Update database atomically when possible
- Log each step for debugging
- Handle partial failures gracefully
- Test all error scenarios
- Monitor function performance

Congratulations! You've completed all Edge Functions exercises! 🎉
