# Edge Functions Fundamentals

Understanding serverless functions through frontend analogies.

## What are Edge Functions?

**Edge Functions** = Functions that run on a server, not in the browser

Think of them as functions that execute on a different computer - specifically, on Supabase's servers close to your users (at the "edge" of the network).

### Frontend Function vs Edge Function

**Same Computer (Frontend Function)**:
```javascript
// Runs in the browser
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const total = calculateTotal(cartItems); // Instant
```

**Different Computer (Edge Function)**:
```typescript
// Runs on Supabase's servers
serve(async (req) => {
  const { items } = await req.json();
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return new Response(JSON.stringify({ total }));
});

// Call from frontend
const { data } = await supabase.functions.invoke('calculate-total', {
  body: { items: cartItems }
}); // Takes longer (network request)
```

### Key Differences

| Aspect | Frontend Function | Edge Function |
|--------|------------------|---------------|
| **Location** | User's browser | Supabase server |
| **Speed** | Instant | Network latency |
| **Security** | Code visible | Code hidden |
| **Secrets** | Can't hide API keys | Can hide API keys |
| **Database** | Limited by RLS | Full admin access |
| **Processing** | Limited by device | Server resources |

## Why Do We Need Edge Functions?

### 1. Hide Secrets

```typescript
// ❌ BAD: API key exposed in frontend
const stripe = new Stripe('sk_live_SECRET_KEY'); // Visible in browser!

// ✅ GOOD: API key hidden in Edge Function
// Edge Function (server-side)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
```

### 2. Server-Only Operations

```typescript
// ❌ CAN'T do this in browser
const nodemailer = require('nodemailer'); // Node.js only

// ✅ CAN do this in Edge Function
const response = await fetch('https://api.resend.com/emails', {
  headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}` }
});
```

### 3. Heavy Processing

```typescript
// ❌ BAD: Heavy processing in browser (slow on mobile)
function processLargeDataset(data) {
  // Complex calculations...
  // User's phone gets hot 🔥
}

// ✅ GOOD: Heavy processing on server
serve(async (req) => {
  const { data } = await req.json();
  // Complex calculations on powerful server
  return new Response(JSON.stringify({ result }));
});
```

### 4. Coordinate Multiple Services

```typescript
// Edge Function can orchestrate multiple operations
serve(async (req) => {
  // 1. Process payment with Stripe
  const payment = await stripe.paymentIntents.create({...});
  
  // 2. Create order in database
  const { data: order } = await supabase.from('orders').insert({...});
  
  // 3. Send confirmation email
  await fetch('https://api.resend.com/emails', {...});
  
  // 4. Update inventory
  await supabase.from('products').update({...});
  
  return new Response(JSON.stringify({ orderId: order.id }));
});
```

## The Restaurant Analogy

Think of your application like a restaurant:

| Component | Restaurant | Your App |
|-----------|-----------|----------|
| **Frontend** | Dining area | What customers see |
| **Direct Database Access** | Self-service buffet | Customers serve themselves |
| **API Routes** | Waiter | Takes orders, brings food |
| **Edge Functions** | Kitchen | Hidden, complex prep work |

**Example Flow**:

```
Customer orders steak (payment request)
  ↓
Waiter takes order (frontend calls Edge Function)
  ↓
Kitchen prepares steak (Edge Function processes payment)
  - Charges credit card (Stripe API)
  - Records order (database)
  - Notifies chef (email notification)
  ↓
Waiter brings steak (Edge Function returns success)
  ↓
Customer enjoys meal (frontend shows confirmation)
```

## When to Use Edge Functions

### Decision Tree

```
Need to hide API keys or secrets?
  ├─ YES → Use Edge Function
  └─ NO → Continue...

Need to send emails or SMS?
  ├─ YES → Use Edge Function
  └─ NO → Continue...

Need to call external APIs?
  ├─ YES → Use Edge Function
  └─ NO → Continue...

Need to coordinate multiple operations?
  ├─ YES → Use Edge Function
  └─ NO → Continue...

