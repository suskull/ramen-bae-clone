# Serverless Patterns and Best Practices

Common patterns for building robust Edge Functions.

## Stateless Function Design

### What is Stateless?

**Stateless** = Each request is independent, no memory between requests

Think of it like a vending machine - it doesn't remember you from last time.

### Stateless Example

```typescript
// ❌ BAD: Trying to maintain state
let requestCount = 0; // This won't work across requests!

serve(async (req) => {
  requestCount++; // Different instance each time
  return new Response(JSON.stringify({ count: requestCount }));
});

// ✅ GOOD: Store state in database
serve(async (req) => {
  const { data } = await supabase
    .from('analytics')
    .select('request_count')
    .single();
    
  const newCount = data.request_count + 1;
  
  await supabase
    .from('analytics')
    .update({ request_count: newCount });
    
  return new Response(JSON.stringify({ count: newCount }));
});
```

### Stateless Principles

1. **No global variables** for state
2. **Store data in database** or external service
3. **Each request is independent**
4. **No assumptions** about previous requests

## Error Handling Patterns

### Basic Error Handling

```typescript
serve(async (req) => {
  try {
    const { data } = await req.json();
    
    // Validate input
    if (!data.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Process request
    const result = await processEmail(data.email);
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Structured Error Handling

```typescript
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ExternalServiceError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

