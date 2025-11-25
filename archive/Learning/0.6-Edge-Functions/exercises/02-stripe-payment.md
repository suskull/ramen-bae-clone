# Exercise 02: Stripe Payment Processing

Learn to integrate Stripe payment processing securely using Edge Functions with the latest Stripe APIs and best practices.

## Learning Objectives

- Set up Stripe account and API keys
- Create payment intents securely with current Stripe APIs
- Handle payment confirmations
- Implement webhook verification with modern patterns
- Manage environment variables securely
- Handle payment errors gracefully
- Test with Stripe test cards and CLI tools

## Prerequisites

- Completed Exercise 01
- Stripe account (free to create)
- Understanding of payment flows
- Basic knowledge of async/await
- Node.js and npm installed

## Estimated Time

35 minutes

## Part 1: Stripe Setup (5 minutes)

### Task 1.1: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Activate your account (no credit card needed for test mode)

### Task 1.2: Get API Keys

1. Go to Stripe Dashboard → **Developers** → **API keys**
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)

**Important**: Never expose the secret key in frontend code!

### Task 1.3: Set Environment Variables

```bash
# Set Stripe secret key in Supabase (for production deployment)
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here

# Verify it's set
supabase secrets list
```

For local development, add to `.env.local`:
```bash
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Part 2: Create Payment Intent Function (12 minutes)

### Task 2.1: Create Function

```bash
supabase functions new create-payment-intent
```

**Note:** This exercise uses the shared CORS utility pattern from `supabase/functions/_shared/cors.ts`. This provides consistent CORS handling across all Edge Functions and follows best practices for production deployments.

### Task 2.2: Write Function Code

**File**: `supabase/functions/create-payment-intent/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';
import { handleCors, createCorsResponse } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  console.log(`🚀 Payment Intent function called with method: ${req.method}`);

  // Handle CORS preflight using shared utility
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('✅ Preflight request handled, returning CORS headers');
    return corsResponse;
  }

  const origin = req.headers.get('origin');

  try {
    // Get authenticated user
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
      console.log('❌ Unauthorized: No user found');
      return createCorsResponse(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 },
        origin
      );
    }

    console.log(`✅ Authenticated user: ${user.id} (${user.email})`);

    // Parse request body
    const { amount, currency = 'usd', orderId, description } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      console.log(`❌ Invalid amount: ${amount}`);
      return createCorsResponse(
        { error: 'Invalid amount', message: 'Amount must be greater than 0' },
        { status: 400 },
        origin
      );
    }

    console.log(`💰 Creating payment intent for $${amount} ${currency}`);

    // Create payment intent with enhanced metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || `Payment for order ${orderId || 'N/A'}`,
      metadata: {
        userId: user.id,
        orderId: orderId || `order_${Date.now()}`,
        email: user.email || '',
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: user.email || undefined,
      statement_descriptor: 'RAMEN BAE',
    });

    console.log(`✅ Payment Intent created: ${paymentIntent.id}`);

    // Return client secret and payment intent details using CORS utility
    return createCorsResponse(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      { status: 200 },
      origin
    );

  } catch (error) {
    console.error('❌ Payment intent creation failed:', error);
    
    // Enhanced error handling for Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`Stripe Error Type: ${error.type}, Code: ${error.code}`);
      return createCorsResponse(
        { 
          error: 'Payment processing failed',
          message: error.message,
          details: {
            type: error.type,
            code: error.code,
            decline_code: error.decline_code,
          },
        },
        { status: 400 },
        origin
      );
    }
    
    return createCorsResponse(
      { 
        error: 'Payment processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
      origin
    );
  }
});
```

**Key improvements:**
- Uses shared CORS utility from `_shared/cors.ts`
- Enhanced logging with emojis for better debugging
- Proper error handling for Stripe-specific errors
- Consistent response formatting with `createCorsResponse`

### Task 2.3: Create Test Users and Get JWT Token

First, create test users for authentication:

```bash
# Create test users (if not already done)
node scripts/setup-test-users-v2.js
```

Create a helper script to get JWT tokens:

**File**: `get-test-jwt.js`

```javascript
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function getTestJWT() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@test.com',
    password: 'password123'
  });

  if (error) throw error;
  
  console.log('🔑 JWT Token:');
  console.log(data.session.access_token);
  return data.session.access_token;
}