Simple CRUD with RLS?
  └─ NO → Use Direct Database Access
```

### Use Cases Table

| Use Case | Solution | Why |
|----------|----------|-----|
| Read public products | Direct DB | No secrets, RLS handles it |
| Read user's orders | Direct DB | RLS protects per-user |
| Create product review | Direct DB | RLS validates ownership |
| Process payment | Edge Function | Must hide Stripe key |
| Send order email | Edge Function | Email API key secret |
| Call weather API | Edge Function | Hide API credentials |
| Generate PDF invoice | Edge Function | Heavy processing |
| Scheduled cleanup | Edge Function | Needs cron support |
| Multi-step checkout | Edge Function | Coordinate services |

### Examples

**✅ Use Direct Database Access**:
```typescript
// Simple, RLS-protected operations
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'ramen');

const { data: myOrders } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id); // RLS ensures user only sees their orders
```

**✅ Use Edge Functions**:
```typescript
// Payment processing (hide Stripe key)
const { data } = await supabase.functions.invoke('process-payment', {
  body: { amount: 1000, paymentMethodId: 'pm_...' }
});

// Send email (hide email API key)
const { data } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Order Confirmation' }
});

// External API (hide credentials)
const { data } = await supabase.functions.invoke('get-weather', {
  body: { city: 'Tokyo' }
});
```

## Edge Functions vs API Routes

### Comparison

| Feature | Edge Functions | Next.js API Routes |
|---------|---------------|-------------------|
| **Runtime** | Deno | Node.js |
| **Location** | Supabase servers | Your Vercel/server |
| **Deployment** | Supabase CLI | Next.js deployment |
| **Database** | Built-in Supabase | Need to configure |
| **Auth** | Built-in Supabase Auth | Need to implement |
| **Best For** | Supabase projects | Custom backends |

### When to Use Each

**Use Edge Functions when**:
- Using Supabase for database and auth
- Need global edge deployment
- Want serverless simplicity
- Building Supabase-first apps

**Use API Routes when**:
- Need Node.js-specific packages
- Complex custom backend logic
- Not using Supabase
- Need more control over infrastructure

## How Edge Functions Work

### Request-Response Flow

```
1. Frontend makes request
   ↓
2. Request travels to nearest edge location
   ↓
3. Edge Function receives request
   ↓
4. Function processes (database, APIs, etc.)
   ↓
5. Function returns response
   ↓
6. Response travels back to frontend
   ↓
7. Frontend receives data
```

### Example Flow

```typescript
// 1. Frontend makes request
const { data, error } = await supabase.functions.invoke('create-order', {
  body: { items: cartItems, paymentMethodId: 'pm_...' }
});

// 2-3. Edge Function receives request
serve(async (req) => {
  const { items, paymentMethodId } = await req.json();
  
  // 4. Process payment
  const payment = await stripe.paymentIntents.create({
    amount: calculateTotal(items),
    payment_method: paymentMethodId,
  });
  
  // 4. Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({ items, total: payment.amount });
  
  // 5. Return response
  return new Response(JSON.stringify({ orderId: order.id }));
});

// 6-7. Frontend receives response
console.log('Order created:', data.orderId);
```

## Serverless Computing

### What is Serverless?

**Serverless** doesn't mean "no servers" - it means you don't manage servers.

**Traditional Server**:
```
You rent a server 24/7
  ↓
You configure it
  ↓
You maintain it
  ↓
You pay even when idle
  ↓
You scale manually
```

**Serverless (Edge Functions)**:
```
Supabase manages servers
  ↓
Auto-configured
  ↓
Auto-maintained
  ↓
Pay only for execution time
  ↓
