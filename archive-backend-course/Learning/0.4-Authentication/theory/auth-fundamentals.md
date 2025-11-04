# Authentication Fundamentals

Understanding authentication concepts through frontend analogies.

## What is Authentication?

**Authentication** = Proving who you are

Think of it like showing your ID at a concert - you prove you're the person who bought the ticket.

### Frontend State vs Authentication

**Frontend State (Temporary, Insecure)**:
```javascript
// This is NOT authentication!
const [currentUser, setCurrentUser] = useState({
  id: 1,
  email: 'user@example.com',
  isAdmin: false // User could change this in dev tools!
});

// Anyone can modify this
setCurrentUser({ ...currentUser, isAdmin: true }); // 😱 Security breach!
```

**Authentication (Persistent, Secure)**:
```javascript
// Server verifies identity and creates secure session
const { data: { user }, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});

// Server stores: "This user is authenticated"
// User can't fake this - it's verified on the server
```

## Authentication vs Authorization

### The Difference

| Aspect | Authentication | Authorization |
|--------|---------------|---------------|
| **Question** | Who are you? | What can you do? |
| **Purpose** | Verify identity | Check permissions |
| **Example** | Login with password | Admin access only |
| **Status Code** | 401 Unauthorized | 403 Forbidden |

**Frontend Analogy**:
- **Authentication** = Showing your ID to enter a building
- **Authorization** = Your ID badge determines which floors you can access

### Real-World Example

```typescript
// Authentication: Verify who the user is
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return { error: 'Not authenticated' }; // 401
}

// Authorization: Check what they can do
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return { error: 'Not authorized' }; // 403
}
```

## How Authentication Works

### Session-Based Authentication

**Frontend Analogy**: Like a ticket stub at a movie theater

```
1. User logs in with credentials
2. Server verifies credentials
3. Server creates session
4. Server sends session cookie
5. Browser stores cookie
6. Browser sends cookie with every request
7. Server verifies session
```

**Pros**:
- Server controls sessions
- Can revoke sessions
- Familiar pattern

**Cons**:
- Requires server-side storage
- Doesn't scale horizontally easily

### Token-Based Authentication (JWT)

**Frontend Analogy**: Like a tamper-proof wristband at a festival

```
1. User logs in with credentials
2. Server verifies credentials
3. Server creates JWT token
4. Client stores token
5. Client sends token with requests
6. Server verifies token signature
```

**JWT Structure**:
```javascript
// JWT = Header.Payload.Signature
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIn0.signature';

// Decoded payload (anyone can read this!)
{
  user_id: '123',
  email: 'user@example.com',
  exp: 1735689600 // Expiration
}

// But only server can verify the signature
```

**Pros**:
- Stateless (no server storage)
- Scales horizontally
- Works across domains

**Cons**:
- Can't revoke easily
- Larger than session IDs
- Payload is readable

## Authentication Flows

### Sign Up Flow

```
User enters email/password
  ↓
Frontend validates input
  ↓
Send to server
  ↓
Server hashes password
  ↓
Store in database
  ↓
Send confirmation email
  ↓
User clicks link
  ↓
Account activated
```

### Sign In Flow

```
User enters credentials
  ↓
Send to server
  ↓
Server finds user
  ↓
Server verifies password hash
  ↓
Server creates session/token
  ↓
Send to client
  ↓
Client stores session/token
  ↓
Redirect to dashboard
```

### OAuth Flow

```
User clicks "Sign in with Google"
  ↓
Redirect to Google
  ↓
User approves access
  ↓
Google redirects back with code
  ↓
Exchange code for user data
  ↓
Create/update user in database
  ↓
Create session
  ↓
Redirect to dashboard
```

## Password Security

### Hashing vs Encryption

**Encryption** (reversible):
```javascript
// Can decrypt back to original
const encrypted = encrypt('password123', key);
const original = decrypt(encrypted, key); // 'password123'
```

**Hashing** (one-way):
```javascript
// Cannot reverse back to original
const hashed = hash('password123'); // '$2b$10$...'
const isValid = compare('password123', hashed); // true
```

**Why hash passwords?**
- Even if database is compromised, passwords are safe
- Each password has unique hash (with salt)
- Impossible to reverse

### Password Best Practices

