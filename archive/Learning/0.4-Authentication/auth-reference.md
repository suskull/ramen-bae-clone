# Authentication Quick Reference

## Supabase Auth Methods

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe', // Custom user metadata
    },
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});
```

### Sign In with Password
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In with OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google', // or 'github', 'facebook', etc.
  options: {
    redirectTo: 'https://yourapp.com/auth/callback',
  },
});
```

### Sign In with Magic Link
```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});
```

### Sign Out
```typescript
const { error } = await supabase.auth.signOut();
```

### Get Current User
```typescript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Get Session
```typescript
const { data: { session }, error } = await supabase.auth.getSession();
```

### Update User
```typescript
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com',
  password: 'newpassword',
  data: { name: 'New Name' },
});
```

### Reset Password (Request)
```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com',
  {
    redirectTo: 'https://yourapp.com/reset-password',
  }
);
```

### Reset Password (Update)
```typescript
const { data, error } = await supabase.auth.updateUser({
  password: 'newpassword123',
});
```

## Auth State Listening

### Listen to Auth Changes
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event);
    console.log('Session:', session);
    
    if (event === 'SIGNED_IN') {
      // User signed in
    }
    if (event === 'SIGNED_OUT') {
      // User signed out
    }
    if (event === 'TOKEN_REFRESHED') {
      // Token was refreshed
    }
  }
);

// Unsubscribe when done
subscription.unsubscribe();
```

## Middleware Pattern

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
     request.nextUrl.pathname.startsWith('/signup')) &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
```

## Protected API Route

```typescript
// app/api/protected/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'This is protected data',
    user: user.email,
  });
}
```

## Auth Context Provider

```typescript
// contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## User Metadata

### Set Metadata on Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
      role: 'user',
    },
  },
});
```

### Update Metadata
```typescript
const { data, error } = await supabase.auth.updateUser({
  data: {
    name: 'Jane Doe',
    avatar_url: 'https://example.com/new-avatar.jpg',
  },
});
```

### Access Metadata
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log(user?.user_metadata.name);
console.log(user?.user_metadata.avatar_url);
```

## Common Patterns

### Require Auth Hook
```typescript
// hooks/use-require-auth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return { user, loading };
}
```

### Protected Component
```typescript
// components/protected.tsx
'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
```

## Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful auth operation |
| 201 | Created | User account created |
| 400 | Bad Request | Invalid credentials format |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Authenticated but no permission |
| 422 | Unprocessable | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |

## Error Handling

```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.message) {
      case 'Invalid login credentials':
        // Show error to user
        break;
      case 'Email not confirmed':
        // Prompt to check email
        break;
      default:
        // Generic error
        break;
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Security Best Practices

1. **Always verify on server**: Never trust client-side auth state
2. **Use HTTPS**: Required for secure cookies
3. **Implement rate limiting**: Prevent brute force attacks
4. **Validate email**: Require email confirmation
5. **Strong passwords**: Enforce minimum requirements
6. **Refresh tokens**: Handle token expiration
7. **Secure cookies**: Use httpOnly, secure, sameSite flags
8. **Log auth events**: Monitor for suspicious activity

## Testing Auth

```typescript
// Test sign up
const testSignUp = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123',
  });
  console.log('Sign up:', data, error);
};

// Test sign in
const testSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123',
  });
  console.log('Sign in:', data, error);
};

// Test get user
const testGetUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  console.log('Current user:', user, error);
};
```
