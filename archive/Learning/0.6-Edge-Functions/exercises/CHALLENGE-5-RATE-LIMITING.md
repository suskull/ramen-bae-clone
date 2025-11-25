# Challenge 5: Rate Limiting - Implementation Guide

## Overview

This challenge implements a simple rate limiting mechanism for the hello-world Edge Function. The rate limiter restricts clients to **10 requests per minute** per IP address.

## Implementation Details

### Rate Limiting Logic

The implementation uses a database-based approach to track requests per IP address, solving the stateless nature of Edge Functions:

```typescript
// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Maximum requests per window

// Database-based rate limiting function
async function checkRateLimit(supabase: any, clientIP: string) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW);
  
  // Clean up old entries
  await supabase.from('rate_limits').delete().lt('created_at', windowStart.toISOString());
  
  // Count current requests for this IP
  const { data: existingRequests } = await supabase
    .from('rate_limits')
    .select('id')
    .eq('client_ip', clientIP)
    .gte('created_at', windowStart.toISOString());
    
  const currentCount = existingRequests?.length || 0;
  
  if (currentCount >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: now.getTime() + RATE_LIMIT_WINDOW };
  }
  
  // Record this request
  await supabase.from('rate_limits').insert({ client_ip: clientIP, created_at: now.toISOString() });
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - currentCount - 1,
    resetTime: now.getTime() + RATE_LIMIT_WINDOW
  };
}
```

### Database Schema

The rate limiting uses a simple `rate_limits` table:

```sql
CREATE TABLE rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for efficient querying
CREATE INDEX idx_rate_limits_client_ip_created_at ON rate_limits (client_ip, created_at);
CREATE INDEX idx_rate_limits_created_at ON rate_limits (created_at);
```

### Key Features

1. **IP-based Tracking**: Uses `x-forwarded-for` or `x-real-ip` headers to identify clients
2. **Database Persistence**: Stores rate limit data in Supabase database for consistency across function restarts
3. **Sliding Window**: Each IP gets a fresh window every minute
4. **HTTP 429 Response**: Returns proper rate limit exceeded status
5. **Rate Limit Headers**: Includes standard rate limiting headers in responses
6. **Automatic Cleanup**: Automatically removes expired entries to keep the database clean
7. **Fail-Open Design**: If database operations fail, allows requests to proceed (graceful degradation)

### Response Headers

All responses include rate limiting information:

- `X-RateLimit-Limit`: Maximum requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in current window  
- `X-RateLimit-Reset`: Unix timestamp when the window resets
- `Retry-After`: Seconds to wait before retrying (only on 429 responses)

## Database Setup

Before testing, ensure the rate limiting table is created:

### Migration

The implementation includes a database migration that creates the necessary table:

```bash
# Create and apply the migration
supabase migration new create_rate_limits_table
supabase db push  # Apply to remote database
supabase db reset # Apply to local database
```

### Manual Setup (if needed)

If you need to create the table manually:

```sql
-- Create the rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_client_ip_created_at 
ON rate_limits (client_ip, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at 
ON rate_limits (created_at);

-- Enable RLS and create policies
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon to manage rate limits" ON rate_limits
FOR ALL USING (true);
```

## Testing the Implementation

### Method 1: Using the Web Interface

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/test` in your browser

3. Use the "Rate Limiting Challenge" section to test:
   - **Single Request**: Make one request at a time
   - **5 Requests**: Make 5 rapid requests (should all succeed)
   - **15 Requests**: Make 15 rapid requests (should hit rate limit after 10)

### Method 2: Using curl Commands

1. Start the Edge Function locally:
   ```bash
   supabase functions serve hello-world
   ```

2. Test with rapid requests:
   ```bash
   # Make 15 rapid requests to trigger rate limiting
   for i in {1..15}; do
     echo "Request $i:"
     curl -i --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
       --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
       --header 'Content-Type: application/json' \
       --data "{\"name\":\"Request $i\"}"
     echo -e "\n---\n"
     sleep 0.1
   done
   ```

### Method 3: Using a Simple Script

Create a test script to simulate multiple clients:

```bash
#!/bin/bash
echo "Testing rate limiting with 15 requests..."