serve(async (req) => {
  try {
    const { email, amount } = await req.json();
    
    // Validation
    if (!email || !amount) {
      throw new ValidationError('Email and amount are required');
    }
    
    if (amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }
    
    // External service call
    const payment = await processPayment(amount);
    
    return new Response(
      JSON.stringify({ success: true, paymentId: payment.id }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (error instanceof ExternalServiceError) {
      return new Response(
        JSON.stringify({ 
          error: `${error.service} is unavailable`,
          message: error.message 
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generic error
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any
): Response {
  const error: ErrorResponse = {
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
  
  return new Response(
    JSON.stringify(error),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Usage
serve(async (req) => {
  try {
    // Your logic
  } catch (error) {
    return errorResponse(
      'Payment processing failed',
      500,
      'PAYMENT_ERROR',
      { originalError: error.message }
    );
  }
});
```

## Retry Logic

### Simple Retry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // Retry on 5xx errors
      if (response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      
      // Don't retry on 4xx errors
      return response;
      
    } catch (error) {
      lastError = error as Error;
      
      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError!;
}

// Usage
serve(async (req) => {
  try {
    const response = await fetchWithRetry(
      'https://api.external.com/data',
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data));
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'External service unavailable' }),
      { status: 502 }
    );
  }
});
```

### Exponential Backoff

```typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Calculate delay: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, i);
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
serve(async (req) => {
  const result = await exponentialBackoff(
    () => callExternalAPI(),
    3,
    1000
  );
  
  return new Response(JSON.stringify(result));
});
```

## Idempotency

### What is Idempotency?

**Idempotent** = Same request can be made multiple times with same result

Think of it like a light switch - pressing it twice has the same effect as pressing once.

### Idempotency Key Pattern

```typescript
serve(async (req) => {
  const { idempotencyKey, amount, userId } = await req.json();
  
  // Check if request already processed
  const { data: existing } = await supabase
    .from('payments')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .single();
    
  if (existing) {
    // Return cached result
    return new Response(
      JSON.stringify({ 
        paymentId: existing.id,
        cached: true 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Process payment
  const payment = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { userId, idempotencyKey },
  });
  
  // Store result
  await supabase
    .from('payments')
    .insert({
      id: payment.id,
      idempotency_key: idempotencyKey,
      amount,
      user_id: userId,
    });
    
  return new Response(
    JSON.stringify({ paymentId: payment.id }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### Frontend Usage

```typescript
// Generate idempotency key
const idempotencyKey = crypto.randomUUID();

// Make request
const { data } = await supabase.functions.invoke('process-payment', {
  body: {
    idempotencyKey,
    amount: 1000,
    userId: user.id,
  }
});

// Safe to retry with same key
if (error) {
  // Retry with same idempotency key
  const { data } = await supabase.functions.invoke('process-payment', {
    body: {
      idempotencyKey, // Same key!
      amount: 1000,
      userId: user.id,
    }
  });
}
```

## Webhook Patterns

### Webhook Receiver

```typescript
serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 400 }
    );
  }
});

async function handlePaymentSuccess(paymentIntent: any) {
  // Update order status
  await supabase
    .from('orders')
    .update({ status: 'paid', payment_id: paymentIntent.id })
    .eq('id', paymentIntent.metadata.orderId);
    
  // Send confirmation email
  await supabase.functions.invoke('send-email', {
    body: {
      to: paymentIntent.metadata.email,
      subject: 'Payment Confirmed',
      template: 'payment-success',
    }
  });
}
```

### Webhook Sender

```typescript
async function sendWebhook(url: string, data: any, secret: string) {
  // Create signature
  const timestamp = Date.now();
  const payload = `${timestamp}.${JSON.stringify(data)}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Send webhook
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signatureHex,
      'X-Webhook-Timestamp': timestamp.toString(),
    },
    body: JSON.stringify(data),
  });
  
  return response.ok;
}
```

## Background Job Patterns

### Queue Pattern

```typescript
// Add job to queue
serve(async (req) => {
  const { task, data } = await req.json();
  
  // Store job in database
  const { data: job } = await supabase
    .from('jobs')
    .insert({
      task,
      data,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
    
  return new Response(
    JSON.stringify({ jobId: job.id }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

// Process jobs (separate function, called by cron)
serve(async (req) => {
  // Get pending jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .limit(10);
    
  for (const job of jobs || []) {
    try {
      // Mark as processing
      await supabase
        .from('jobs')
        .update({ status: 'processing' })
        .eq('id', job.id);
        
      // Process job
      await processJob(job);
      
      // Mark as complete
      await supabase
        .from('jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id);
        
    } catch (error) {
      // Mark as failed
      await supabase
        .from('jobs')
        .update({ 
          status: 'failed',
          error: error.message 
        })
        .eq('id', job.id);
    }
  }
  
  return new Response(
    JSON.stringify({ processed: jobs?.length || 0 })
  );
});
```

## API Composition

### Combining Multiple APIs

```typescript
serve(async (req) => {
  const { userId } = await req.json();
  
  // Call multiple services in parallel
  const [user, orders, recommendations] = await Promise.all([
    fetchUserProfile(userId),
    fetchUserOrders(userId),
    fetchRecommendations(userId),
  ]);
  
  // Combine results
  const response = {
    user,
    orders,
    recommendations,
    summary: {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    }
  };
  
  return new Response(JSON.stringify(response));
});

async function fetchUserProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

async function fetchUserOrders(userId: string) {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);
  return data;
}

async function fetchRecommendations(userId: string) {
  const response = await fetch(
    `https://api.recommendations.com/users/${userId}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );
  return response.json();
}
```

## Circuit Breaker Pattern

### Prevent Cascading Failures

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      
      // Success - reset failures
      if (this.state === 'half-open') {
        this.state = 'closed';
      }
      this.failures = 0;
      
      return result;
      
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      // Open circuit if threshold exceeded
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}

// Usage
const externalAPIBreaker = new CircuitBreaker(5, 60000);

serve(async (req) => {
  try {
    const data = await externalAPIBreaker.execute(async () => {
      const response = await fetch('https://api.external.com/data');
      return response.json();
    });
    
    return new Response(JSON.stringify(data));
    
  } catch (error) {
    if (error.message === 'Circuit breaker is open') {
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503 }
      );
    }
    throw error;
  }
});
```

## Timeout Handling

### Request Timeout

```typescript
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Usage
serve(async (req) => {
  try {
    const response = await fetchWithTimeout(
      'https://api.slow.com/data',
      {},
      5000 // 5 second timeout
    );
    
    const data = await response.json();
    return new Response(JSON.stringify(data));
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        { status: 504 }
      );
    }
    throw error;
  }
});
```

## Logging and Monitoring

### Structured Logging

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: any;
}

function log(level: LogEntry['level'], message: string, context?: any) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
  
  console.log(JSON.stringify(entry));
}

serve(async (req) => {
  const startTime = Date.now();
  
  try {
    log('info', 'Function invoked', { 
      method: req.method,
      url: req.url 
    });
    
    const { data } = await req.json();
    
    // Process request
    const result = await processData(data);
    
    const duration = Date.now() - startTime;
    log('info', 'Function completed', { duration });
    
    return new Response(JSON.stringify(result));
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log('error', 'Function failed', { 
      error: error.message,
      duration 
    });
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
});
```

### Performance Monitoring

```typescript
async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - start;
    
    console.log(JSON.stringify({
      metric: 'performance',
      operation: name,
      duration,
      success: true,
    }));
    
    return result;
    
  } catch (error) {
    const duration = Date.now() - start;
    
    console.log(JSON.stringify({
      metric: 'performance',
      operation: name,
      duration,
      success: false,
      error: error.message,
    }));
    
    throw error;
  }
}

// Usage
serve(async (req) => {
  const user = await measurePerformance('fetch-user', async () => {
    return await fetchUser(userId);
  });
  
  const orders = await measurePerformance('fetch-orders', async () => {
    return await fetchOrders(userId);
  });
  
  return new Response(JSON.stringify({ user, orders }));
});
```

## Key Takeaways

1. **Design stateless functions** - no memory between requests
2. **Handle errors gracefully** - structured error responses
3. **Implement retry logic** - with exponential backoff
4. **Use idempotency keys** - for safe retries
5. **Verify webhook signatures** - for security
6. **Queue background jobs** - for long-running tasks
7. **Compose APIs efficiently** - parallel requests
8. **Use circuit breakers** - prevent cascading failures
9. **Set timeouts** - don't wait forever
10. **Log structured data** - for monitoring and debugging

## Next Steps

- Apply these patterns in exercises
- Build production-ready functions
- Monitor and optimize performance
- Handle edge cases gracefully

Continue to Exercise 01 to start building!