getTestJWT().catch(console.error);
```

### Task 2.4: Test Locally

```bash
# 1. Start local Supabase (if not running)
supabase start

# 2. Start function with environment variables
supabase functions serve create-payment-intent --env-file .env.local

# 3. Get JWT token for testing
node get-test-jwt.js

# 4. Test with curl (replace YOUR_JWT_TOKEN with actual token)
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "amount": 19.99,
    "currency": "usd",
    "orderId": "order_123",
    "description": "Test payment from Edge Function"
  }'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 1999,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

### Task 2.5: Deploy Function

```bash
supabase functions deploy create-payment-intent
```

## Part 3: Frontend Integration (10 minutes)

### Task 3.1: Install Stripe.js

```bash
npm install @stripe/stripe-js
```

### Task 3.2: Create Enhanced Payment Component

**File**: `components/payment-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@/lib/supabase/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentForm() {
  const [amount, setAmount] = useState('19.99');
  const [description, setDescription] = useState('Test Payment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const supabase = createClient();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setPaymentData(null);

    try {
      // Create payment intent
      const { data, error: functionError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            amount: parseFloat(amount),
            currency: 'usd',
            orderId: `order_${Date.now()}`,
            description: description,
          }
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      console.log('Payment Intent created:', data);
      setPaymentData(data);
      setSuccess(true);

      // In a real app, you would now use Stripe Elements to collect payment details
      // and confirm the payment. For this exercise, we're just creating the intent.

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Payment Form</h2>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Amount (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="What is this payment for?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating Payment Intent...' : `Create Payment Intent ($${amount})`}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && paymentData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            <strong>Success!</strong> Payment Intent created.
            <div className="mt-2 text-xs">
              <div><strong>ID:</strong> {paymentData.paymentIntentId}</div>
              <div><strong>Amount:</strong> ${(paymentData.amount / 100).toFixed(2)}</div>
              <div><strong>Status:</strong> {paymentData.status}</div>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 p-3 bg-gray-50 rounded text-sm">
        <p className="font-medium mb-2">Stripe Test Cards:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div><strong>Success:</strong> 4242 4242 4242 4242</div>
          <div><strong>Decline:</strong> 4000 0000 0000 0002</div>
          <div><strong>Requires Auth:</strong> 4000 0025 0000 3155</div>
          <div><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.
        </p>
      </div>
    </div>
  );
}
```

### Task 3.3: Test the Frontend Integration

1. Make sure your Stripe publishable key is in `.env.local`
2. Add the component to a page to test it
3. Sign in as a test user first
4. Try creating payment intents with different amounts

## Part 4: Webhook Handler (10 minutes)

### Task 4.1: Create Webhook Function

```bash
supabase functions new stripe-webhook
```

### Task 4.2: Write Modern Webhook Handler

**File**: `supabase/functions/stripe-webhook/index.ts`

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req) => {
  console.log(`🎣 Webhook received: ${req.method}`);

  try {
    // Get webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ No Stripe signature found');
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log(`✅ Webhook verified: ${event.type} (${event.id})`);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
        console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}`);
        console.log(`   Customer: ${paymentIntent.metadata.email}`);
        console.log(`   Order ID: ${paymentIntent.metadata.orderId}`);

        // In a real app, you would update your database here
        // Example: Update order status, send confirmation email, etc.
        
        const logData = {
          event_type: 'payment_succeeded',
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customer_email: paymentIntent.metadata.email,
          order_id: paymentIntent.metadata.orderId,
          user_id: paymentIntent.metadata.userId,
          processed_at: new Date().toISOString(),
        };

        console.log('📊 Payment data:', JSON.stringify(logData, null, 2));
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        console.log(`   Error: ${paymentIntent.last_payment_error?.message}`);
        console.log(`   Code: ${paymentIntent.last_payment_error?.code}`);

        const errorData = {
          event_type: 'payment_failed',
          payment_intent_id: paymentIntent.id,
          error_message: paymentIntent.last_payment_error?.message,
          error_code: paymentIntent.last_payment_error?.code,
          customer_email: paymentIntent.metadata.email,
          order_id: paymentIntent.metadata.orderId,
          failed_at: new Date().toISOString(),
        };

        console.log('📊 Payment failure data:', JSON.stringify(errorData, null, 2));
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`⚠️  Payment requires action: ${paymentIntent.id}`);
        console.log(`   Next action: ${paymentIntent.next_action?.type}`);
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
        console.log(`   Cancellation reason: ${paymentIntent.cancellation_reason}`);
        break;
      }

      default:
        console.log(`ℹ️  Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true, event: event.type }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Webhook error:', error);
    
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