```typescript
// ✅ GOOD: Strong password requirements
const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase')
  .regex(/[a-z]/, 'At least one lowercase')
  .regex(/[0-9]/, 'At least one number')
  .regex(/[^A-Za-z0-9]/, 'At least one special character');

// ❌ BAD: Weak passwords
'password'
'123456'
'qwerty'
```

## Session Management

### Session Lifecycle

```typescript
// 1. Create session on login
const session = {
  userId: user.id,
  createdAt: Date.now(),
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
};

// 2. Store session
await redis.set(`session:${sessionId}`, JSON.stringify(session));

// 3. Verify session on each request
const session = await redis.get(`session:${sessionId}`);
if (!session || session.expiresAt < Date.now()) {
  return { error: 'Session expired' };
}

// 4. Refresh session
session.expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
await redis.set(`session:${sessionId}`, JSON.stringify(session));

// 5. Destroy session on logout
await redis.del(`session:${sessionId}`);
```

### Session Storage Options

| Storage | Pros | Cons |
|---------|------|------|
| **Cookies** | Automatic, secure | Size limit, same-domain |
| **localStorage** | Large storage | Not secure, XSS vulnerable |
| **sessionStorage** | Tab-specific | Lost on tab close |
| **Memory** | Fast | Lost on refresh |

**Best Practice**: Use httpOnly, secure cookies

```typescript
// ✅ GOOD: Secure cookie
response.cookies.set('session', sessionId, {
  httpOnly: true,  // Not accessible via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'lax', // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

// ❌ BAD: Insecure storage
localStorage.setItem('session', sessionId); // XSS vulnerable!
```

## Multi-Factor Authentication (MFA)

### What is MFA?

**Something you know** + **Something you have** = More secure

Examples:
- Password + SMS code
- Password + Authenticator app
- Password + Hardware key

### MFA Flow

```
User enters password
  ↓
Server verifies password
  ↓
Server sends MFA code
  ↓
User enters code
  ↓
Server verifies code
  ↓
Grant access
```

## Common Security Threats

### 1. Brute Force Attacks

**Attack**: Try many passwords until one works

**Defense**:
```typescript
// Rate limiting
const attempts = await redis.get(`login:${email}`);
if (attempts > 5) {
  return { error: 'Too many attempts. Try again in 15 minutes' };
}
```

### 2. Session Hijacking

**Attack**: Steal session token and impersonate user

**Defense**:
```typescript
// Bind session to IP and user agent
const session = {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
};

// Verify on each request
if (session.ip !== request.ip) {
  return { error: 'Session invalid' };
}
```

### 3. CSRF (Cross-Site Request Forgery)

**Attack**: Trick user into making unwanted requests

**Defense**:
```typescript
// CSRF token
const csrfToken = generateToken();
response.cookies.set('csrf', csrfToken);

// Verify on state-changing requests
if (request.body.csrfToken !== request.cookies.csrf) {
  return { error: 'Invalid CSRF token' };
}
```

## Best Practices

### 1. Never Trust Client-Side Auth

```typescript
// ❌ BAD: Client-side check only
'use client';
const user = useAuth();
if (user.isAdmin) {
  // Show admin panel
}

// ✅ GOOD: Server-side verification
export async function GET() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profile.role !== 'admin') {
    return { error: 'Forbidden' };
  }
}
```

### 2. Use HTTPS in Production

```typescript
// ✅ GOOD: Secure cookies require HTTPS
secure: process.env.NODE_ENV === 'production'
```

### 3. Implement Rate Limiting

```typescript
// Limit login attempts
const attempts = await redis.incr(`login:${email}`);
await redis.expire(`login:${email}`, 900); // 15 minutes

if (attempts > 5) {
  return { error: 'Too many attempts' };
}
```

### 4. Log Security Events

```typescript
// Log authentication events
await db.insert('auth_logs', {
  userId: user.id,
  event: 'login',
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date(),
});
```

## Key Takeaways

- Authentication proves identity, authorization checks permissions
- Never store passwords in plain text - always hash
- Use secure, httpOnly cookies for sessions
- Implement rate limiting to prevent brute force
- Always verify authentication on the server
- Use HTTPS in production
- Consider MFA for sensitive operations
- Log security events for monitoring

## Next Steps

- Implement basic authentication
- Add OAuth providers
- Set up password reset
- Implement role-based authorization
- Add MFA for extra security
