# Module 6: Edge Functions & Custom Backend Logic

## Learning Objectives
- Understand when to use Edge Functions vs direct database access
- Learn serverless function concepts
- Implement custom business logic
- Handle external API integrations
- Process payments securely
- Relate Edge Functions to frontend concepts

## 6.1 What are Edge Functions?

### Direct Database Access vs Edge Functions

**Direct Database Access (What we've been doing):**
```typescript
// Frontend directly queries database
const { data: products } = await supabase
  .from('products')
  .select('*');

// ✅ Good for: Simple CRUD operations
// ❌ Bad for: Complex logic, external APIs, sensitive operations
```

**Edge Functions (Custom backend code):**
```typescript
// Frontend calls your custom function
const { data, error } = await supabase.functions.invoke('process-order', {
  body: { cartItems, paymentMethod }
});

// ✅ Good for: Complex logic, external APIs, sensitive operations
// ❌ Bad for: Simple queries (overkill)
```

**Frontend analogy**: 
- Direct database = Using built-in array methods (`.map()`, `.filter()`)
- Edge Functions = Writing custom functions for complex logic

### When to Use Edge Functions

**Use Edge Functions when you need to:**
1. **Process payments** (Stripe, PayPal)
2. **Send emails** (SendGrid, Resend)
3. **Call external APIs** (shipping rates, tax calculation)
4. **Complex calculations** (recommendation algorithms)
5. **Scheduled tasks** (daily reports, cleanup)
6. **Hide API keys** (can't expose in frontend)
7. **Multi-step transactions** (order processing)

**Use Direct Database Access when:**
1. Simple CRUD operations
2. Reading public data
3. User-specific data (protected by RLS)
4. Real-time subscriptions

## 6.2 Edge Functions Basics

### Anatomy of an Edge Function

```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // 1. Parse request
  const { name } = await req.json();
  
  // 2. Your logic here
  const greeting = `Hello, ${name}!`;
  
  // 3. Return response
  return new Response(
    JSON.stringify({ message: greeting }),
    { 
      headers: { 'Content-Type': 'application/json' },
      status: 200
    }
  );
});
```

**Frontend analogy**: Like an API route in Next.js, but runs on Supabase's infrastructure

### Calling Edge Functions from Frontend

```typescript
// Frontend
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Alice' }
});

console.log(data); // { message: 'Hello, Alice!' }
```

## 6.3 Real-World Example: Order Processing

### The Problem

When a user places an order, you need to:
1. Validate cart items and prices (prevent tampering)
2. Check inventory availability
3. Calculate shipping costs
4. Process payment with Stripe
5. Create order record
6. Update inventory
7. Send confirmation email

**Why Edge Function?** Too complex for direct database access, involves external APIs, needs to be atomic (all or nothing)

### Implementation

```typescript
// supabase/functions/process-order/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    // 1. Get authenticated user
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
    const { cartItems, shippingAddress, paymentMethodId } = await req.json();
    
    // 3. Validate cart items and calculate total
    let total = 0;
    const validatedItems = [];
    
    for (const item of cartItems) {
      // Fetch current price from database (don't trust frontend!)
      const { data: product } = await supabase
        .from('products')
        .select('id, name, price, inventory')
        .eq('id', item.productId)
        .single();
      
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      if (product.inventory < item.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }
      
      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      });
      
      total += product.price * item.quantity;
    }
    
    // 4. Calculate shipping (example: flat rate)
    const shippingCost = total >= 50 ? 0 : 5.99;
    const finalTotal = total + shippingCost;
    
    // 5. Process payment with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        userId: user.id,
        itemCount: validatedItems.length
      }
    });
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment failed');
    }
    
    // 6. Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: finalTotal,
        shipping_cost: shippingCost,
        shipping_address: shippingAddress,
        payment_intent_id: paymentIntent.id,
        status: 'confirmed'
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // 7. Create order items
    const orderItems = validatedItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    
    await supabase.from('order_items').insert(orderItems);
    
    // 8. Update inventory
    for (const item of validatedItems) {
      await supabase.rpc('decrement_inventory', {
        product_id: item.productId,
        quantity: item.quantity
      });
    }
    
    // 9. Clear user's cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);
    
    // 10. Send confirmation email (simplified)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@ramenbae.com',
        to: user.email,
        subject: 'Order Confirmation',
        html: `<h1>Thank you for your order!</h1><p>Order #${order.id}</p>`
      })
    });
    
    // 11. Return success
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          total: finalTotal,
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
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

**Frontend usage:**
```typescript
// components/checkout-form.tsx
const handleCheckout = async () => {
  setLoading(true);
  
  const { data, error } = await supabase.functions.invoke('process-order', {
    body: {
      cartItems,
      shippingAddress,
      paymentMethodId
    }
  });
  
  if (error) {
    alert('Order failed: ' + error.message);
  } else {
    router.push(`/order-confirmation/${data.order.id}`);
  }
  
  setLoading(false);
};
```

**Frontend analogy**: Like a complex reducer function in Redux that handles multiple state updates atomically

## 6.4 Environment Variables and Secrets

### Setting Up Secrets

```bash
# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set OPENAI_API_KEY=sk-...

# List secrets
supabase secrets list
```

### Accessing Secrets

```typescript
// In Edge Function
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
const openaiKey = Deno.env.get('OPENAI_API_KEY');

// Never expose these in frontend!
```

**Frontend analogy**: Like environment variables in `.env.local`, but more secure (never exposed to client)