for i in {1..15}; do
  response=$(curl -s -w "HTTP_CODE:%{http_code}" \
    --location --request POST 'http://localhost:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data "{\"name\":\"Request $i\"}")
  
  http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
  body=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
  
  echo "Request $i: HTTP $http_code"
  if [ "$http_code" = "429" ]; then
    echo "  Rate limited! Response: $body"
    break
  else
    echo "  Success: $(echo "$body" | jq -r '.message // .error')"
  fi
  
  sleep 0.1
done
```

## Expected Behavior

### Successful Requests (1-10)

```json
{
  "message": "Hello Request 1!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "authenticated": false,
  "userRole": "anonymous",
  "clientIP": "127.0.0.1",
  "rateLimit": {
    "remaining": 9,
    "limit": 10,
    "resetTime": "2024-01-15T10:31:00.000Z"
  }
}
```

### Rate Limited Requests (11+)

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Try again in 45 seconds.",
  "retryAfter": 45,
  "limit": 10,
  "window": 60
}
```

## Production Considerations

### Current Implementation Benefits

1. **Database Persistence**: Rate limits survive function restarts and deployments
2. **Distributed**: Works consistently across multiple Edge Function instances
3. **Automatic Cleanup**: Old entries are automatically removed
4. **Fail-Safe**: Gracefully handles database errors by allowing requests

### Production Improvements

For high-traffic production use, consider these enhancements:

1. **Redis-based Rate Limiting** (for even better performance):
   ```typescript
   import { Redis } from 'https://deno.land/x/redis/mod.ts';
   
   const redis = new Redis({
     hostname: Deno.env.get('REDIS_HOST'),
     port: parseInt(Deno.env.get('REDIS_PORT') || '6379'),
     password: Deno.env.get('REDIS_PASSWORD')
   });
   
   async function checkRateLimit(clientIP: string) {
     const key = `rate_limit:${clientIP}`;
     const current = await redis.incr(key);
     
     if (current === 1) {
       await redis.expire(key, 60); // 1 minute window
     }
     
     return {
       allowed: current <= RATE_LIMIT_MAX_REQUESTS,
       remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - current),
       resetTime: Date.now() + (60 * 1000)
     };
   }
   ```

2. **Optimized Database Queries** (current implementation already uses this approach):
   ```typescript
   // Current implementation efficiently queries and cleans up data
   await supabase.from('rate_limits').delete().lt('created_at', windowStart.toISOString());
   const { data } = await supabase
     .from('rate_limits')
     .select('id')
     .eq('client_ip', clientIP)
     .gte('created_at', windowStart.toISOString());
   ```

3. **Different Rate Limits by User Type**:
   ```typescript
   const getRateLimit = (user: any) => {
     if (user?.role === 'premium') return 100; // Premium users get more requests
     if (user?.role === 'authenticated') return 50; // Authenticated users get more
     return 10; // Anonymous users get basic limit
   };
   ```

## Key Learning Points

1. **Rate Limiting Patterns**: Sliding window vs fixed window approaches
2. **HTTP Status Codes**: Proper use of 429 "Too Many Requests"
3. **Client IP Detection**: Handling proxy headers in serverless environments
4. **Memory Management**: Cleaning up expired data to prevent memory leaks
5. **Error Handling**: Graceful degradation when rate limits are exceeded
6. **Observability**: Including rate limit information in responses

## Next Steps

1. Deploy the function and test with the production URL
2. Monitor function logs to see rate limiting in action
3. Experiment with different rate limit configurations
4. Consider implementing more sophisticated rate limiting strategies
5. Add metrics and monitoring for rate limit effectiveness

## Troubleshooting

### Rate Limiting Not Working

1. Check that the function is properly deployed
2. Verify IP detection is working (check logs for client IP)
3. Ensure requests are coming from the same IP address

### Memory Issues

1. Monitor function memory usage in Supabase dashboard
2. Adjust cleanup interval if needed
3. Consider reducing the rate limit window for high-traffic scenarios

### Testing Locally

1. Use `127.0.0.1` or `localhost` consistently
2. Clear browser cache between tests
3. Use different browsers or incognito mode to simulate different IPs

### Database Issues

1. **Table doesn't exist**: Run `supabase db reset` to apply migrations
2. **Permission errors**: Check that RLS policies allow anon role access
3. **Rate limits not persisting**: Verify the database connection is working

### Production vs Local Behavior

**Local Development**: Rate limiting works perfectly as all requests hit the same function instance.

**Production Environment**: Edge Functions are distributed globally across multiple regions and instances. This means:
- Requests may be handled by different function instances
- Each instance maintains its own database connection
- Rate limiting is still effective but may appear less strict due to distribution
- The rate limit headers (`X-RateLimit-*`) will still be accurate for each instance

This is expected behavior in a distributed serverless environment and provides better global performance.

### Checking Rate Limit Data

You can view the rate limit data in your Supabase dashboard:

```sql
-- View current rate limit entries
SELECT client_ip, created_at, 
       NOW() - created_at as age
FROM rate_limits 
ORDER BY created_at DESC;

-- Clean up all rate limit data (for testing)
DELETE FROM rate_limits;
```