**Key improvements:**
- Enhanced logging with emojis for better visibility
- More detailed payment information logging
- Better error messages and status codes
- Structured logging for easier debugging

### Task 4.3: Create Webhook Endpoint in Stripe Dashboard

**Modern Stripe Dashboard Steps:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Create endpoint** (or **Add endpoint** button)
4. Enter your endpoint URL:
   - For local testing: `http://localhost:54321/functions/v1/stripe-webhook`
   - For production: `https://nfydvfhrepavcyclzfrh.supabase.co.supabase.co/functions/v1/stripe-webhook`
5. Click **Select events** and choose:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `payment_intent.canceled`
6. Click **Add endpoint**
7. Copy the **Signing secret** from the webhook details (starts with `whsec_`)

### Task 4.4: Set Webhook Secret

```bash
# For local development, add to .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_your_secret_here" >> .env.local

# For production deployment
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Task 4.5: Test Webhook Locally

```bash
# 1. Deploy the webhook function locally
supabase functions serve stripe-webhook --env-file .env.local

# 2. In another terminal, use Stripe CLI to forward events
# stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
stripe listen --forward-to https://nfydvfhrepavcyclzfrh.supabase.co/functions/v1/stripe-webhook

# 3. Trigger a test event
stripe trigger payment_intent.succeeded
```

### Task 4.6: Deploy Webhook Handler

```bash
supabase functions deploy stripe-webhook
```

## Part 5: Testing and Validation (8 minutes)

### Task 5.1: Install and Setup Stripe CLI

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

Login to Stripe:
```bash
stripe login
```

### Task 5.2: Test Webhook Integration

```bash
# 1. Start your webhook function locally
supabase functions serve stripe-webhook --env-file .env.local

# 2. In another terminal, forward webhooks to local function
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# 3. In a third terminal, trigger test events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger payment_intent.requires_action
```

### Task 5.3: End-to-End Testing

Create a complete test script:

**File**: `test-payment-flow.js`

```javascript
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testPaymentFlow() {
  console.log('🧪 Testing Payment Flow...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. Sign in as test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'user@test.com',
    password: 'password123'
  });

  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    return;
  }

  console.log('✅ Signed in as test user');

  // 2. Create payment intent
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: {
      amount: 25.99,
      currency: 'usd',
      description: 'Test payment from script',
      orderId: `test_order_${Date.now()}`
    }
  });

  if (error) {
    console.error('❌ Payment intent creation failed:', error);
    return;
  }

  console.log('✅ Payment intent created:');
  console.log(`   ID: ${data.paymentIntentId}`);
  console.log(`   Amount: $${(data.amount / 100).toFixed(2)}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Client Secret: ${data.clientSecret.substring(0, 20)}...`);

  console.log('\n🎉 Test completed successfully!');
}

testPaymentFlow().catch(console.error);
```

Run the test:
```bash
node test-payment-flow.js
```

### Task 5.4: Stripe Test Cards Reference

Use these test card numbers for different scenarios:

| Card Number | Scenario | Expected Result |
|-------------|----------|-----------------|
| `4242 4242 4242 4242` | Generic success | Payment succeeds |
| `4000 0000 0000 0002` | Generic decline | Card declined |
| `4000 0025 0000 3155` | Requires authentication | 3D Secure challenge |
| `4000 0000 0000 9995` | Insufficient funds | Declined - insufficient funds |
| `4000 0000 0000 9987` | Lost card | Declined - lost card |
| `4000 0000 0000 9979` | Stolen card | Declined - stolen card |
| `4000 0082 6000 0000` | Expired card | Declined - expired card |

**For all test cards:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Task 5.5: Monitor Webhook Events

Check webhook delivery in Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View the **Recent deliveries** section
4. Check response codes and payloads

### Task 5.6: Production Deployment Test

```bash
# 1. Deploy both functions to production
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook

