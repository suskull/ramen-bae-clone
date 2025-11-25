# Module 4: Authentication

Learn how to implement secure user authentication - think of it as secure user state management!

## What You'll Learn

- Authentication vs Authorization
- Sessions and tokens (JWT)
- Supabase Auth implementation
- Protected routes and API endpoints
- Social login (OAuth)
- User profiles and management
- Password reset flows

## Quick Start

1. Make sure you have Supabase configured
2. Work through exercises in order
3. Each exercise builds on the previous one
4. Test your auth flows thoroughly

## Structure

- `exercises/` - Hands-on coding exercises
- `theory/` - Conceptual explanations
- `examples/` - Reference implementations
- `QUICK-START.md` - Get started immediately
- `auth-reference.md` - Quick reference guide

## Prerequisites

- Completed Module 3 (APIs and HTTP)
- Supabase project set up
- Basic understanding of cookies/sessions
- Next.js App Router knowledge

## Learning Path

1. **Exercise 01**: Auth basics - Sign up and sign in
2. **Exercise 02**: Protected routes with middleware
3. **Exercise 03**: Social login (OAuth)
4. **Exercise 04**: User profiles and management
5. **Exercise 05**: Password reset and email verification
6. **Exercise 06**: Role-based authorization

## Key Concepts

### Authentication vs Authorization

**Authentication**: "Who are you?"
- Proving identity
- Login/signup
- Session management

**Authorization**: "What can you do?"
- Checking permissions
- Role-based access
- Resource ownership

### Frontend Analogy

Think of authentication like secure state management:

```javascript
// Frontend state (insecure)
const [user, setUser] = useState({ isAdmin: false });
// User can modify this in dev tools!

// Authentication (secure)
const { data: { user } } = await supabase.auth.getUser();
// Server verifies - can't be faked!
```

## Common Patterns

### Sign Up Flow
```
User enters email/password
  ↓
Frontend validates input
  ↓
Call Supabase auth.signUp()
  ↓
Supabase sends confirmation email
  ↓
User clicks link
  ↓
Account activated
```

### Sign In Flow
```
User enters credentials
  ↓
Call Supabase auth.signInWithPassword()
  ↓
Supabase verifies credentials
  ↓
Returns session token
  ↓
Store in cookies
  ↓
Redirect to dashboard
```

### Protected Route
```
User visits /dashboard
  ↓
Middleware checks auth
  ↓
If not authenticated → redirect to /login
  ↓
If authenticated → allow access
```

## Testing Your Auth

### Browser Console
```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log(user);

// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log(session);
```

### Common Issues

**"User not found"**
- Check email is confirmed
- Verify credentials are correct
- Check Supabase dashboard for user

**"Invalid JWT"**
- Session expired
- Clear cookies and sign in again
- Check token refresh logic

**"Redirect loop"**
- Middleware configuration issue
- Check protected route patterns
- Verify auth state checks

## Security Best Practices

1. **Never trust client-side auth state**
   - Always verify on server
   - Use middleware for protection

2. **Use HTTPS in production**
   - Cookies require secure connection
   - Prevents token interception

3. **Implement rate limiting**
   - Prevent brute force attacks
   - Limit login attempts

4. **Validate email addresses**
   - Require email confirmation
   - Prevent fake accounts

5. **Use strong password requirements**
   - Minimum length
   - Complexity rules
   - Check against common passwords

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT.io](https://jwt.io/) - Decode and verify JWTs
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Next Steps

After completing this module:
1. Move to Module 5: Supabase Ecosystem
2. Implement auth in your project
3. Add social login providers
4. Set up role-based permissions

Let's build secure authentication! 🔐