Auto-scales
```

### Benefits

1. **No Server Management**: Supabase handles everything
2. **Auto-Scaling**: Handles 1 or 1,000,000 requests
3. **Pay Per Use**: Only pay for execution time
4. **Global Edge**: Runs close to users worldwide
5. **Zero Downtime**: Always available

### Limitations

1. **Stateless**: Each request is independent
2. **Timeout**: 150 seconds max execution
3. **Cold Starts**: First request may be slower
4. **No Persistent Connections**: Can't keep WebSockets open

## Deno vs Node.js

Edge Functions use **Deno**, not Node.js. Here are the key differences:

### Import Differences

```typescript
// ❌ Node.js style (doesn't work)
const stripe = require('stripe');
import stripe from 'stripe';

// ✅ Deno style (works in Edge Functions)
import Stripe from 'https://esm.sh/stripe@13.0.0';
```

### Environment Variables

```typescript
// ❌ Node.js style
process.env.STRIPE_KEY

// ✅ Deno style
Deno.env.get('STRIPE_KEY')
```

### File System

```typescript
// ❌ Node.js style
const fs = require('fs');
fs.readFileSync('file.txt');

// ✅ Deno style
const text = await Deno.readTextFile('file.txt');
```

### Why Deno?

- **Secure by default**: No file/network access without permission
- **TypeScript native**: No configuration needed
- **Modern**: Uses ES modules, top-level await
- **Fast**: Optimized for edge deployment

## Security Benefits

### 1. Hide API Keys

```typescript
// Frontend (visible to everyone)
const STRIPE_KEY = 'sk_live_...'; // ❌ EXPOSED!

// Edge Function (hidden on server)
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!); // ✅ SAFE
```

### 2. Server-Side Validation

```typescript
serve(async (req) => {
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Verify user owns the resource
  const { data: order } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .single();
    
  if (order.user_id !== user.id) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Process request...
});
```

### 3. Rate Limiting

```typescript
// Track requests per user
const requestCount = await redis.incr(`requests:${userId}`);
if (requestCount > 100) {
  return new Response('Too many requests', { status: 429 });
}
```

## Performance Considerations

### Edge Deployment

Edge Functions run on servers close to your users:

```
User in Tokyo → Tokyo edge server (fast)
User in London → London edge server (fast)
User in New York → New York edge server (fast)
```

### Cold Starts

First request after idle period may be slower:

```
First request: ~500ms (cold start)
Subsequent requests: ~50ms (warm)
```

**Mitigation**:
- Keep functions small
- Minimize dependencies
- Use warming strategies for critical functions

### Optimization Tips

1. **Minimize Dependencies**: Fewer imports = faster cold starts
2. **Cache External API Calls**: Reduce redundant requests
3. **Use Streaming**: For large responses
4. **Batch Operations**: Combine multiple database queries
5. **Async Operations**: Don't block on slow operations

## Cost Implications

### Pricing Model

Edge Functions are billed by:
- **Invocations**: Number of times called
- **Execution Time**: How long they run
- **Data Transfer**: Response size

### Cost Optimization

```typescript
// ❌ Expensive: Multiple function calls
for (const item of items) {
  await supabase.functions.invoke('process-item', { body: { item } });
}

// ✅ Cheaper: Single function call
await supabase.functions.invoke('process-items', { body: { items } });
```

### Free Tier

Supabase provides generous free tier:
- 500,000 invocations/month
- 400,000 GB-seconds/month

## Key Takeaways

1. **Edge Functions run on servers**, not in the browser
2. **Use them to hide secrets** like API keys
3. **Perfect for server-only operations** like sending emails
4. **Great for coordinating multiple services** in one request
5. **Use direct database access** for simple CRUD operations
6. **Deno, not Node.js** - different import syntax
7. **Serverless = no server management** but has limitations
8. **Deployed globally** for low latency
9. **Pay per use** - cost-effective for most apps
10. **Security benefits** from server-side execution

## Next Steps

Now that you understand Edge Functions fundamentals:
- Learn serverless patterns and best practices
- Build your first Edge Function (Exercise 01)
- Integrate payment processing (Exercise 02)
- Send emails (Exercise 03)
- Call external APIs (Exercise 04)

Continue to `serverless-patterns.md` to learn common patterns!
