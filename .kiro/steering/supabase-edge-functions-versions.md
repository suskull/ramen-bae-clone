# Supabase Edge Functions Version Standards

## Always Use Current Deno and Library Versions

When working with Supabase Edge Functions, **ALWAYS** use the current recommended versions and patterns to avoid boot errors and compatibility issues.

## Required Versions and Patterns

### Deno Standard Library
- **Use**: `Deno.serve()` directly (built-in)
- **Don't use**: `import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'`

### Supabase JS Client
- **Use**: `https://esm.sh/@supabase/supabase-js@2`
- **Pattern**: Always use latest v2

### Stripe Integration
- **Use**: `https://esm.sh/stripe@14.0.0` or later
- **API Version**: `2024-06-20` or current
- **HTTP Client**: Always use `Stripe.createFetchHttpClient()`

## Correct Edge Function Template

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Your function logic here
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

## Common Issues to Avoid

### ❌ Outdated Patterns
```typescript
// DON'T USE - causes boot errors
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
serve(async (req) => { ... });
```

### ❌ Old Stripe Versions
```typescript
// DON'T USE - outdated
import Stripe from 'https://esm.sh/stripe@13.0.0';
const stripe = new Stripe(key, { apiVersion: '2023-10-16' });
```

### ✅ Current Patterns
```typescript
// USE THIS - current standard
Deno.serve(async (req) => { ... });

// USE THIS - current Stripe
import Stripe from 'https://esm.sh/stripe@14.0.0';
const stripe = new Stripe(key, { 
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient()
});
```

## Environment Setup

### Local Development
- Use local Supabase instance: `http://127.0.0.1:54321`
- Include service role key for admin operations
- Test with proper JWT tokens from authenticated users

### Required Environment Variables
```bash
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
```

## Testing Edge Functions

### 1. Serve Locally
```bash
supabase functions serve function-name --env-file .env.local
```

### 2. Get JWT Token for Testing
```javascript
// Create test user and get JWT
const { data } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});
const jwt = data.session.access_token;
```

### 3. Test with cURL
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"key": "value"}'
```

## When to Apply This Rule

- **Always** when creating new Edge Functions
- **Always** when updating existing Edge Functions
- **Always** when debugging "Worker failed to boot" errors
- **Always** when integrating third-party services like Stripe
- **Always** when following exercise instructions (update them to current patterns)

## Benefits

1. **Avoid Boot Errors**: Current patterns prevent runtime failures
2. **Better Performance**: Latest versions include optimizations
3. **Security**: Current API versions include latest security features
4. **Compatibility**: Works with current Supabase infrastructure
5. **Future-Proof**: Easier to maintain and update

## Remember

- Edge Functions run in Deno runtime, not Node.js
- Always use `Deno.serve()` for the latest compatibility
- Keep library versions current to avoid deprecated features
- Test locally before deploying to production
- Use proper authentication for secure endpoints

This rule ensures all Edge Functions use current, compatible versions and patterns.