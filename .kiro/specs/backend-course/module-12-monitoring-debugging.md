# Module 12: Monitoring and Debugging (Finding and Fixing Issues)

## Learning Objectives
- Set up application monitoring
- Debug production issues
- Analyze logs effectively
- Track performance metrics
- Implement alerting systems

## 11.1 Why Monitoring Matters

### Development vs Production

**Development:**
```javascript
// Easy to debug
console.log('User:', user);
// See error immediately in terminal
```

**Production:**
```javascript
// Thousands of users
// Errors happen on different servers
// Can't see console.log
// Need proper monitoring!
```

**Frontend analogy**: Like having React DevTools for your entire backend

## 12.2 Application Monitoring

### Vercel Analytics

```typescript
// Automatic monitoring with Vercel
// Shows:
// - Request count
// - Response times
// - Error rates
// - Geographic distribution
```

### Custom Monitoring with Sentry

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send 404 errors
    if (event.exception?.values?.[0]?.value?.includes('404')) {
      return null;
    }
    return event;
  }
});
```

```typescript
// Usage in API routes
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    const result = await processOrder(data);
    return NextResponse.json({ result });
  } catch (error) {
    // Automatically sent to Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/orders',
        method: 'POST'
      },
      extra: {
        userId: user?.id,
        orderData: data
      }
    });
    
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
```

## 12.3 Structured Logging

### Why Structured Logs?

```typescript
// ❌ BAD: Unstructured logs
console.log('User 123 created order for $29.99');

// ✅ GOOD: Structured logs
logger.info({
  event: 'order_created',
  userId: '123',
  orderId: 'ord_456',
  amount: 29.99,
  timestamp: new Date().toISOString()
});
```

**WHY**: Structured logs are searchable and analyzable

### Implementing Structured Logging

```bash
npm install pino pino-pretty
```

```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

// Log levels: trace, debug, info, warn, error, fatal
```

```typescript
// Usage
import { logger } from '@/lib/logger';

// Info logs
logger.info({ userId: '123' }, 'User logged in');

// Error logs
logger.error({ error, userId: '123' }, 'Failed to create order');

// With context
logger.info({
  event: 'order_created',
  orderId: 'ord_123',
  userId: 'user_456',
  amount: 29.99,
  items: 3
}, 'Order created successfully');
```

### Log Aggregation

```typescript
// Send logs to external service (e.g., Logtail, Datadog)
import { Logtail } from '@logtail/node';

const logtail = new Logtail(process.env.LOGTAIL_TOKEN!);

export const logger = {
  info: (data: any, message: string) => {
    console.log(message, data);
    logtail.info(message, data);
  },
  error: (data: any, message: string) => {
    console.error(message, data);
    logtail.error(message, data);
  }
};
```

## 12.4 Performance Monitoring

### Response Time Tracking

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  // Add response time header
  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);
  
  // Log slow requests
  if (duration > 1000) {
    logger.warn({
      path: request.nextUrl.pathname,
      method: request.method,
      duration
    }, 'Slow request detected');
  }
  
  return response;
}
```

### Database Query Monitoring

```typescript
// lib/db-monitor.ts
export async function monitorQuery<T>(
  name: string,
  query: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  
  try {
    const result = await query();
    const duration = Date.now() - start;
    
    logger.info({
      query: name,
      duration,
      success: true
    });
    
    // Alert on slow queries
    if (duration > 500) {
      logger.warn({ query: name, duration }, 'Slow query detected');
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    
    logger.error({
      query: name,
      duration,
      error: error.message
    }, 'Query failed');
    
    throw error;
  }
}

// Usage
const products = await monitorQuery(
  'fetch-products',
  () => supabase.from('products').select('*')
);
```

## 12.5 Error Tracking

### Error Context

