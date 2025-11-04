# Module 6: Edge Functions & Custom Backend Logic

Learn when and how to write custom serverless functions for complex backend operations.

## What You'll Learn

- When to use Edge Functions vs direct database access
- Serverless function concepts
- Payment processing with Stripe
- External API integrations
- Email sending
- Scheduled tasks (cron jobs)
- Complex business logic
- Error handling and retry patterns
- Testing and deployment strategies

## Why Edge Functions?

Think of Edge Functions as your backend's secret kitchen - they handle operations that need to stay hidden from the frontend:

**The Restaurant Analogy**:
- **Direct Database Access** = Self-service buffet (customers serve themselves)
- **API Routes** = Waiter (takes orders, visible to customers)
- **Edge Functions** = Kitchen (hidden, handles complex prep work)

Edge Functions let you:
- Hide API keys and secrets
- Process payments securely
- Send emails
- Call external services
- Run scheduled tasks
- Perform heavy calculations

## When to Use Edge Functions

| Use Case | Solution | Reason |
|----------|----------|--------|
| Simple CRUD operations | Direct Database Access | RLS handles security automatically |
| Reading public data | Direct Database Access | No secrets to hide |
| User-specific data | Direct Database Access | RLS protects per-user |
| Payment processing | Edge Function | Must hide Stripe secret key |
| Sending emails | Edge Function | Email API keys must stay secret |
| Calling external APIs | Edge Function | Hide credentials and API keys |
| Complex calculations | Edge Function | Heavy processing off the client |
| Multi-step transactions | Edge Function | Coordinate multiple operations |
| Scheduled tasks | Edge Function | Cron jobs need server environment |

**Quick Decision Guide**:
- Can RLS handle the security? → Use direct database access
- Need to hide API keys? → Use Edge Function
- Need to coordinate multiple services? → Use Edge Function
- Simple read/write? → Use direct database access

## Quick Start

1. Install Supabase CLI
2. Initialize Edge Functions in your project
3. Create your first function
4. Test locally
5. Deploy to Supabase

See [QUICK-START.md](./QUICK-START.md) for a 15-minute walkthrough!

## Structure

- `exercises/` - Hands-on coding exercises
- `theory/` - Conceptual explanations
- `examples/` - Production-ready implementations
- `QUICK-START.md` - Get started in 15 minutes
- `edge-functions-reference.md` - Quick reference guide
- `practice-challenges.md` - Optional challenges

## Prerequisites

- Completed Module 5 (Supabase Ecosystem)
- Understanding of async/await
- Basic Deno knowledge (similar to Node.js)
- Supabase project set up
- API integration experience helpful

## Learning Path

1. **Exercise 01**: Hello World Edge Function (15 min)
   - Set up Supabase CLI
   - Create and deploy your first function
   - Call from frontend

2. **Exercise 02**: Stripe Payment Processing (30 min)
   - Integrate Stripe API
   - Create payment intents
   - Handle webhooks

3. **Exercise 03**: Email Notifications (25 min)
   - Send emails with Resend/SendGrid
   - Template emails
   - Handle delivery errors

4. **Exercise 04**: External API Integration (30 min)
   - Call external APIs securely
   - Implement caching
   - Handle rate limits

5. **Exercise 05**: Scheduled Tasks (25 min)
   - Set up cron jobs
   - Implement cleanup tasks
   - Monitor execution

6. **Exercise 06**: Complete Checkout Flow (45 min)
   - Combine payment, email, and database
   - Handle complex error scenarios
   - Build production-ready function

## Key Concepts

### Edge Function Structure

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Parse request
  const { data } = await req.json();
  
  // Your logic here
  const result = await processData(data);
  
  // Return response
  return new Response(
    JSON.stringify({ result }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Calling from Frontend

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
});
```

### When NOT to Use Edge Functions

```typescript
// ❌ DON'T use Edge Function for simple reads
const { data } = await supabase.functions.invoke('get-products');

// ✅ DO use direct database access
const { data } = await supabase.from('products').select('*');

// ❌ DON'T use Edge Function for user-specific data
const { data } = await supabase.functions.invoke('get-my-orders');

// ✅ DO use RLS-protected direct access
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', user.id);

// ✅ DO use Edge Function for payments
const { data } = await supabase.functions.invoke('create-payment', {
  body: { amount: 1000 }
});

// ✅ DO use Edge Function for emails
const { data } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Welcome!' }
});
```

## Common Patterns

### Payment Processing
```typescript
// Edge Function hides Stripe secret key
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
});
```

### Email Sending
```typescript
// Edge Function hides email API key
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'noreply@example.com',
    to: 'user@example.com',
    subject: 'Order Confirmation',
    html: '<p>Thank you for your order!</p>',
  }),
});
```

### External API Integration
```typescript
// Edge Function hides API credentials
const response = await fetch('https://api.external.com/data', {
  headers: {
    'Authorization': `Bearer ${Deno.env.get('EXTERNAL_API_KEY')}`,
  },
});
```

## Testing Your Edge Functions

### Local Testing
```bash
# Start local server
supabase functions serve function-name

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

### Frontend Testing
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
});

console.log('Response:', data);
console.log('Error:', error);
```

## Common Issues

**"Function not found"**
- Check function is deployed: `supabase functions list`
- Verify function name matches
- Check project reference is correct

**"Authorization header required"**
- Include Supabase anon key in request
- Check auth token is valid

**"Environment variable not set"**
- Set secrets: `supabase secrets set KEY=value`
- Verify in Supabase dashboard

**"CORS error"**
- Add CORS headers to response
- Check origin is allowed

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Stripe API](https://stripe.com/docs/api)
- [Resend Email API](https://resend.com/docs)

## Next Steps

After completing this module:
1. Implement payment processing in your project
2. Add email notifications
3. Integrate external APIs
4. Set up scheduled tasks
5. Build complex multi-step operations

Let's build powerful backend logic! ⚡

