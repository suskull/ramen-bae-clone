# Sessions and Tokens Deep Dive

Understanding how sessions and tokens work in modern authentication.

## Session-Based Authentication

### How Sessions Work

**Frontend Analogy**: Like a coat check ticket at a restaurant

```
1. You give your coat (credentials)
2. They give you a ticket (session ID)
3. You show ticket to get your coat back
4. They verify ticket and return coat
```

### Session Flow

```typescript
// 1. User logs in
POST /api/auth/login
Body: { email, password }

// 2. Server creates session
const sessionId = generateId();
await redis.set(`session:${sessionId}`, {
  userId: user.id,
  createdAt: Date.now(),
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
});

// 3. Server sends session cookie
response.cookies.set('sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
});

// 4. Browser automatically sends cookie with requests
GET /api/profile
Cookie: sessionId=abc123

// 5. Server verifies session
const session = await redis.get(`session:${sessionId}`);
if (!session || session.expiresAt < Date.now()) {
  return { error: 'Session expired' };
}
```

### Session Storage

**Options**:
1. **Memory** (development only)
2. **Redis** (recommended)
3. **Database** (slower but persistent)
4. **File system** (not recommended)

**Redis Example**:
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Store session
await redis.set(`session:${sessionId}`, JSON.stringify(session), {
  ex: 60 * 60 * 24 * 7, // 7 days
});

// Get session
const session = await redis.get(`session:${sessionId}`);

// Delete session
await redis.del(`session:${sessionId}`);
```

## Token-Based Authentication (JWT)

### JWT Structure

```
Header.Payload.Signature
```

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "user-123",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}
```

**Signature**:
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### JWT Flow

```typescript
// 1. User logs in
POST /api/auth/login
Body: { email, password }

// 2. Server creates JWT
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role,
  },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);

// 3. Server sends token
return { token };

// 4. Client stores token
localStorage.setItem('token', token);

// 5. Client sends token with requests
GET /api/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 6. Server verifies token
const token = request.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

### JWT vs Sessions

| Feature | Sessions | JWT |
|---------|----------|-----|
| **Storage** | Server-side | Client-side |
| **Scalability** | Harder | Easier |
| **Revocation** | Easy | Hard |
| **Size** | Small (ID only) | Large (contains data) |
| **Security** | More secure | Less secure |
| **Stateless** | No | Yes |

## Refresh Tokens

### Why Refresh Tokens?

**Problem**: Access tokens should be short-lived for security, but users don't want to log in frequently.

**Solution**: Use two tokens:
- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)

### Refresh Token Flow

```typescript
// 1. Login returns both tokens
{
  accessToken: 'short-lived-token',
  refreshToken: 'long-lived-token'
}

// 2. Use access token for requests
GET /api/profile
Authorization: Bearer short-lived-token

// 3. When access token expires
Response: 401 Unauthorized

// 4. Use refresh token to get new access token
POST /api/auth/refresh
Body: { refreshToken: 'long-lived-token' }

// 5. Server verifies refresh token and issues new access token
{
  accessToken: 'new-short-lived-token'
}

// 6. Retry original request with new token
GET /api/profile
Authorization: Bearer new-short-lived-token
```

### Implementation

```typescript
// Generate tokens
function generateTokens(user: User) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// Refresh endpoint
export async function POST(request: Request) {
  const { refreshToken } = await request.json();

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await db.users.findById(decoded.sub);
    const { accessToken } = generateTokens(user);

    return NextResponse.json({ accessToken });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
```

## Supabase Auth

### How Supabase Handles Auth

Supabase uses **JWT tokens** with **automatic refresh**:

```typescript
// 1. Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Supabase stores tokens in cookies/localStorage
// Access token: 1 hour
// Refresh token: 7 days

// 2. Supabase automatically refreshes tokens
// You don't need to handle this manually!

// 3. Get current user
const { data: { user } } = await supabase.auth.getUser();

// 4. Get session
const { data: { session } } = await supabase.auth.getSession();
```

### Supabase Session Structure

```typescript
{
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refresh_token: 'v1.MRjVsZXNzIGFjY2Vzc190b2tlbiBhbmQgcmVmcmVzaF90b2tlbg...',
  expires_in: 3600,
  expires_at: 1735689600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'user@example.com',
    // ... other user data
  }
}
```

## Security Considerations

### 1. Token Storage

```typescript
// ❌ BAD: localStorage (XSS vulnerable)
localStorage.setItem('token', token);

// ✅ GOOD: httpOnly cookie
response.cookies.set('token', token, {
  httpOnly: true,  // Not accessible via JavaScript
  secure: true,    // HTTPS only
  sameSite: 'lax', // CSRF protection
});
```

### 2. Token Expiration

```typescript
// ✅ GOOD: Short-lived access tokens
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

// ✅ GOOD: Long-lived refresh tokens
const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });
```

### 3. Token Revocation

```typescript
// Store refresh tokens in database
await db.refreshTokens.create({
  userId: user.id,
  token: refreshToken,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// Revoke on logout
await db.refreshTokens.delete({ token: refreshToken });

// Check if token is revoked
const tokenExists = await db.refreshTokens.findOne({ token: refreshToken });
if (!tokenExists) {
  return { error: 'Token revoked' };
}
```

### 4. Token Rotation

```typescript
// Issue new refresh token on each refresh
export async function POST(request: Request) {
  const { refreshToken: oldToken } = await request.json();

  // Verify old token
  const decoded = jwt.verify(oldToken, process.env.JWT_REFRESH_SECRET!);

  // Generate new tokens
  const { accessToken, refreshToken: newToken } = generateTokens(user);

  // Revoke old token
  await db.refreshTokens.delete({ token: oldToken });

  // Store new token
  await db.refreshTokens.create({
    userId: user.id,
    token: newToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return NextResponse.json({ accessToken, refreshToken: newToken });
}
```

## Best Practices

1. **Use httpOnly cookies** for tokens
2. **Implement refresh tokens** for better UX
3. **Keep access tokens short-lived** (15 minutes)
4. **Rotate refresh tokens** on use
5. **Store refresh tokens** in database for revocation
6. **Use HTTPS** in production
7. **Implement token blacklisting** for logout
8. **Monitor token usage** for suspicious activity

## Key Takeaways

- Sessions store state on server, tokens on client
- JWT tokens are stateless and scalable
- Refresh tokens enable long sessions with short-lived access tokens
- Always use httpOnly, secure cookies
- Supabase handles token management automatically
- Implement proper token revocation for security

## Next Steps

- Implement session-based auth
- Try JWT authentication
- Add refresh token flow
- Secure token storage
- Monitor auth events