```typescript
// lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, context?: Record<string, any>) {
  if (error instanceof AppError) {
    logger.error({
      error: error.message,
      statusCode: error.statusCode,
      context: { ...error.context, ...context }
    });
    
    Sentry.captureException(error, {
      extra: { ...error.context, ...context }
    });
    
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  // Unknown error
  logger.error({ error, context }, 'Unexpected error');
  Sentry.captureException(error, { extra: context });
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

```typescript
// Usage in API route
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.productId) {
      throw new AppError('Product ID required', 400, { data });
    }
    
    const product = await getProduct(data.productId);
    
    if (!product) {
      throw new AppError('Product not found', 404, {
        productId: data.productId
      });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    return handleError(error, {
      endpoint: '/api/products',
      method: 'POST'
    });
  }
}
```

## 12.6 Alerting

### Setting Up Alerts

```typescript
// lib/alerts.ts
export async function sendAlert(
  severity: 'info' | 'warning' | 'critical',
  message: string,
  context?: Record<string, any>
) {
  // Log alert
  logger[severity === 'critical' ? 'error' : severity]({
    alert: true,
    severity,
    message,
    context
  });
  
  // Send to Slack
  if (severity === 'critical') {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 ${message}`,
        attachments: [{
          color: 'danger',
          fields: Object.entries(context || {}).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true
          }))
        }]
      })
    });
  }
  
  // Send email for critical alerts
  if (severity === 'critical') {
    await sendEmail({
      to: 'alerts@ramenbae.com',
      subject: `Critical Alert: ${message}`,
      body: JSON.stringify(context, null, 2)
    });
  }
}
```

```typescript
// Usage
// High error rate
if (errorRate > 0.05) {
  await sendAlert('critical', 'Error rate above 5%', {
    errorRate,
    endpoint: '/api/orders'
  });
}

// Low inventory
if (product.inventory < 5) {
  await sendAlert('warning', 'Low inventory', {
    productId: product.id,
    productName: product.name,
    inventory: product.inventory
  });
}

// Database connection issues
try {
  await supabase.from('products').select('count');
} catch (error) {
  await sendAlert('critical', 'Database connection failed', {
    error: error.message
  });
}
```

## 12.7 Debugging Production Issues

### Debugging Checklist

1. **Check error logs**
```bash
# Vercel logs
vercel logs

# Sentry dashboard
# View error details, stack traces, user context
```

2. **Reproduce the issue**
```typescript
// Add detailed logging
logger.info({ step: 1, data }, 'Starting process');
logger.info({ step: 2, result }, 'Completed step 2');
logger.info({ step: 3, final }, 'Process complete');
```

3. **Check recent deployments**
```bash
# Was there a recent deploy?
# Did the issue start after deployment?
# Rollback if needed
vercel rollback
```

4. **Check external services**
```typescript
// Is Stripe down?
// Is database responding?
// Are API keys valid?
```

### Debug Mode

```typescript
// Enable debug mode for specific users
export async function GET(request: NextRequest) {
  const debugMode = request.headers.get('X-Debug-Mode') === 'true';
  
  if (debugMode) {
    logger.debug({ request: request.url }, 'Debug mode enabled');
  }
  
  try {
    const result = await processRequest();
    
    if (debugMode) {
      return NextResponse.json({
        result,
        debug: {
          timestamp: new Date().toISOString(),
          duration: '50ms',
          queries: ['SELECT * FROM products', 'SELECT * FROM categories']
        }
      });
    }
    
    return NextResponse.json({ result });
  } catch (error) {
    if (debugMode) {
      return NextResponse.json({
        error: error.message,
        stack: error.stack,
        context: { /* ... */ }
      }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 12.8 Metrics Dashboard

### Key Metrics to Track

```typescript
// lib/metrics.ts
export const metrics = {
  // Request metrics
  requestCount: 0,
  errorCount: 0,
  
  // Performance metrics
  avgResponseTime: 0,
  p95ResponseTime: 0,
  p99ResponseTime: 0,
  
  // Business metrics
  ordersCreated: 0,
  revenue: 0,
  activeUsers: 0,
  
  // Database metrics
  queryCount: 0,
  avgQueryTime: 0,
  slowQueries: 0,
  
  // Cache metrics
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRate: 0
};

export function trackMetric(name: keyof typeof metrics, value: number) {
  metrics[name] = value;
  
  // Send to monitoring service
  fetch('https://metrics.example.com/track', {
    method: 'POST',
    body: JSON.stringify({
      metric: name,
      value,
      timestamp: Date.now()
    })
  }).catch(console.error);
}
```

### Metrics Endpoint

```typescript
// app/api/metrics/route.ts
export async function GET(request: NextRequest) {
  // Require admin authentication
  const user = await getAuthenticatedUser(request);
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Gather metrics
  const metrics = {
    // System metrics
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    
    // Application metrics
    requests: await getRequestCount(),
    errors: await getErrorCount(),
    avgResponseTime: await getAvgResponseTime(),
    
    // Business metrics
    ordersToday: await getOrdersCount('today'),
    revenueToday: await getRevenue('today'),
    activeUsers: await getActiveUsersCount()
  };
  
  return NextResponse.json({ metrics });
}
```

## 12.9 Health Checks

### Comprehensive Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    redis: false,
    stripe: false,
    supabase: false
  };
  
  try {
    // Check database
    const { error: dbError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
    checks.database = !dbError;
    
    // Check Redis
    try {
      await redis.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    }
    
    // Check Stripe
    try {
      await stripe.balance.retrieve();
      checks.stripe = true;
    } catch {
      checks.stripe = false;
    }
    
    // Check Supabase
    checks.supabase = checks.database;
    
    const allHealthy = Object.values(checks).every(v => v);
    
    return NextResponse.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString()
      },
      { status: allHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
```

## 12.10 Debugging Tools

### Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# Filter by function
vercel logs --function=api/products

# Filter by time
vercel logs --since=1h
```

### Database Query Logs

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE ramenbae SET log_statement = 'all';

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Request Tracing

```typescript
// Add trace ID to requests
import { randomUUID } from 'crypto';

export function middleware(request: NextRequest) {
  const traceId = randomUUID();
  
  // Add to request
  request.headers.set('X-Trace-ID', traceId);
  
  // Log with trace ID
  logger.info({ traceId, path: request.nextUrl.pathname }, 'Request started');
  
  const response = NextResponse.next();
  response.headers.set('X-Trace-ID', traceId);
  
  return response;
}
```

## 12.11 Key Takeaways

- **Monitoring is essential** for production applications
- **Structured logging** makes debugging easier
- **Error tracking** (Sentry) catches issues automatically
- **Metrics** show application health
- **Alerts** notify you of critical issues
- **Health checks** ensure services are working
- **Trace IDs** help track requests across services

## Next Module Preview

In Module 13, we'll explore Advanced Database Concepts - optimization, transactions, and advanced queries!
