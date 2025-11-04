# Module 8: Security Best Practices (Protecting Your Application)

## Learning Objectives
- Understand common security vulnerabilities
- Learn how to prevent SQL injection and XSS attacks
- Implement proper authentication and authorization
- Secure API endpoints and sensitive data
- Follow security best practices

## 8.1 Security Mindset

### Frontend vs Backend Security

**Frontend Security (Limited):**
```javascript
// ❌ This is NOT security!
if (user.role === 'admin') {
  showAdminPanel(); // User can modify this in dev tools
}
```

**Backend Security (Real):**
```javascript
// ✅ This IS security
export async function GET(request) {
  const user = await getAuthenticatedUser(request);
  if (user.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }
  // Only admins reach here
}
```

**WHY**: Frontend code runs in the user's browser (untrusted), backend runs on your server (trusted)

**Frontend analogy**: Frontend security is like a "Please don't enter" sign, backend security is like a locked door

## 8.2 Common Vulnerabilities (OWASP Top 10)

### 1. SQL Injection

**The Attack:**
```javascript
// ❌ DANGEROUS: User input directly in SQL
const userId = request.query.id; // User sends: "1 OR 1=1"
const query = `SELECT * FROM users WHERE id = ${userId}`;
// Executes: SELECT * FROM users WHERE id = 1 OR 1=1
// Returns ALL users! 😱
```

**The Fix:**
```javascript
// ✅ SAFE: Use parameterized queries
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId); // Supabase handles escaping

// Or with raw SQL:
const { data } = await supabase.rpc('get_user', {
  user_id: userId // Passed as parameter, not concatenated
});
```

**Frontend analogy:**
```javascript
// Like using template literals safely
const name = userInput;
// ❌ Dangerous
eval(`console.log("${name}")`); // User can inject code

// ✅ Safe
console.log(name); // Just logs the string
```

### 2. Cross-Site Scripting (XSS)

**The Attack:**
```javascript
// ❌ DANGEROUS: Rendering user input as HTML
const comment = '<script>alert("Hacked!")</script>';
element.innerHTML = comment; // Script executes!
```

**The Fix:**
```javascript
// ✅ SAFE: React escapes by default
<div>{comment}</div> // Renders as text, not HTML

// ✅ SAFE: Sanitize HTML if needed
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(comment);
element.innerHTML = clean;
```

**Backend validation:**
```typescript
// Validate and sanitize on backend too
import { z } from 'zod';

const reviewSchema = z.object({
  body: z.string()
    .min(10)
    .max(1000)
    .refine(val => !/<script/i.test(val), {
      message: 'HTML tags not allowed'
    })
});
```

### 3. Broken Authentication

**Common Mistakes:**
```javascript
// ❌ Storing passwords in plain text
await supabase.from('users').insert({
  email: 'user@example.com',
  password: 'password123' // NEVER DO THIS!
});

// ❌ Weak session management
const sessionId = Math.random().toString(); // Predictable!

// ❌ No rate limiting
// Attacker can try millions of passwords
```

**The Fix:**
```javascript
// ✅ Use Supabase Auth (handles hashing)
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123' // Supabase hashes this
});

// ✅ Strong session tokens
// Supabase uses JWT with cryptographic signatures

// ✅ Rate limiting
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
});

const { success } = await ratelimit.limit(ip);
if (!success) {
  return new Response('Too many requests', { status: 429 });
}
```

### 4. Sensitive Data Exposure

**Common Mistakes:**
```javascript
// ❌ Exposing sensitive data
return NextResponse.json({
  user: {
    id: user.id,
    email: user.email,
    password: user.password, // NEVER!
    ssn: user.ssn, // NEVER!
    creditCard: user.creditCard // NEVER!
  }
});

// ❌ Logging sensitive data
console.log('User logged in:', user.password); // NEVER!

// ❌ Storing API keys in frontend
const STRIPE_KEY = 'sk_live_...'; // NEVER!
```

**The Fix:**
```javascript
// ✅ Only return necessary data
return NextResponse.json({
  user: {
    id: user.id,
    email: user.email,
    name: user.name
    // No sensitive fields
  }
});

// ✅ Use environment variables
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY; // Server-side only

// ✅ Sanitize logs
console.log('User logged in:', { userId: user.id }); // No sensitive data
```

## 8.3 Authentication Security

### Password Requirements

```typescript
// Strong password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// Usage
try {
  passwordSchema.parse(userPassword);
} catch (error) {
  return NextResponse.json(
    { error: 'Password does not meet requirements' },
    { status: 400 }
  );
}
```

### Multi-Factor Authentication (MFA)

```typescript
// Enable MFA with Supabase
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});

// Verify MFA code
const { data, error } = await supabase.auth.mfa.verify({
  factorId: factorId,
  code: userCode
});
```

### Session Management

