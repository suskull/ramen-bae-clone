# Quick Start: Security Best Practices

Secure your application in 15 minutes!

## Security Checklist

Use this checklist to ensure your app is secure:

- [ ] Input validation on all user data
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] HTTPS only in production
- [ ] Secure headers
- [ ] Environment variables for secrets
- [ ] Rate limiting
- [ ] Authentication on sensitive routes
- [ ] Authorization checks

## Step 1: Input Validation (3 minutes)

### Use Zod for Validation

```typescript
import { z } from 'zod';

// Define schema
const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  email: z.string().email(),
  url: z.string().url().optional(),
});

// Validate input
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Safe to use validatedData
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### Sanitize HTML Input

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user HTML
const cleanHTML = DOMPurify.sanitize(userInput);

// ❌ NEVER do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Always sanitize first
<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />

// ✅ Or just use text
<div>{userInput}</div>
```

## Step 2: SQL Injection Prevention (2 minutes)

### Supabase Handles This!

```typescript
// ✅ SAFE - Supabase uses parameterized queries
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('name', userInput); // Safe!

// ❌ NEVER do raw SQL with user input
const query = `SELECT * FROM products WHERE name = '${userInput}'`; // VULNERABLE!
```

### If Using Raw SQL

```typescript
// ✅ Use parameterized queries
const { data } = await supabase.rpc('search_products', {
  search_term: userInput, // Passed as parameter
});
```

## Step 3: XSS Protection (3 minutes)

### React Escapes by Default

```typescript
// ✅ SAFE - React escapes automatically
<div>{userInput}</div>
<input value={userInput} />

// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ If you must use HTML, sanitize first
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Content Security Policy

**File**: `next.config.js`

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
            ].join('; '),
          },
        ],
      },
    ];
  },
};
```

## Step 4: Authentication & Authorization (3 minutes)

### Always Verify on Server

```typescript
// ❌ NEVER trust client-side auth
'use client';
const user = useAuth(); // Can be faked!
if (user.isAdmin) {
  // Show admin panel
}

// ✅ Always verify on server
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check role from database
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // User is authenticated AND authorized
  return NextResponse.json({ data: 'admin data' });
}
```

### Row Level Security

```sql
-- Enforce at database level
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Even if your code has bugs, users can't access others' data!
```

## Step 5: Rate Limiting (2 minutes)

### Simple Rate Limiting

```typescript
// lib/rate-limit.ts
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

// Usage in API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip, 10, 60000)) {
    // 10 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Process request
}
```

## Step 6: Secure Headers (2 minutes)

### Add Security Headers

**File**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}
```

## Common Vulnerabilities

### 1. SQL Injection

```typescript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SAFE
const { data } = await supabase.from('users').select('*').eq('email', email);
```

### 2. XSS (Cross-Site Scripting)

```typescript
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ SAFE
<div>{userComment}</div>
```

### 3. Insecure Direct Object Reference

```typescript
// ❌ VULNERABLE - User can access any order
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .single();
  return NextResponse.json({ order: data });
}

// ✅ SAFE - Check ownership
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id) // Verify ownership!
    .single();

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ order: data });
}
```

### 4. Exposed Secrets

```typescript
// ❌ NEVER commit secrets
const apiKey = 'sk_live_abc123'; // WRONG!

// ✅ Use environment variables
const apiKey = process.env.STRIPE_SECRET_KEY;

// ✅ Never expose server secrets to client
// Use NEXT_PUBLIC_ prefix only for public keys
const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
```

## Security Testing

### Test for SQL Injection

```typescript
// Try these inputs in your forms
const maliciousInputs = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "1' UNION SELECT * FROM users--",
];

// Your app should handle these safely
```

### Test for XSS

```typescript
// Try these inputs
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
];

// These should be escaped or sanitized
```

## Production Checklist

Before deploying:

- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Authentication on sensitive routes
- [ ] RLS policies on all tables
- [ ] Error messages don't expose internals
- [ ] Dependencies updated
- [ ] Security audit completed

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod#security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

Let's build secure applications! 🔒
