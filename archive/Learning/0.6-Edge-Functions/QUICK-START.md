# Quick Start: Edge Functions

Deploy your first Edge Function in 10 minutes!

## Prerequisites

- Supabase CLI installed (see installation below)
- Supabase project linked
- Basic Deno knowledge (similar to Node.js)

## Install Supabase CLI

**macOS/Linux**:
```bash
brew install supabase/tap/supabase
```

**Windows (Scoop)**:
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Windows (Chocolatey)**:
```bash
choco install supabase
```

**Note**: Do NOT use npm - the CLI is not available via npm.

## Step 1: Create Your First Function (3 minutes)

### Initialize Function

```bash
# Create new Edge Function
supabase functions new hello-world

# This creates: supabase/functions/hello-world/index.ts
```

### Write Function

**File**: `supabase/functions/hello-world/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();

  const data = {
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

## Step 2: Test Locally (2 minutes)

```bash
# Start Supabase locally
supabase start

# Serve function locally
supabase functions serve hello-world

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"name":"World"}'
```

## Step 3: Deploy Function (2 minutes)

```bash
# Deploy to Supabase
supabase functions deploy hello-world

# Function is now live at:
# https://YOUR_PROJECT.supabase.co/functions/v1/hello-world
```

## Step 4: Call from Frontend (3 minutes)

```typescript
// Frontend code
const { data, error } = await supabase.functions.invoke('hello-world', {
  body: { name: 'Alice' },
});

console.log(data); // { message: "Hello Alice!", timestamp: "..." }
```

## Real-World Example: Send Email

### Create Function

```bash
supabase functions new send-email
```

### Implement

**File**: `supabase/functions/send-email/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Parse request
    const { to, subject, html } = await req.json();

    // Send email with Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@yourapp.com',
        to,
        subject,
        html,
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

### Set Secrets

```bash
# Set environment variables
supabase secrets set RESEND_API_KEY=re_...

# List secrets
supabase secrets list
```

### Deploy and Use

```bash
# Deploy
supabase functions deploy send-email

# Call from frontend
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to our app!</h1>',
  },
});
```

## Payment Processing Example

**File**: `supabase/functions/process-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  try {
    const { amount, paymentMethodId } = await req.json();

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      return new Response(
        JSON.stringify({
          success: true,
          paymentIntentId: paymentIntent.id,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Payment failed');
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

## Common Patterns

### Database Access

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Admin access
);

const { data, error } = await supabase.from('products').select('*');
```

### Error Handling

```typescript
serve(async (req) => {
  try {
    // Your logic
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### CORS Headers

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Your logic
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

## Debugging

### View Logs

```bash
# View function logs
supabase functions logs hello-world

# Follow logs in real-time
supabase functions logs hello-world --follow
```

### Local Testing

```bash
# Test locally with environment variables
supabase functions serve hello-world --env-file .env.local
```

## Common Issues

**"Module not found"**
- Use full URLs for imports: `https://esm.sh/package@version`
- Check Deno compatibility

**"Unauthorized"**
- Pass Authorization header from frontend
- Check auth token is valid

**"Function timeout"**
- Edge Functions have 150s timeout
- Optimize long-running operations
- Consider background jobs for heavy tasks

## Next Steps

1. Exercise 01: Build order processing function
2. Exercise 02: Email notifications
3. Exercise 03: External API integration
4. Exercise 04: Scheduled tasks

Let's build powerful backend logic! ⚡