```typescript
// Secure session configuration
const sessionConfig = {
  maxAge: 60 * 60 * 24 * 7, // 7 days
  httpOnly: true, // Can't access via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection
  path: '/'
};

// Refresh tokens before expiry
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

## 8.4 Authorization (Access Control)

### Row Level Security (RLS)

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can only update their own data
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Only admins can delete
CREATE POLICY "Only admins can delete"
ON products FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);
```

### Role-Based Access Control (RBAC)

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check role for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### Permission Helper

```typescript
// lib/permissions.ts
export const permissions = {
  canEditProduct: (user: User, product: Product) => {
    return user.role === 'admin' || product.createdBy === user.id;
  },
  
  canDeleteReview: (user: User, review: Review) => {
    return user.role === 'admin' || review.userId === user.id;
  },
  
  canViewOrders: (user: User) => {
    return ['admin', 'staff'].includes(user.role);
  }
};

// Usage in API route
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  const review = await getReview(reviewId);
  
  if (!permissions.canDeleteReview(user, review)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Delete review
}
```

## 8.5 Input Validation

### Never Trust User Input

```typescript
// ❌ DANGEROUS: No validation
export async function POST(request: NextRequest) {
  const body = await request.json();
  await supabase.from('products').insert(body); // Anything goes!
}

// ✅ SAFE: Strict validation
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive().max(10000),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid(),
  inventory: z.number().int().min(0).default(0)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = productSchema.parse(body);
    
    await supabase.from('products').insert(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
  }
}
```

### Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content
const sanitizeHtml = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href']
  });
};

// Sanitize file names
const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .substring(0, 255); // Limit length
};
```

## 8.6 API Security

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true
});

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  // Process request
}
```

### CORS Configuration

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}
```

### API Key Authentication

```typescript
// For external API access
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }
  
  // Verify API key
  const { data: key } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .eq('active', true)
    .single();
  
  if (!key) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // Log usage
  await supabase
    .from('api_usage')
    .insert({
      api_key_id: key.id,
      endpoint: request.nextUrl.pathname,
      timestamp: new Date().toISOString()
    });
  
  // Process request
}
```

## 8.7 Secure File Uploads

### Validation

```typescript
// Validate file uploads
const validateFile = (file: File) => {
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
  if (!ext || !allowedExts.includes(ext)) {
    throw new Error('Invalid file extension');
  }
  
  return true;
};
```

### Secure Storage

```typescript
// Upload with security
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Validate
  validateFile(file);
  
  // Generate secure filename
  const ext = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const filePath = `uploads/${userId}/${fileName}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    });
  
  if (error) throw error;
  
  return NextResponse.json({ path: filePath });
}
```

## 8.8 Environment Variables

### Secure Configuration

```bash
# .env.local (NEVER commit to git!)

# Public (can be exposed to frontend)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # NEVER expose!
STRIPE_SECRET_KEY=sk_live_... # NEVER expose!
DATABASE_URL=postgresql://... # NEVER expose!
```

```typescript
// Validate environment variables at startup
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  DATABASE_URL: z.string().url()
});

try {
  envSchema.parse(process.env);
} catch (error) {
  console.error('Invalid environment variables:', error);
  process.exit(1);
}
```

## 8.9 Security Headers

### Next.js Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ];
  }
};
```

## 8.10 Logging and Monitoring

### Security Event Logging

```typescript
// lib/security-logger.ts
export const securityLog = {
  loginAttempt: async (email: string, success: boolean, ip: string) => {
    await supabase.from('security_logs').insert({
      event_type: 'login_attempt',
      email,
      success,
      ip_address: ip,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: async (userId: string, activity: string) => {
    await supabase.from('security_logs').insert({
      event_type: 'suspicious_activity',
      user_id: userId,
      description: activity,
      timestamp: new Date().toISOString()
    });
    
    // Alert admins
    await sendAlert('Suspicious activity detected', activity);
  }
};
```

## 8.11 Security Checklist

### Before Deployment

- [ ] All passwords are hashed (never stored in plain text)
- [ ] Environment variables are properly configured
- [ ] API keys are not exposed in frontend code
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize user input)
- [ ] CSRF protection enabled
- [ ] Rate limiting implemented
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Row Level Security (RLS) policies enabled
- [ ] File upload validation
- [ ] Error messages don't leak sensitive info
- [ ] Logging doesn't include sensitive data
- [ ] Dependencies are up to date (no known vulnerabilities)

## 8.12 Key Takeaways

- **Never trust user input** - Always validate and sanitize
- **Backend is the security boundary** - Frontend checks are for UX only
- **Use parameterized queries** - Prevent SQL injection
- **Hash passwords** - Never store plain text
- **Rate limit APIs** - Prevent abuse
- **Validate file uploads** - Check type, size, content
- **Use HTTPS** - Encrypt data in transit
- **Log security events** - Monitor for attacks
- **Keep dependencies updated** - Patch vulnerabilities

## Next Module Preview

In Module 9, we'll learn about Performance Optimization - how to make your backend fast and efficient!