## 6.5 External API Integration

### Example: Shipping Rate Calculator

```typescript
// supabase/functions/calculate-shipping/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { items, destination } = await req.json();
    
    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => {
      return sum + (item.weight * item.quantity);
    }, 0);
    
    // Call shipping API (example: ShipEngine)
    const response = await fetch('https://api.shipengine.com/v1/rates', {
      method: 'POST',
      headers: {
        'API-Key': Deno.env.get('SHIPENGINE_API_KEY')!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shipment: {
          ship_to: destination,
          ship_from: {
            postal_code: '78701',
            country_code: 'US'
          },
          packages: [{
            weight: {
              value: totalWeight,
              unit: 'ounce'
            }
          }]
        },
        rate_options: {
          carrier_ids: ['se-123456']
        }
      })
    });
    
    const { rate_response } = await response.json();
    
    // Return shipping options
    return new Response(
      JSON.stringify({
        rates: rate_response.rates.map(rate => ({
          service: rate.service_type,
          cost: rate.shipping_amount.amount,
          deliveryDays: rate.delivery_days
        }))
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

### Example: AI Product Recommendations

```typescript
// supabase/functions/get-recommendations/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.20.0';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    // Get user's purchase history
    const { data: orders } = await supabase
      .from('orders')
      .select('order_items(product:products(name, category))')
      .eq('user_id', user.id);
    
    // Extract product preferences
    const purchasedProducts = orders
      .flatMap(o => o.order_items)
      .map(item => item.product.name);
    
    // Get all products
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, description, category');
    
    // Use AI to generate recommendations
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are a product recommendation engine for a ramen e-commerce store.'
      }, {
        role: 'user',
        content: `User has purchased: ${purchasedProducts.join(', ')}. 
                  Available products: ${JSON.stringify(allProducts)}.
                  Recommend 5 products they might like. Return only product IDs as JSON array.`
      }],
      response_format: { type: 'json_object' }
    });
    
    const recommendations = JSON.parse(completion.choices[0].message.content);
    
    // Fetch recommended products
    const { data: recommendedProducts } = await supabase
      .from('products')
      .select('*')
      .in('id', recommendations.productIds);
    
    return new Response(
      JSON.stringify({ recommendations: recommendedProducts }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

## 6.6 Scheduled Functions (Cron Jobs)

### Example: Daily Inventory Report

```typescript
// supabase/functions/daily-inventory-report/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Verify this is a scheduled call (check secret header)
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Admin access
    );
    
    // Get low inventory products
    const { data: lowStock } = await supabase
      .from('products')
      .select('name, inventory')
      .lt('inventory', 10)
      .order('inventory', { ascending: true });
    
    // Get out of stock products
    const { data: outOfStock } = await supabase
      .from('products')
      .select('name')
      .eq('inventory', 0);
    
    // Send email report
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'inventory@ramenbae.com',
        to: 'admin@ramenbae.com',
        subject: 'Daily Inventory Report',
        html: `
          <h1>Inventory Report</h1>
          <h2>Low Stock (< 10 units)</h2>
          <ul>
            ${lowStock.map(p => `<li>${p.name}: ${p.inventory} units</li>`).join('')}
          </ul>
          <h2>Out of Stock</h2>
          <ul>
            ${outOfStock.map(p => `<li>${p.name}</li>`).join('')}
          </ul>
        `
      })
    });
    
    return new Response(
      JSON.stringify({ success: true, lowStockCount: lowStock.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

**Schedule with cron:**
```bash
# In Supabase dashboard, set up cron job
# Schedule: 0 9 * * * (every day at 9 AM)
# URL: https://your-project.supabase.co/functions/v1/daily-inventory-report
# Headers: Authorization: Bearer YOUR_CRON_SECRET
```

## 6.7 Testing Edge Functions Locally

### Local Development

```bash
# Start Supabase locally
supabase start

# Serve Edge Function locally
supabase functions serve process-order --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/process-order' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"cartItems": [{"productId": "123", "quantity": 2}]}'
```

### Unit Testing

```typescript
// supabase/functions/process-order/test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('validates cart items', async () => {
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
```

## 6.8 Practical Exercise: Implement Email Notifications

**Your task**: Create an Edge Function that sends order confirmation emails

**Requirements:**
1. Triggered after order is created
2. Includes order details and items
3. Uses email service (Resend)
4. Handles errors gracefully

**Solution:**

```typescript
// supabase/functions/send-order-confirmation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { orderId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Fetch order with items
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        user:auth.users(email),
        order_items(
          quantity,
          price,
          product:products(name, image_url)
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (!order) throw new Error('Order not found');
    
    // Build email HTML
    const itemsHtml = order.order_items
      .map(item => `
        <tr>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>
      `)
      .join('');
    
    const emailHtml = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <h2>Order #${order.id}</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
    `;
    
    // Send email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'orders@ramenbae.com',
        to: order.user.email,
        subject: `Order Confirmation #${order.id}`,
        html: emailHtml
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```

## 6.9 Key Takeaways

- **Edge Functions = Custom backend logic** that runs on Supabase
- **Use for complex operations** that can't be done with direct database access
- **Serverless = No server management**, scales automatically
- **Secure = Hide API keys** and sensitive operations
- **External APIs** = Payments, emails, shipping, AI
- **Scheduled tasks** = Cron jobs for recurring operations

## Next Module Preview

In Module 7, we'll learn about Docker - how to containerize your application for consistent development and deployment!