# 2. Update webhook URL in Stripe Dashboard to production URL
# https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook

# 3. Test with production endpoint
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-payment-intent \
  -H "Authorization: Bearer YOUR_PRODUCTION_JWT" \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.00, "currency": "usd", "description": "Production test"}'
```

## Advanced Challenges

### Challenge 1: Save Payment Methods
Modify the function to save payment methods for future use:

```typescript
// Add to payment intent creation
const paymentIntent = await stripe.paymentIntents.create({
  // ... existing options
  setup_future_usage: 'off_session', // Save for future payments
  customer: customerId, // Stripe customer ID
});
```

### Challenge 2: Refund Processing
Create a refund function:

```bash
supabase functions new process-refund
```

### Challenge 3: Payment History API
Create a function to retrieve user payment history:

```typescript
// Get payments for a user
const payments = await stripe.paymentIntents.search({
  query: `metadata['userId']:'${userId}'`,
  limit: 10,
});
```

### Challenge 4: Subscription Support
Extend to support Stripe subscriptions:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: 'price_monthly' }],
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent'],
});
```

### Challenge 5: Multi-Currency Support
Add dynamic currency conversion:

```typescript
// Detect user location and set appropriate currency
const currency = getUserCurrency(userLocation);
const amount = convertAmount(baseAmount, currency);
```

### Challenge 6: Enhanced Error Handling
Implement comprehensive error handling for different Stripe error types:

```typescript
catch (error) {
  if (error instanceof Stripe.errors.StripeCardError) {
    // Card was declined
  } else if (error instanceof Stripe.errors.StripeRateLimitError) {
    // Rate limiting
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    // Invalid parameters
  }
}
```

## Key Takeaways

### Security Best Practices
- ✅ Never expose Stripe secret keys in frontend code
- ✅ Always use HTTPS for webhook endpoints
- ✅ Verify webhook signatures to prevent tampering
- ✅ Use environment variables for all sensitive data
- ✅ Implement proper authentication for Edge Functions

### Payment Processing Best Practices
- ✅ Use current Stripe API versions (2024-06-20+)
- ✅ Handle all payment states (succeeded, failed, requires_action, canceled)
- ✅ Implement idempotency for payment operations
- ✅ Store payment metadata for tracking and support
- ✅ Use descriptive statement descriptors

### Edge Function Best Practices
- ✅ Use `Deno.serve()` instead of importing serve function
- ✅ Implement proper CORS handling
- ✅ Use structured error responses
- ✅ Log important events for debugging
- ✅ Handle authentication properly with JWT tokens

### Testing Best Practices
- ✅ Test with various Stripe test cards
- ✅ Use Stripe CLI for webhook testing
- ✅ Test both success and failure scenarios
- ✅ Validate webhook signature verification
- ✅ Test in both local and production environments

### Monitoring and Debugging
- ✅ Monitor webhook delivery success rates
- ✅ Log payment events with structured data
- ✅ Set up alerts for payment failures
- ✅ Use Stripe Dashboard for transaction monitoring
- ✅ Implement proper error tracking

## Troubleshooting Common Issues

### "Worker failed to boot" Error
- ✅ Use `Deno.serve()` instead of importing serve
- ✅ Update to latest Stripe library versions
- ✅ Check environment variable configuration

### Webhook Signature Verification Fails
- ✅ Ensure webhook secret is correctly configured
- ✅ Use raw request body for signature verification
- ✅ Check webhook endpoint URL matches exactly

### Authentication Errors
- ✅ Use proper JWT tokens from authenticated users
- ✅ Verify Supabase client configuration
- ✅ Check user session validity

## Next Steps

1. **Exercise 03**: Implement email notifications for payment events
2. **Exercise 04**: Add real-time payment status updates
3. **Exercise 05**: Build a complete checkout flow with Stripe Elements

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
