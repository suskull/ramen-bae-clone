# Edge Functions Quick Reference

## Basic Structure

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { data } = await req.json();
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ result: 'success' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

## Calling from Frontend

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
});
```

## Environment Variables

### Set Secrets
```bash
supabase secrets set KEY=value
supabase secrets list
```

### Access in Function
```typescript
const apiKey = Deno.env.get('API_KEY');
```

## JWT Authentication

### Local Development JWT Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

### Local Service Role JWT Token (Admin)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Configure JWT Verification
```toml
# supabase/config.toml
[functions.function-name]
verify_jwt = true  # Secure (recommended)
# verify_jwt = false  # Insecure (only for testing)
```

## Request Handling

### GET Request
```typescript
const url = new URL(req.url);
const param = url.searchParams.get('param');
```

### POST Request
```typescript
const body = await req.json();
const { field } = body;
```

### Headers
```typescript
const authHeader = req.headers.get('Authorization');
const contentType = req.headers.get('Content-Type');
```

## Response Patterns

### Success Response
```typescript
return new Response(
  JSON.stringify({ data: result }),
  { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  }
);
```

### Error Response
```typescript
return new Response(
  JSON.stringify({ error: 'Error message' }),
  { 
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  }
);
```

### CORS Headers
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}

// Add to response
return new Response(
  JSON.stringify(data),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
```

## Authentication

### Verify User
```typescript
const authHeader = req.headers.get('Authorization')!;
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
);

const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401 }
  );
}
```

## Database Access

### With User Context
```typescript
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  { global: { headers: { Authorization: authHeader } } }
);

const { data } = await supabase.from('table').select('*');
```

### With Service Role (Admin)
```typescript
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const { data } = await supabase.from('table').select('*');
```

## External API Calls

### Basic Fetch
```typescript
const response = await fetch('https://api.example.com/data', {
  headers: {
    'Authorization': `Bearer ${Deno.env.get('API_KEY')}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### With Retry
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status >= 500 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

## Common Integrations

### Stripe Payment
```typescript
import Stripe from 'https://esm.sh/stripe@13.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
});
```

### Send Email (Resend)
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'noreply@example.com',
    to: 'user@example.com',
    subject: 'Hello',
    html: '<p>Hello World</p>',
  }),
});
```

## Testing Commands

```bash
# Create function
supabase functions new function-name

# Serve locally
supabase functions serve function-name

# Serve with env file
supabase functions serve function-name --env-file .env.local

# Deploy
supabase functions deploy function-name

# View logs
supabase functions logs function-name

# Follow logs
supabase functions logs function-name --follow

# Delete function
supabase functions delete function-name

# List functions
supabase functions list
```

## Testing with curl

```bash
# POST request (local development)
curl -i --location --request POST 'http://localhost:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'

# GET request (local development)
curl -i --location --request GET 'http://localhost:54321/functions/v1/function-name?param=value' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

# Production request
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_PRODUCTION_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

## Error Handling

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

serve(async (req) => {
  try {
    // Your logic
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
});
```

## Logging

```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  message: 'Operation completed',
  duration: 123,
  userId: user.id,
}));

// Error logging
console.error('Error:', error.message, {
  stack: error.stack,
  context: { userId, orderId },
});
```

## Best Practices

1. **Always validate input**
2. **Use environment variables for secrets**
3. **Implement proper error handling**
4. **Add CORS headers when needed**
5. **Authenticate users before operations**
6. **Log important events**
7. **Use TypeScript types**
8. **Test locally before deploying**
9. **Monitor function performance**
10. **Implement idempotency for critical operations**

## Common Patterns

### Idempotency
```typescript
const { idempotencyKey } = await req.json();

const { data: existing } = await supabase
  .from('operations')
  .select('*')
  .eq('idempotency_key', idempotencyKey)
  .single();

if (existing) {
  return new Response(JSON.stringify(existing));
}

// Process operation...
```

### Rate Limiting
```typescript
const userId = user.id;
const key = `rate:${userId}`;

const count = await redis.incr(key);
if (count === 1) {
  await redis.expire(key, 60); // 1 minute window
}

if (count > 10) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429 }
  );
}
```

### Caching
```typescript
const cacheKey = `cache:${key}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return new Response(JSON.stringify(JSON.parse(cached)));
}

const data = await fetchData();
await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5 min TTL

return new Response(JSON.stringify(data));
```

## Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Unexpected error |
| 502 | Bad Gateway | External service error |
| 504 | Gateway Timeout | Request timeout |

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Standard Library](https://deno.land/std)
- [Deno Third Party Modules](https://deno.land/x)
- [Edge Functions Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
